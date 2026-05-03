import { Request, Response } from 'express';
import sql from 'mssql';
import { connectDB } from '../config/db';

const SANPHAM_SELECT_QUERY = `
  SELECT
    h.ma_san_pham,
    h.ma_danh_muc,
    h.ten_san_pham,
    h.sku,
    h.gia_ban,
    h.so_luong_ton
  FROM SanPham h
`;

export const getAllSanPham = async (_req: Request, res: Response) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`${SANPHAM_SELECT_QUERY} ORDER BY h.ma_san_pham DESC`);
        res.status(200).json(result.recordset);
    } catch (err: any) {
        res.status(500).json({ message: 'Lỗi lấy danh sách sản phẩm', error: err.message });
    }
};

export const createSanPham = async (req: Request, res: Response) => {
    const { ma_danh_muc, ten_san_pham, sku, gia_ban, so_luong_ton } = req.body;
    try {
        const pool = await connectDB();
        const insertResult = await pool.request()
            .input('ma_danh_muc', sql.Int, ma_danh_muc)
            .input('ten_san_pham', sql.NVarChar(150), ten_san_pham)
            .input('sku', sql.NVarChar(50), sku)
            .input('gia_ban', sql.Decimal(18, 2), gia_ban)
            .input('so_luong_ton', sql.Int, so_luong_ton)
            .query(`
        INSERT INTO SanPham (ma_danh_muc, ten_san_pham, sku, gia_ban, so_luong_ton)
        OUTPUT INSERTED.ma_san_pham
        VALUES (@ma_danh_muc, @ten_san_pham, @sku, @gia_ban, @so_luong_ton)
      `);

        const newId = insertResult.recordset[0].ma_san_pham;
        const result = await pool.request()
            .input('id', sql.Int, newId)
            .query(`${SANPHAM_SELECT_QUERY} WHERE h.ma_san_pham = @id`);

        res.status(201).json(result.recordset[0]);
    } catch (err: any) {
        res.status(500).json({ message: 'Lỗi tạo sản phẩm', error: err.message });
    }
};

export const updateSanPham = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { ma_danh_muc, ten_san_pham, sku, gia_ban, so_luong_ton } = req.body;
    try {
        const pool = await connectDB();
        await pool.request()
            .input('id', sql.Int, id)
            .input('ma_danh_muc', sql.Int, ma_danh_muc)
            .input('ten_san_pham', sql.NVarChar(150), ten_san_pham)
            .input('sku', sql.NVarChar(50), sku)
            .input('gia_ban', sql.Decimal(18, 2), gia_ban)
            .input('so_luong_ton', sql.Int, so_luong_ton)
            .query(`
        UPDATE SanPham SET
          ma_danh_muc = ISNULL(@ma_danh_muc, ma_danh_muc),
          ten_san_pham = ISNULL(@ten_san_pham, ten_san_pham),
          sku = ISNULL(@sku, sku),
          gia_ban = ISNULL(@gia_ban, gia_ban),
          so_luong_ton = ISNULL(@so_luong_ton, so_luong_ton)
        WHERE ma_san_pham = @id
      `);

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`${SANPHAM_SELECT_QUERY} WHERE h.ma_san_pham = @id`);

        res.status(200).json(result.recordset[0]);
    } catch (err: any) {
        res.status(500).json({ message: 'Lỗi cập nhật sản phẩm', error: err.message });
    }
};

export const deleteSanPham = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM SanPham WHERE ma_san_pham = @id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm để xóa' });
        }

        res.status(200).json({ message: 'Xóa sản phẩm thành công' });
    } catch (err: any) {
        res.status(500).json({ message: 'Lỗi khi xóa sản phẩm', error: err.message });
    }
};
