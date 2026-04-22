CREATE DATABASE JBL_Store
GO
USE JBL_Store 
GO

-- 1. DANH MỤC: Phân loại sản phẩm (Loa, Tai nghe,...)
CREATE TABLE DanhMuc (
    ma_danh_muc INT IDENTITY(1,1) PRIMARY KEY,
    ten_danh_muc NVARCHAR(100) NOT NULL,
    mo_ta NVARCHAR(255)
);

-- 2. ĐỐI TÁC: Khách hàng, NCC, Shipper (Gộp chung để tối giản)
CREATE TABLE DoiTac (
    ma_doi_tac INT IDENTITY(1,1) PRIMARY KEY,
    ten_doi_tac NVARCHAR(150) NOT NULL,
    loai_doi_tac NVARCHAR(20) NOT NULL CHECK (loai_doi_tac IN ('NCC', 'KHACH', 'SHIPPER')),
    so_dien_thoai NVARCHAR(20),
    dia_chi NVARCHAR(255)
);

-- 3. SẢN PHẨM: Quản lý số lượng tồn kho
CREATE TABLE SanPham (
    ma_san_pham INT IDENTITY(1,1) PRIMARY KEY,
    ma_danh_muc INT REFERENCES DanhMuc(ma_danh_muc),
    ten_san_pham NVARCHAR(150) NOT NULL,
    gia_ban DECIMAL(18,2) NOT NULL,
    so_luong_ton INT DEFAULT 0
);


-- 4. NHẬP HÀNG: Ghi nhận lô hàng từ NCC
CREATE TABLE PhieuNhap (
    ma_phieu_nhap INT IDENTITY(1,1) PRIMARY KEY,
    ma_ncc INT REFERENCES DoiTac(ma_doi_tac),
    ngay_nhap DATETIME DEFAULT GETDATE()
);

CREATE TABLE ChiTietPhieuNhap (
    ma_chi_tiet INT IDENTITY(1,1) PRIMARY KEY,
    ma_phieu_nhap INT REFERENCES PhieuNhap(ma_phieu_nhap),
    ma_san_pham INT REFERENCES SanPham(ma_san_pham),
    so_luong INT NOT NULL,
    gia_nhap DECIMAL(18,2)
);

-- 5. BÁN HÀNG: Quản lý hóa đơn và Serial đã xuất
CREATE TABLE DonHang (
    ma_don_hang INT IDENTITY(1,1) PRIMARY KEY,
    ma_khach_hang INT REFERENCES DoiTac(ma_doi_tac),
    ngay_ban DATETIME DEFAULT GETDATE()
);

CREATE TABLE ChiTietDonHang (
    ma_chi_tiet INT IDENTITY(1,1) PRIMARY KEY,
    ma_don_hang INT REFERENCES DonHang(ma_don_hang),
    ma_san_pham INT REFERENCES SanPham(ma_san_pham),
    ma_serial NVARCHAR(50) NOT NULL,
    gia_ban DECIMAL(18,2)
);

-- 6. GIAO HÀNG
CREATE TABLE PhieuGiaoHang (
    ma_phieu_giao INT IDENTITY(1,1) PRIMARY KEY,
    ma_don_hang INT REFERENCES DonHang(ma_don_hang),
    ma_shipper INT REFERENCES DoiTac(ma_doi_tac),
    trang_thai_giao NVARCHAR(50) -- 'DANG_VAN_CHUYEN', 'DA_GIAO', 'HOAN_VE'
);

-- 7. TRẢ HÀNG (Khách trả cho Shop)
CREATE TABLE PhieuTraHang (
    ma_phieu_tra INT IDENTITY(1,1) PRIMARY KEY,
    ma_don_hang INT REFERENCES DonHang(ma_don_hang),
    ngay_tra DATETIME DEFAULT GETDATE(),
    ma_serial NVARCHAR(50) NOT NULL
);

-- 8. TRẢ NCC (Shop trả hàng lỗi cho NCC)
CREATE TABLE PhieuTraNCC (
    ma_phieu_tra_ncc INT IDENTITY(1,1) PRIMARY KEY,
    ma_ncc INT REFERENCES DoiTac(ma_doi_tac),
    ngay_tra DATETIME DEFAULT GETDATE(),
    ma_serial NVARCHAR(50) NOT NULL
);

-- 1. Bảng Danh Mục
INSERT INTO DanhMuc (ten_danh_muc, mo_ta) VALUES 
('Loa Bluetooth', 'Loa di động, chống nước'),
('Tai nghe', 'Tai nghe không dây, chống ồn'),
('Loa Karaoke', 'Loa công suất lớn'),
('Phụ kiện', 'Cáp sạc, bao da'),
('Micro', 'Micro thu âm');

-- 2. Bảng Đối Tác
INSERT INTO DoiTac (ten_doi_tac, loai_doi_tac, so_dien_thoai, dia_chi) VALUES 
('NCC JBL', 'NCC', '0901111111', 'Hà Nội'),
('NCC Sony', 'NCC', '0902222222', 'TP.HCM'),
('Nguyễn Văn A', 'KHACH', '0911111111', 'Hưng Yên'),
('Trần Thị B', 'KHACH', '0912222222', 'Hà Nội'),
('Shipper GHTK', 'SHIPPER', '19001000', 'Toàn quốc');

-- 6. Bảng Đơn Hàng
INSERT INTO DonHang (ma_khach_hang, ngay_ban) VALUES 
(3, '2026-04-21'), (4, '2026-04-21'), (3, '2026-04-22'), (4, '2026-04-22'), (3, '2026-04-22');

-- 7. Bảng Chi Tiết Đơn Hàng
INSERT INTO ChiTietDonHang (ma_don_hang, ma_san_pham, ma_serial, gia_ban) VALUES 
(1, 1, 'JBL-FL6-001', 2500000),
(2, 2, 'JBL-FL7-001', 3000000),
(3, 3, 'SNY-XM5-001', 8000000),
(4, 4, 'JBL-PB110-001', 9000000),
(5, 5, 'SHU-SM58-001', 3500000);

-- 8. Bảng Phiếu Giao Hàng
INSERT INTO PhieuGiaoHang (ma_don_hang, ma_shipper, trang_thai_giao) VALUES 
(1, 5, 'DA_GIAO'), (2, 5, 'DA_GIAO'), (3, 5, 'DANG_VAN_CHUYEN'), (4, 5, 'DA_GIAO'), (5, 5, 'DA_GIAO');

-- 9. Bảng Phiếu Trả Hàng (Khách trả lại Shop)
INSERT INTO PhieuTraHang (ma_don_hang, ngay_tra, ma_serial) VALUES 
(1, '2026-04-22', 'JBL-FL6-001');

-- 10. Bảng Phiếu Trả NCC (Shop trả hàng lỗi cho NCC)
INSERT INTO PhieuTraNCC (ma_ncc, ngay_tra, ma_serial) VALUES 
(1, '2026-04-22', 'JBL-FL6-001');