import { Request, Response } from 'express';
import sql from 'mssql';
import { connectDB } from '../config/db';

const CHITIET_SELECT_QUERY = `
  SELECT 
    ct.ma_chi_tiet,
    ct.ma_phieu_nhap,
    ct.ma_san_pham,
    sp.ten_san_pham,
    ct.so_luong,
    ct.gia_nhap
  FROM ChiTietPhieuNhap ct
  LEFT JOIN SanPham sp ON ct.ma_san_pham = sp.ma_san_pham
`;

export const getAllChiTietPhieuNhap = async (_req: Request, res: Response) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`${CHITIET_SELECT_QUERY} ORDER BY ct.ma_chi_tiet ASC`);
        res.status(200).json(result.recordset);
    } catch (err: any) {
        res.status(500).json({ message: 'Lỗi lấy danh sách chi tiết phiếu nhập', error: err.message });
    }
};

export const createChiTietPhieuNhap = async (req: Request, res: Response) => {
    const { ma_phieu_nhap, ma_san_pham, so_luong, gia_nhap } = req.body;
    try {
        const pool = await connectDB();

        // Cập nhật tồn kho khi thêm chi tiết
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            await transaction.request()
                .input('ma_phieu_nhap', sql.Int, ma_phieu_nhap)
                .input('ma_san_pham', sql.Int, ma_san_pham)
                .input('so_luong', sql.Int, so_luong)
                .input('gia_nhap', sql.Decimal(18, 2), gia_nhap)
                .query(`
                    INSERT INTO ChiTietPhieuNhap (ma_phieu_nhap, ma_san_pham, so_luong, gia_nhap)
                    VALUES (@ma_phieu_nhap, @ma_san_pham, @so_luong, @gia_nhap)
                `);

            await transaction.request()
                .input('ma_san_pham', sql.Int, ma_san_pham)
                .input('so_luong', sql.Int, so_luong)
                .query('UPDATE SanPham SET so_luong_ton = so_luong_ton + @so_luong WHERE ma_san_pham = @ma_san_pham');

            await transaction.commit();
            res.status(201).json({ message: 'Thêm chi tiết phiếu nhập thành công' });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err: any) {
        res.status(500).json({ message: 'Lỗi tạo chi tiết phiếu nhập', error: err.message });
    }
};

export const deleteChiTietPhieuNhap = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
        const pool = await connectDB();

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Lấy thông tin để hoàn tồn kho
            const itemResult = await transaction.request()
                .input('id', sql.Int, id)
                .query('SELECT ma_san_pham, so_luong FROM ChiTietPhieuNhap WHERE ma_chi_tiet = @id');

            if (itemResult.recordset.length > 0) {
                const item = itemResult.recordset[0];
                await transaction.request()
                    .input('ma_san_pham', sql.Int, item.ma_san_pham)
                    .input('so_luong', sql.Int, item.so_luong)
                    .query('UPDATE SanPham SET so_luong_ton = so_luong_ton - @so_luong WHERE ma_san_pham = @ma_san_pham');
            }

            const result = await transaction.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM ChiTietPhieuNhap WHERE ma_chi_tiet = @id');

            if (result.rowsAffected[0] === 0) {
                await transaction.rollback();
                return res.status(404).json({ message: 'Không tìm thấy chi tiết để xóa' });
            }

            await transaction.commit();
            res.status(200).json({ message: 'Xóa chi tiết phiếu nhập thành công' });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err: any) {
        res.status(500).json({ message: 'Lỗi khi xóa chi tiết phiếu nhập', error: err.message });
    }
};
