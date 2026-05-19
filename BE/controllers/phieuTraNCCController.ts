import { Request, Response } from 'express';
import sql from 'mssql';
import { connectDB } from '../config/db';

const PHIEUTRANCC_SELECT_QUERY = `
  SELECT 
    p.ma_phieu_tra_ncc,
    p.ma_ncc,
    p.ngay_tra,
    p.ma_serial,
    dt.ten_doi_tac as ten_ncc,
    sp.ten_san_pham,
    sp.ma_san_pham
  FROM PhieuTraNCC p
  LEFT JOIN DoiTac dt ON p.ma_ncc = dt.ma_doi_tac
  LEFT JOIN ChiTietDonHang ct ON p.ma_serial = ct.ma_serial
  LEFT JOIN SanPham sp ON ct.ma_san_pham = sp.ma_san_pham
`;

export const getAllPhieuTraNCC = async (_req: Request, res: Response) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`${PHIEUTRANCC_SELECT_QUERY} ORDER BY p.ma_phieu_tra_ncc ASC`);
        res.status(200).json(result.recordset);
    } catch (err: any) {
        res.status(500).json({ message: 'Lỗi lấy danh sách phiếu trả NCC', error: err.message });
    }
};

export const getPhieuTraNCCById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`${PHIEUTRANCC_SELECT_QUERY} WHERE p.ma_phieu_tra_ncc = @id`);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy phiếu trả NCC' });
        }
        res.status(200).json(result.recordset[0]);
    } catch (err: any) {
        res.status(500).json({ message: 'Lỗi lấy chi tiết phiếu trả NCC', error: err.message });
    }
};

export const createPhieuTraNCC = async (req: Request, res: Response) => {
    const { ma_ncc, ma_serial, ngay_tra } = req.body;
    
    if (!ma_ncc || !ma_serial) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ nhà cung cấp và mã serial' });
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

        // 1. Tìm sản phẩm tương ứng với mã serial để trừ tồn kho
        const checkSerial = await transaction.request()
            .input('ma_serial', sql.NVarChar(50), ma_serial)
            .query('SELECT TOP 1 ma_san_pham FROM ChiTietDonHang WHERE ma_serial = @ma_serial');

        let ma_san_pham: number | null = null;
        if (checkSerial.recordset.length > 0) {
            ma_san_pham = checkSerial.recordset[0].ma_san_pham;
        }

        // 2. Kiểm tra xem mã serial này đã được trả cho NCC chưa
        const checkReturned = await transaction.request()
            .input('ma_serial', sql.NVarChar(50), ma_serial)
            .query('SELECT ma_phieu_tra_ncc FROM PhieuTraNCC WHERE ma_serial = @ma_serial');

        if (checkReturned.recordset.length > 0) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Mã serial này đã được hoàn trả cho NCC trước đó' });
        }

        // 3. Thêm mới phiếu trả NCC
        const insertResult = await transaction.request()
            .input('ma_ncc', sql.Int, ma_ncc)
            .input('ngay_tra', sql.DateTime, ngay_tra || new Date())
            .input('ma_serial', sql.NVarChar(50), ma_serial)
            .query(`
                INSERT INTO PhieuTraNCC (ma_ncc, ngay_tra, ma_serial)
                OUTPUT INSERTED.ma_phieu_tra_ncc
                VALUES (@ma_ncc, @ngay_tra, @ma_serial)
            `);

        const newId = insertResult.recordset[0].ma_phieu_tra_ncc;

        // 4. Nếu tìm thấy sản phẩm, trừ tồn kho (vì đã xuất trả NCC)
        if (ma_san_pham) {
            await transaction.request()
                .input('ma_san_pham', sql.Int, ma_san_pham)
                .query('UPDATE SanPham SET so_luong_ton = so_luong_ton - 1 WHERE ma_san_pham = @ma_san_pham');
        }

        await transaction.commit();

        const finalResult = await pool.request()
            .input('id', sql.Int, newId)
            .query(`${PHIEUTRANCC_SELECT_QUERY} WHERE p.ma_phieu_tra_ncc = @id`);

        res.status(201).json(finalResult.recordset[0]);
    } catch (err: any) {
        if (transaction) await transaction.rollback();
        console.error('Lỗi khi tạo phiếu trả NCC:', err);
        res.status(500).json({ message: 'Lỗi tạo phiếu trả NCC', error: err.message });
    }
};

export const updatePhieuTraNCC = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { ma_ncc, ma_serial, ngay_tra } = req.body;

    if (!ma_ncc || !ma_serial) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ nhà cung cấp và mã serial' });
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

        // Lấy thông tin cũ
        const oldResult = await transaction.request()
            .input('id', sql.Int, id)
            .query('SELECT ma_ncc, ma_serial FROM PhieuTraNCC WHERE ma_phieu_tra_ncc = @id');

        if (oldResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Không tìm thấy phiếu trả NCC' });
        }

        const oldRow = oldResult.recordset[0];

        // Nếu thay đổi ma_serial
        if (oldRow.ma_serial !== ma_serial) {
            // 1. Hoàn lại tồn kho cho sản phẩm cũ (cộng thêm 1)
            const oldProductResult = await transaction.request()
                .input('ma_serial', sql.NVarChar(50), oldRow.ma_serial)
                .query('SELECT TOP 1 ma_san_pham FROM ChiTietDonHang WHERE ma_serial = @ma_serial');
            
            if (oldProductResult.recordset.length > 0) {
                const old_ma_san_pham = oldProductResult.recordset[0].ma_san_pham;
                await transaction.request()
                    .input('ma_san_pham', sql.Int, old_ma_san_pham)
                    .query('UPDATE SanPham SET so_luong_ton = so_luong_ton + 1 WHERE ma_san_pham = @ma_san_pham');
            }

            // 2. Kiểm tra xem mã serial mới này đã được trả bởi phiếu khác chưa
            const checkReturned = await transaction.request()
                .input('id', sql.Int, id)
                .input('ma_serial', sql.NVarChar(50), ma_serial)
                .query('SELECT ma_phieu_tra_ncc FROM PhieuTraNCC WHERE ma_serial = @ma_serial AND ma_phieu_tra_ncc <> @id');

            if (checkReturned.recordset.length > 0) {
                await transaction.rollback();
                return res.status(400).json({ message: 'Mã serial mới này đã được trả bởi phiếu khác trước đó' });
            }

            // 3. Trừ tồn kho cho sản phẩm mới (trừ đi 1)
            const newProductResult = await transaction.request()
                .input('ma_serial', sql.NVarChar(50), ma_serial)
                .query('SELECT TOP 1 ma_san_pham FROM ChiTietDonHang WHERE ma_serial = @ma_serial');

            if (newProductResult.recordset.length > 0) {
                const new_ma_san_pham = newProductResult.recordset[0].ma_san_pham;
                await transaction.request()
                    .input('ma_san_pham', sql.Int, new_ma_san_pham)
                    .query('UPDATE SanPham SET so_luong_ton = so_luong_ton - 1 WHERE ma_san_pham = @ma_san_pham');
            }
        }

        // Cập nhật phiếu trả
        await transaction.request()
            .input('id', sql.Int, id)
            .input('ma_ncc', sql.Int, ma_ncc)
            .input('ma_serial', sql.NVarChar(50), ma_serial)
            .input('ngay_tra', sql.DateTime, ngay_tra || new Date())
            .query(`
                UPDATE PhieuTraNCC SET
                    ma_ncc = @ma_ncc,
                    ma_serial = @ma_serial,
                    ngay_tra = @ngay_tra
                WHERE ma_phieu_tra_ncc = @id
            `);

        await transaction.commit();

        const finalResult = await pool.request()
            .input('id', sql.Int, id)
            .query(`${PHIEUTRANCC_SELECT_QUERY} WHERE p.ma_phieu_tra_ncc = @id`);

        res.status(200).json(finalResult.recordset[0]);
    } catch (err: any) {
        if (transaction) await transaction.rollback();
        console.error('Lỗi khi cập nhật phiếu trả NCC:', err);
        res.status(500).json({ message: 'Lỗi cập nhật phiếu trả NCC', error: err.message });
    }
};

export const deletePhieuTraNCC = async (req: Request, res: Response) => {
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

        // Lấy thông tin phiếu trả
        const oldResult = await transaction.request()
            .input('id', sql.Int, id)
            .query('SELECT ma_serial FROM PhieuTraNCC WHERE ma_phieu_tra_ncc = @id');

        if (oldResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Không tìm thấy phiếu trả NCC để xóa' });
        }

        const oldRow = oldResult.recordset[0];

        // Hoàn lại tồn kho cho sản phẩm (cộng thêm 1)
        const oldProductResult = await transaction.request()
            .input('ma_serial', sql.NVarChar(50), oldRow.ma_serial)
            .query('SELECT TOP 1 ma_san_pham FROM ChiTietDonHang WHERE ma_serial = @ma_serial');
        
        if (oldProductResult.recordset.length > 0) {
            const old_ma_san_pham = oldProductResult.recordset[0].ma_san_pham;
            await transaction.request()
                .input('ma_san_pham', sql.Int, old_ma_san_pham)
                .query('UPDATE SanPham SET so_luong_ton = so_luong_ton + 1 WHERE ma_san_pham = @ma_san_pham');
        }

        // Xóa phiếu trả
        const result = await transaction.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM PhieuTraNCC WHERE ma_phieu_tra_ncc = @id');

        if (result.rowsAffected[0] === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Không thể xóa phiếu trả NCC' });
        }

        await transaction.commit();
        res.status(200).json({ message: 'Xóa phiếu trả NCC thành công' });
    } catch (err: any) {
        if (transaction) await transaction.rollback();
        console.error('Lỗi khi xóa phiếu trả NCC:', err);
        res.status(500).json({ message: 'Lỗi khi xóa phiếu trả NCC', error: err.message });
    }
};
