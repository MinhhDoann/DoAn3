import { Request, Response } from 'express';
import sql from 'mssql';
import { connectDB } from '../config/db';

const PHIEUTRA_SELECT_QUERY = `
  SELECT 
    p.ma_phieu_tra,
    p.ma_don_hang,
    p.ngay_tra,
    p.ma_serial,
    dt.ten_doi_tac as ten_khach_hang,
    sp.ten_san_pham,
    sp.ma_san_pham
  FROM PhieuTraHang p
  LEFT JOIN DonHang dh ON p.ma_don_hang = dh.ma_don_hang
  LEFT JOIN DoiTac dt ON dh.ma_khach_hang = dt.ma_doi_tac
  LEFT JOIN ChiTietDonHang ct ON p.ma_don_hang = ct.ma_don_hang AND p.ma_serial = ct.ma_serial
  LEFT JOIN SanPham sp ON ct.ma_san_pham = sp.ma_san_pham
`;

export const getAllPhieuTraHang = async (_req: Request, res: Response) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`${PHIEUTRA_SELECT_QUERY} ORDER BY p.ma_phieu_tra ASC`);
        res.status(200).json(result.recordset);
    } catch (err: any) {
        res.status(500).json({ message: 'Lỗi lấy danh sách phiếu trả hàng', error: err.message });
    }
};

export const getPhieuTraHangById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`${PHIEUTRA_SELECT_QUERY} WHERE p.ma_phieu_tra = @id`);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy phiếu trả hàng' });
        }
        res.status(200).json(result.recordset[0]);
    } catch (err: any) {
        res.status(500).json({ message: 'Lỗi lấy chi tiết phiếu trả hàng', error: err.message });
    }
};

export const createPhieuTraHang = async (req: Request, res: Response) => {
    const { ma_don_hang, ma_serial, ngay_tra } = req.body;

    if (!ma_don_hang || !ma_serial) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ mã đơn hàng và mã serial' });
    }

    let pool;
    try {
        pool = await connectDB();
    } catch (err: any) {
        return res.status(500).json({ message: 'Lỗi kết nối database', error: err.message });
    }

    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        const checkOrderDetails = await transaction.request()
            .input('ma_don_hang', sql.Int, ma_don_hang)
            .input('ma_serial', sql.NVarChar(50), ma_serial)
            .query('SELECT ma_san_pham FROM ChiTietDonHang WHERE ma_don_hang = @ma_don_hang AND ma_serial = @ma_serial');

        if (checkOrderDetails.recordset.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Mã serial này không tồn tại trong đơn hàng đã chọn' });
        }

        const ma_san_pham = checkOrderDetails.recordset[0].ma_san_pham;

        const checkReturned = await transaction.request()
            .input('ma_don_hang', sql.Int, ma_don_hang)
            .input('ma_serial', sql.NVarChar(50), ma_serial)
            .query('SELECT ma_phieu_tra FROM PhieuTraHang WHERE ma_don_hang = @ma_don_hang AND ma_serial = @ma_serial');

        if (checkReturned.recordset.length > 0) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Mã serial của đơn hàng này đã được trả lại trước đó' });
        }

        const insertResult = await transaction.request()
            .input('ma_don_hang', sql.Int, ma_don_hang)
            .input('ngay_tra', sql.DateTime, ngay_tra || new Date())
            .input('ma_serial', sql.NVarChar(50), ma_serial)
            .query(`
                INSERT INTO PhieuTraHang (ma_don_hang, ngay_tra, ma_serial)
                OUTPUT INSERTED.ma_phieu_tra
                VALUES (@ma_don_hang, @ngay_tra, @ma_serial)
            `);

        const newId = insertResult.recordset[0].ma_phieu_tra;

        await transaction.request()
            .input('ma_san_pham', sql.Int, ma_san_pham)
            .query('UPDATE SanPham SET so_luong_ton = so_luong_ton + 1 WHERE ma_san_pham = @ma_san_pham');

        await transaction.commit();

        const finalResult = await pool.request()
            .input('id', sql.Int, newId)
            .query(`${PHIEUTRA_SELECT_QUERY} WHERE p.ma_phieu_tra = @id`);

        res.status(201).json(finalResult.recordset[0]);
    } catch (err: any) {
        if (transaction) await transaction.rollback();
        console.error('Lỗi khi tạo phiếu trả hàng:', err);
        res.status(500).json({ message: 'Lỗi tạo phiếu trả hàng', error: err.message });
    }
};

export const updatePhieuTraHang = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { ma_don_hang, ma_serial, ngay_tra } = req.body;

    if (!ma_don_hang || !ma_serial) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ mã đơn hàng và mã serial' });
    }

    let pool;
    try {
        pool = await connectDB();
    } catch (err: any) {
        return res.status(500).json({ message: 'Lỗi kết nối database', error: err.message });
    }

    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        const oldResult = await transaction.request()
            .input('id', sql.Int, id)
            .query('SELECT ma_don_hang, ma_serial FROM PhieuTraHang WHERE ma_phieu_tra = @id');

        if (oldResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Không tìm thấy phiếu trả hàng' });
        }

        const oldRow = oldResult.recordset[0];

        if (oldRow.ma_don_hang !== ma_don_hang || oldRow.ma_serial !== ma_serial) {
            const oldProductResult = await transaction.request()
                .input('ma_don_hang', sql.Int, oldRow.ma_don_hang)
                .input('ma_serial', sql.NVarChar(50), oldRow.ma_serial)
                .query('SELECT ma_san_pham FROM ChiTietDonHang WHERE ma_don_hang = @ma_don_hang AND ma_serial = @ma_serial');

            if (oldProductResult.recordset.length > 0) {
                const old_ma_san_pham = oldProductResult.recordset[0].ma_san_pham;
                await transaction.request()
                    .input('ma_san_pham', sql.Int, old_ma_san_pham)
                    .query('UPDATE SanPham SET so_luong_ton = so_luong_ton - 1 WHERE ma_san_pham = @ma_san_pham');
            }

            const newProductResult = await transaction.request()
                .input('ma_don_hang', sql.Int, ma_don_hang)
                .input('ma_serial', sql.NVarChar(50), ma_serial)
                .query('SELECT ma_san_pham FROM ChiTietDonHang WHERE ma_don_hang = @ma_don_hang AND ma_serial = @ma_serial');

            if (newProductResult.recordset.length === 0) {
                await transaction.rollback();
                return res.status(400).json({ message: 'Mã serial mới này không tồn tại trong đơn hàng mới' });
            }

            const new_ma_san_pham = newProductResult.recordset[0].ma_san_pham;
            const checkReturned = await transaction.request()
                .input('id', sql.Int, id)
                .input('ma_don_hang', sql.Int, ma_don_hang)
                .input('ma_serial', sql.NVarChar(50), ma_serial)
                .query('SELECT ma_phieu_tra FROM PhieuTraHang WHERE ma_don_hang = @ma_don_hang AND ma_serial = @ma_serial AND ma_phieu_tra <> @id');

            if (checkReturned.recordset.length > 0) {
                await transaction.rollback();
                return res.status(400).json({ message: 'Mã serial mới này đã được trả lại bởi một phiếu khác trước đó' });
            }

            await transaction.request()
                .input('ma_san_pham', sql.Int, new_ma_san_pham)
                .query('UPDATE SanPham SET so_luong_ton = so_luong_ton + 1 WHERE ma_san_pham = @ma_san_pham');
        }

        await transaction.request()
            .input('id', sql.Int, id)
            .input('ma_don_hang', sql.Int, ma_don_hang)
            .input('ma_serial', sql.NVarChar(50), ma_serial)
            .input('ngay_tra', sql.DateTime, ngay_tra || new Date())
            .query(`
                UPDATE PhieuTraHang SET
                    ma_don_hang = @ma_don_hang,
                    ma_serial = @ma_serial,
                    ngay_tra = @ngay_tra
                WHERE ma_phieu_tra = @id
            `);

        await transaction.commit();

        const finalResult = await pool.request()
            .input('id', sql.Int, id)
            .query(`${PHIEUTRA_SELECT_QUERY} WHERE p.ma_phieu_tra = @id`);

        res.status(200).json(finalResult.recordset[0]);
    } catch (err: any) {
        if (transaction) await transaction.rollback();
        console.error('Lỗi khi cập nhật phiếu trả hàng:', err);
        res.status(500).json({ message: 'Lỗi cập nhật phiếu trả hàng', error: err.message });
    }
};

export const deletePhieuTraHang = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    let pool;
    try {
        pool = await connectDB();
    } catch (err: any) {
        return res.status(500).json({ message: 'Lỗi kết nối database', error: err.message });
    }

    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();
        const oldResult = await transaction.request()
            .input('id', sql.Int, id)
            .query('SELECT ma_don_hang, ma_serial FROM PhieuTraHang WHERE ma_phieu_tra = @id');

        if (oldResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Không tìm thấy phiếu trả hàng để xóa' });
        }

        const oldRow = oldResult.recordset[0];
        const oldProductResult = await transaction.request()
            .input('ma_don_hang', sql.Int, oldRow.ma_don_hang)
            .input('ma_serial', sql.NVarChar(50), oldRow.ma_serial)
            .query('SELECT ma_san_pham FROM ChiTietDonHang WHERE ma_don_hang = @ma_don_hang AND ma_serial = @ma_serial');

        if (oldProductResult.recordset.length > 0) {
            const old_ma_san_pham = oldProductResult.recordset[0].ma_san_pham;
            await transaction.request()
                .input('ma_san_pham', sql.Int, old_ma_san_pham)
                .query('UPDATE SanPham SET so_luong_ton = so_luong_ton - 1 WHERE ma_san_pham = @ma_san_pham');
        }

        const result = await transaction.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM PhieuTraHang WHERE ma_phieu_tra = @id');

        if (result.rowsAffected[0] === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Không thể xóa phiếu trả hàng' });
        }

        await transaction.commit();
        res.status(200).json({ message: 'Xóa phiếu trả hàng thành công' });
    } catch (err: any) {
        if (transaction) await transaction.rollback();
        console.error('Lỗi khi xóa phiếu trả hàng:', err);
        res.status(500).json({ message: 'Lỗi khi xóa phiếu trả hàng', error: err.message });
    }
};
