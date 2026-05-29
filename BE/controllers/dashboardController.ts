import { Request, Response } from 'express';
import sql from 'mssql';
import { connectDB } from '../config/db';

export const getStats = async (_req: Request, res: Response) => {
    try {
        const pool = await connectDB();

        const revenueResult = await pool.request().query(`
            SELECT SUM(ct.gia_ban) as totalRevenue
            FROM ChiTietDonHang ct
            JOIN DonHang dh ON ct.ma_don_hang = dh.ma_don_hang
            WHERE MONTH(dh.ngay_ban) = MONTH(GETDATE()) AND YEAR(dh.ngay_ban) = YEAR(GETDATE())
        `);

        const pendingOrdersResult = await pool.request().query(`
            SELECT COUNT(*) as pendingOrders
            FROM DonHang dh
            LEFT JOIN PhieuGiaoHang pgh ON dh.ma_don_hang = pgh.ma_don_hang
            WHERE pgh.ma_phieu_giao IS NULL
        `);

        const lowStockResult = await pool.request().query(`
            SELECT COUNT(*) as lowStock
            FROM SanPham
            WHERE so_luong_ton < 10
        `);

        const customersResult = await pool.request().query(`
            SELECT COUNT(*) as totalCustomers
            FROM DoiTac
            WHERE loai_doi_tac = 'KHACH'
        `);

        const recentOrdersResult = await pool.request().query(`
            SELECT TOP 5
                dh.ma_don_hang,
                dt.ten_doi_tac as ten_khach_hang,
                (SELECT SUM(gia_ban) FROM ChiTietDonHang WHERE ma_don_hang = dh.ma_don_hang) as tong_tien,
                CASE 
                    WHEN pgh.ma_phieu_giao IS NULL THEN N'Chờ duyệt'
                    WHEN pgh.trang_thai_giao = 'DANG_VAN_CHUYEN' THEN N'Đang giao'
                    WHEN pgh.trang_thai_giao = 'DA_GIAO' THEN N'Đã giao'
                    WHEN pgh.trang_thai_giao = 'HOAN_VE' THEN N'Hoàn về'
                    ELSE pgh.trang_thai_giao
                END as trang_thai,
                dh.ngay_ban
            FROM DonHang dh
            LEFT JOIN DoiTac dt ON dh.ma_khach_hang = dt.ma_doi_tac
            LEFT JOIN PhieuGiaoHang pgh ON dh.ma_don_hang = pgh.ma_don_hang
            ORDER BY dh.ngay_ban DESC
        `);

        res.status(200).json({
            totalRevenue: revenueResult.recordset[0].totalRevenue || 0,
            pendingOrders: pendingOrdersResult.recordset[0].pendingOrders || 0,
            lowStock: lowStockResult.recordset[0].lowStock || 0,
            totalCustomers: customersResult.recordset[0].totalCustomers || 0,
            recentOrders: recentOrdersResult.recordset
        });
    } catch (err: any) {
        res.status(500).json({ message: 'Lỗi lấy thống kê dashboard', error: err.message });
    }
};
