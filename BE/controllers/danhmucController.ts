import { Request, Response } from 'express';
import sql from 'mssql';
import { connectDB } from '../config/db';

const DANHMUC_SELECT_QUERY = `
  SELECT
    h.DanhMucID AS id,
    h.TenDanhMuc AS [desc],
    h.mo_ta AS mo_ta,
  FROM DanhMuc h
`;

export const getAllDanhMuc = async (_req: Request, res: Response) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`${DANHMUC_SELECT_QUERY} ORDER BY h.DanhMucID DESC`);
        res.status(200).json(result.recordset);
    } catch (err: any) {
        res.status(500).json({ message: 'Lỗi lấy danh sách danh mục', error: err.message });
    }
};

export const createDanhMuc = async (req: Request, res: Response) => {
    const { tenDanhMuc, mo_ta } = req.body;
    try {
        const pool = await connectDB();
        const insertResult = await pool.request()
            .input('tenDanhMuc', sql.NVarChar(255), tenDanhMuc)
            .input('mo_ta', sql.NVarChar(255), mo_ta)
            .query(`
        INSERT INTO DanhMuc (TenDanhMuc, mo_ta)
        OUTPUT INSERTED.DanhMucID AS id
        VALUES (@tenDanhMuc, @mo_ta)
      `);

        const newId = insertResult.recordset[0].id;
        const result = await pool.request()
            .input('id', sql.Int, newId)
            .query(`${DANHMUC_SELECT_QUERY} WHERE h.DanhMucID = @id`);

        res.status(201).json(result.recordset[0]);
    } catch (err: any) {
        res.status(500).json({ message: 'Lỗi tạo danh mục', error: err.message });
    }
};

export const updateDanhMuc = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { tenDanhMuc, mo_ta } = req.body;
    try {
        const pool = await connectDB();
        await pool.request()
            .input('id', sql.Int, id)
            .input('tenDanhMuc', sql.NVarChar(255), tenDanhMuc)
            .input('mo_ta', sql.NVarChar(255), mo_ta)
            .query(`
        UPDATE DanhMuc SET
          TenDanhMuc = ISNULL(@tenDanhMuc, TenDanhMuc),
          mo_ta = ISNULL(@mo_ta, mo_ta)
        WHERE DanhMucID = @id
      `);

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`${DANHMUC_SELECT_QUERY} WHERE h.DanhMucID = @id`);

        res.status(200).json(result.recordset[0]);
    } catch (err: any) {
        res.status(500).json({ message: 'Lỗi cập nhật', error: err.message });
    }
};

export const deleteDanhMuc = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM DanhMuc WHERE DanhMucID = @id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Không tìm thấy danh mục để xóa' });
        }

        res.status(200).json({ message: 'Xóa danh mục thành công' });
    } catch (err: any) {
        res.status(500).json({ message: 'Lỗi khi xóa danh mục', error: err.message });
    }
};