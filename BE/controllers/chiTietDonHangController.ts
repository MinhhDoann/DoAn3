import { Request, Response } from 'express';
import sql from 'mssql';
import { connectDB } from '../config/db';

const CHITIET_SELECT_QUERY = `
  SELECT 
    ct.ma_chi_tiet,
    ct.ma_don_hang,
    ct.ma_san_pham,
    sp.ten_san_pham,
    ct.gia_ban,
    ct.ma_serial
  FROM ChiTietDonHang ct
  LEFT JOIN SanPham sp ON ct.ma_san_pham = sp.ma_san_pham
`;

export const getAllChiTietDonHang = async (_req: Request, res: Response) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`${CHITIET_SELECT_QUERY} ORDER BY ct.ma_chi_tiet ASC`);
        res.status(200).json(result.recordset); 
    } catch (err: any) {
        res.status(500).json({ message: 'Lỗi lấy danh sách chi tiết đơn hàng', error: err.message });
    }
};

export const deleteChiTietDonHang = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
        const pool = await connectDB();

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const itemResult = await transaction.request() 
                .input('id', sql.Int, id)
                .query('SELECT ma_san_pham FROM ChiTietDonHang WHERE ma_chi_tiet = @id');

            if (itemResult.recordset.length > 0) {
                const item = itemResult.recordset[0];
                await transaction.request()
                    .input('ma_san_pham', sql.Int, item.ma_san_pham)
                    .query('UPDATE SanPham SET so_luong_ton = so_luong_ton + 1 WHERE ma_san_pham = @ma_san_pham');
            }

            const result = await transaction.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM ChiTietDonHang WHERE ma_chi_tiet = @id');

            if (result.rowsAffected[0] === 0) {
                await transaction.rollback();
                return res.status(404).json({ message: 'Không tìm thấy chi tiết để xóa' });
            }

            await transaction.commit(); 
            res.status(200).json({ message: 'Xóa chi tiết đơn hàng thành công' });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err: any) {
        res.status(500).json({ message: 'Lỗi khi xóa chi tiết đơn hàng', error: err.message });
    }
};
