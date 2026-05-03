import { Request, Response } from 'express';
import sql from 'mssql';
import { connectDB } from '../config/db';

const DOITAC_SELECT_QUERY = `
  SELECT
    h.ma_doi_tac,
    h.ten_doi_tac,
    h.loai_doi_tac,
    h.so_dien_thoai,
    h.dia_chi
  FROM DoiTac h
`;

export const getAllDoiTac = async (_req: Request, res: Response) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`${DOITAC_SELECT_QUERY} ORDER BY h.ma_doi_tac DESC`);
        res.status(200).json(result.recordset);
    } catch (err: any) {
        res.status(500).json({ message: 'Lỗi lấy danh sách đối tác', error: err.message });
    }
};

export const createDoiTac = async (req: Request, res: Response) => {
    const { ten_doi_tac, loai_doi_tac, so_dien_thoai, dia_chi } = req.body;
    try {
        const pool = await connectDB();
        const insertResult = await pool.request()
            .input('ten_doi_tac', sql.NVarChar(150), ten_doi_tac)
            .input('loai_doi_tac', sql.NVarChar(20), loai_doi_tac)
            .input('so_dien_thoai', sql.NVarChar(20), so_dien_thoai)
            .input('dia_chi', sql.NVarChar(255), dia_chi)
            .query(`
        INSERT INTO DoiTac (ten_doi_tac, loai_doi_tac, so_dien_thoai, dia_chi)
        OUTPUT INSERTED.ma_doi_tac
        VALUES (@ten_doi_tac, @loai_doi_tac, @so_dien_thoai, @dia_chi)
      `);

        const newId = insertResult.recordset[0].ma_doi_tac;
        const result = await pool.request()
            .input('id', sql.Int, newId)
            .query(`${DOITAC_SELECT_QUERY} WHERE h.ma_doi_tac = @id`);

        res.status(201).json(result.recordset[0]);
    } catch (err: any) {
        res.status(500).json({ message: 'Lỗi tạo đối tác', error: err.message });
    }
};

export const updateDoiTac = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { ten_doi_tac, loai_doi_tac, so_dien_thoai, dia_chi } = req.body;
    try {
        const pool = await connectDB();
        await pool.request()
            .input('id', sql.Int, id)
            .input('ten_doi_tac', sql.NVarChar(150), ten_doi_tac)
            .input('loai_doi_tac', sql.NVarChar(20), loai_doi_tac)
            .input('so_dien_thoai', sql.NVarChar(20), so_dien_thoai)
            .input('dia_chi', sql.NVarChar(255), dia_chi)
            .query(`
        UPDATE DoiTac SET
          ten_doi_tac = ISNULL(@ten_doi_tac, ten_doi_tac),
          loai_doi_tac = ISNULL(@loai_doi_tac, loai_doi_tac),
          so_dien_thoai = ISNULL(@so_dien_thoai, so_dien_thoai),
          dia_chi = ISNULL(@dia_chi, dia_chi)
        WHERE ma_doi_tac = @id
      `);

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`${DOITAC_SELECT_QUERY} WHERE h.ma_doi_tac = @id`);

        res.status(200).json(result.recordset[0]);
    } catch (err: any) {
        res.status(500).json({ message: 'Lỗi cập nhật đối tác', error: err.message });
    }
};

export const deleteDoiTac = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM DoiTac WHERE ma_doi_tac = @id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đối tác để xóa' });
        }

        res.status(200).json({ message: 'Xóa đối tác thành công' });
    } catch (err: any) {
        res.status(500).json({ message: 'Lỗi khi xóa đối tác', error: err.message });
    }
};
