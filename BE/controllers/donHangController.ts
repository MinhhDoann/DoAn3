import { Request, Response } from 'express';
import sql from 'mssql';
import { connectDB } from '../config/db';

const DONHANG_SELECT_QUERY = `
  SELECT 
    dh.ma_don_hang,
    dh.ma_khach_hang,
    dt.ten_doi_tac as ten_khach_hang,
    dh.ngay_ban,
    (SELECT SUM(gia_ban) FROM ChiTietDonHang WHERE ma_don_hang = dh.ma_don_hang) as tong_tien
  FROM DonHang dh
  LEFT JOIN DoiTac dt ON dh.ma_khach_hang = dt.ma_doi_tac
`;

export const getAllDonHang = async (_req: Request, res: Response) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`${DONHANG_SELECT_QUERY} ORDER BY dh.ma_don_hang ASC`);
        res.status(200).json(result.recordset);
    } catch (err: any) {
        res.status(500).json({ message: 'Lỗi lấy danh sách đơn hàng', error: err.message });
    }
};

export const getDonHangById = async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
        const pool = await connectDB();
        const orderResult = await pool.request()
            .input('id', sql.Int, id)
            .query(`${DONHANG_SELECT_QUERY} WHERE dh.ma_don_hang = @id`);

        if (orderResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        const detailsResult = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT 
                    ct.ma_chi_tiet,
                    ct.ma_san_pham,
                    sp.ten_san_pham,
                    ct.ma_serial,
                    ct.gia_ban
                FROM ChiTietDonHang ct
                LEFT JOIN SanPham sp ON ct.ma_san_pham = sp.ma_san_pham
                WHERE ct.ma_don_hang = @id
            `);

        const order = orderResult.recordset[0];
        order.details = detailsResult.recordset;

        res.status(200).json(order);
    } catch (err: any) {
        res.status(500).json({ message: 'Lỗi lấy chi tiết đơn hàng', error: err.message });
    }
};

export const createDonHang = async (req: Request, res: Response) => {
    const { ma_khach_hang, ngay_ban, details } = req.body;
    let pool;
    try {
        pool = await connectDB();
    } catch (err: any) {
        return res.status(500).json({ message: 'Lỗi kết nối database', error: err.message });
    }

    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        const orderResult = await transaction.request()
            .input('ma_khach_hang', sql.Int, ma_khach_hang)
            .input('ngay_ban', sql.DateTime, ngay_ban || new Date())
            .query(`
                INSERT INTO DonHang (ma_khach_hang, ngay_ban)
                OUTPUT INSERTED.ma_don_hang
                VALUES (@ma_khach_hang, @ngay_ban)
            `);

        const ma_don_hang = orderResult.recordset[0].ma_don_hang;

        if (details && Array.isArray(details)) {
            for (const item of details) {
                await transaction.request()
                    .input('ma_don_hang', sql.Int, ma_don_hang)
                    .input('ma_san_pham', sql.Int, item.ma_san_pham)
                    .input('ma_serial', sql.NVarChar(50), item.ma_serial)
                    .input('gia_ban', sql.Decimal(18, 2), item.gia_ban)
                    .query(`
                        INSERT INTO ChiTietDonHang (ma_don_hang, ma_san_pham, ma_serial, gia_ban)
                        VALUES (@ma_don_hang, @ma_san_pham, @ma_serial, @gia_ban)
                    `);

                await transaction.request()
                    .input('ma_san_pham', sql.Int, item.ma_san_pham)
                    .query(`
                        UPDATE SanPham SET so_luong_ton = so_luong_ton - 1 
                        WHERE ma_san_pham = @ma_san_pham
                    `);
            }
        }

        await transaction.commit();
        res.status(201).json({ ma_don_hang, message: 'Tạo đơn hàng thành công' });
    } catch (err: any) {
        if (transaction) await transaction.rollback();
        res.status(500).json({ message: 'Lỗi tạo đơn hàng', error: err.message });
    }
};

export const updateDonHang = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { ma_khach_hang, ngay_ban } = req.body;
    try {
        const pool = await connectDB();
        await pool.request()
            .input('id', sql.Int, id)
            .input('ma_khach_hang', sql.Int, ma_khach_hang)
            .input('ngay_ban', sql.DateTime, ngay_ban)
            .query(`
        UPDATE DonHang SET
          ma_khach_hang = ISNULL(@ma_khach_hang, ma_khach_hang),
          ngay_ban = ISNULL(@ngay_ban, ngay_ban)
        WHERE ma_don_hang = @id
      `);

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`${DONHANG_SELECT_QUERY} WHERE dh.ma_don_hang = @id`);

        res.status(200).json(result.recordset[0]);
    } catch (err: any) {
        res.status(500).json({ message: 'Lỗi cập nhật đơn hàng', error: err.message });
    }
};

export const deleteDonHang = async (req: Request, res: Response) => {
    const id = req.params.id;
    let pool;
    try {
        pool = await connectDB();
    } catch (err: any) {
        return res.status(500).json({ message: 'Lỗi kết nối database', error: err.message });
    }

    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        const details = await transaction.request()
            .input('id', sql.Int, id)
            .query('SELECT ma_san_pham FROM ChiTietDonHang WHERE ma_don_hang = @id');

        for (const item of details.recordset) {
            await transaction.request()
                .input('ma_san_pham', sql.Int, item.ma_san_pham)
                .query('UPDATE SanPham SET so_luong_ton = so_luong_ton + 1 WHERE ma_san_pham = @ma_san_pham');
        }

        await transaction.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM ChiTietDonHang WHERE ma_don_hang = @id');

        const result = await transaction.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM DonHang WHERE ma_don_hang = @id');

        if (result.rowsAffected[0] === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng để xóa' });
        }

        await transaction.commit();
        res.status(200).json({ message: 'Xóa đơn hàng thành công' });
    } catch (err: any) {
        if (transaction) await transaction.rollback();
        res.status(500).json({ message: 'Lỗi khi xóa đơn hàng', error: err.message });
    }
};
