import { Request, Response } from 'express';
import sql from 'mssql';
import { connectDB } from '../config/db';

const PHIEUNHAP_SELECT_QUERY = `
  SELECT 
    pn.ma_phieu_nhap,
    pn.ma_ncc,
    dt.ten_doi_tac as ten_ncc,
    pn.ngay_nhap,
    (SELECT SUM(so_luong * gia_nhap) FROM ChiTietPhieuNhap WHERE ma_phieu_nhap = pn.ma_phieu_nhap) as tong_tien
  FROM PhieuNhap pn
  LEFT JOIN DoiTac dt ON pn.ma_ncc = dt.ma_doi_tac
`;

export const getAllPhieuNhap = async (_req: Request, res: Response) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`${PHIEUNHAP_SELECT_QUERY} ORDER BY pn.ma_phieu_nhap ASC`);
        res.status(200).json(result.recordset);
    } catch (err: any) {
        res.status(500).json({ message: 'Lỗi lấy danh sách phiếu nhập', error: err.message });
    }
};

export const getPhieuNhapById = async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
        const pool = await connectDB();
        const orderResult = await pool.request()
            .input('id', sql.Int, id)
            .query(`${PHIEUNHAP_SELECT_QUERY} WHERE pn.ma_phieu_nhap = @id`);

        if (orderResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy phiếu nhập' });
        }

        const detailsResult = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT 
                    ct.ma_chi_tiet,
                    ct.ma_san_pham,
                    sp.ten_san_pham,
                    ct.so_luong,
                    ct.gia_nhap
                FROM ChiTietPhieuNhap ct
                LEFT JOIN SanPham sp ON ct.ma_san_pham = sp.ma_san_pham
                WHERE ct.ma_phieu_nhap = @id
            `);

        const order = orderResult.recordset[0];
        order.details = detailsResult.recordset;

        res.status(200).json(order);
    } catch (err: any) {
        res.status(500).json({ message: 'Lỗi lấy chi tiết phiếu nhập', error: err.message });
    }
};

export const createPhieuNhap = async (req: Request, res: Response) => {
    const { ma_ncc, ngay_nhap, details } = req.body;
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
            .input('ma_ncc', sql.Int, ma_ncc)
            .input('ngay_nhap', sql.DateTime, ngay_nhap || new Date())
            .query(`
                INSERT INTO PhieuNhap (ma_ncc, ngay_nhap)
                OUTPUT INSERTED.ma_phieu_nhap
                VALUES (@ma_ncc, @ngay_nhap)
            `);

        const ma_phieu_nhap = orderResult.recordset[0].ma_phieu_nhap;

        if (details && Array.isArray(details)) {
            for (const item of details) {
                await transaction.request()
                    .input('ma_phieu_nhap', sql.Int, ma_phieu_nhap)
                    .input('ma_san_pham', sql.Int, item.ma_san_pham)
                    .input('so_luong', sql.Int, item.so_luong)
                    .input('gia_nhap', sql.Decimal(18, 2), item.gia_nhap)
                    .query(`
                        INSERT INTO ChiTietPhieuNhap (ma_phieu_nhap, ma_san_pham, so_luong, gia_nhap)
                        VALUES (@ma_phieu_nhap, @ma_san_pham, @so_luong, @gia_nhap)
                    `);

                // Cập nhật tăng tồn kho
                await transaction.request()
                    .input('ma_san_pham', sql.Int, item.ma_san_pham)
                    .input('so_luong', sql.Int, item.so_luong)
                    .query(`
                        UPDATE SanPham SET so_luong_ton = so_luong_ton + @so_luong 
                        WHERE ma_san_pham = @ma_san_pham
                    `);
            }
        }

        await transaction.commit();
        res.status(201).json({ ma_phieu_nhap, message: 'Tạo phiếu nhập thành công' });
    } catch (err: any) {
        if (transaction) await transaction.rollback();
        res.status(500).json({ message: 'Lỗi tạo phiếu nhập', error: err.message });
    }
};

export const deletePhieuNhap = async (req: Request, res: Response) => {
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

        // Hoàn tác tồn kho trước khi xóa
        const details = await transaction.request()
            .input('id', sql.Int, id)
            .query('SELECT ma_san_pham, so_luong FROM ChiTietPhieuNhap WHERE ma_phieu_nhap = @id');

        for (const item of details.recordset) {
            await transaction.request()
                .input('ma_san_pham', sql.Int, item.ma_san_pham)
                .input('so_luong', sql.Int, item.so_luong)
                .query('UPDATE SanPham SET so_luong_ton = so_luong_ton - @so_luong WHERE ma_san_pham = @ma_san_pham');
        }

        await transaction.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM ChiTietPhieuNhap WHERE ma_phieu_nhap = @id');

        const result = await transaction.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM PhieuNhap WHERE ma_phieu_nhap = @id');

        if (result.rowsAffected[0] === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Không tìm thấy phiếu nhập để xóa' });
        }

        await transaction.commit();
        res.status(200).json({ message: 'Xóa phiếu nhập thành công' });
    } catch (err: any) {
        if (transaction) await transaction.rollback();
        res.status(500).json({ message: 'Lỗi khi xóa phiếu nhập', error: err.message });
    }
};
