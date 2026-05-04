import { Request, Response } from 'express';
import sql from 'mssql';
import { connectDB } from '../config/db';

const PHIEUGIAO_SELECT_QUERY = `
  SELECT 
    p.ma_phieu_giao,
    p.ma_don_hang,
    p.ma_shipper,
    dt.ten_doi_tac as ten_shipper,
    p.trang_thai_giao
  FROM PhieuGiaoHang p
  LEFT JOIN DoiTac dt ON p.ma_shipper = dt.ma_doi_tac
`;

export const getAllPhieuGiaoHang = async (_req: Request, res: Response) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`${PHIEUGIAO_SELECT_QUERY} ORDER BY p.ma_phieu_giao ASC`);
        res.status(200).json(result.recordset);
    } catch (err: any) {
        res.status(500).json({ message: 'Lỗi lấy danh sách phiếu giao hàng', error: err.message });
    }
};

export const createPhieuGiaoHang = async (req: Request, res: Response) => {
    const { ma_don_hang, ma_shipper, trang_thai_giao } = req.body;
    try {
        const pool = await connectDB();
        const insertResult = await pool.request()
            .input('ma_don_hang', sql.Int, ma_don_hang)
            .input('ma_shipper', sql.Int, ma_shipper)
            .input('trang_thai_giao', sql.NVarChar(50), trang_thai_giao || 'DANG_VAN_CHUYEN')
            .query(`
        INSERT INTO PhieuGiaoHang (ma_don_hang, ma_shipper, trang_thai_giao)
        OUTPUT INSERTED.ma_phieu_giao
        VALUES (@ma_don_hang, @ma_shipper, @trang_thai_giao)
      `);

        const newId = insertResult.recordset[0].ma_phieu_giao;
        const result = await pool.request()
            .input('id', sql.Int, newId)
            .query(`${PHIEUGIAO_SELECT_QUERY} WHERE p.ma_phieu_giao = @id`);

        res.status(201).json(result.recordset[0]);
    } catch (err: any) {
        res.status(500).json({ message: 'Lỗi tạo phiếu giao hàng', error: err.message });
    }
};

export const updatePhieuGiaoHang = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { ma_don_hang, ma_shipper, trang_thai_giao } = req.body;
    try {
        const pool = await connectDB();
        await pool.request()
            .input('id', sql.Int, id)
            .input('ma_don_hang', sql.Int, ma_don_hang)
            .input('ma_shipper', sql.Int, ma_shipper)
            .input('trang_thai_giao', sql.NVarChar(50), trang_thai_giao)
            .query(`
        UPDATE PhieuGiaoHang SET
          ma_don_hang = ISNULL(@ma_don_hang, ma_don_hang),
          ma_shipper = ISNULL(@ma_shipper, ma_shipper),
          trang_thai_giao = ISNULL(@trang_thai_giao, trang_thai_giao)
        WHERE ma_phieu_giao = @id
      `);

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`${PHIEUGIAO_SELECT_QUERY} WHERE p.ma_phieu_giao = @id`);

        res.status(200).json(result.recordset[0]);
    } catch (err: any) {
        res.status(500).json({ message: 'Lỗi cập nhật phiếu giao hàng', error: err.message });
    }
};

export const deletePhieuGiaoHang = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM PhieuGiaoHang WHERE ma_phieu_giao = @id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Không tìm thấy phiếu giao hàng để xóa' });
        }

        res.status(200).json({ message: 'Xóa phiếu giao hàng thành công' });
    } catch (err: any) {
        res.status(500).json({ message: 'Lỗi khi xóa phiếu giao hàng', error: err.message });
    }
};
