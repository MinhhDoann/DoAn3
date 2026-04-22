// 1. DANH MỤC ĐỐI TÁC
export interface DoiTac {
    ma_doi_tac: number;
    ten_doi_tac: string;
    loai_doi_tac: 'NCC' | 'KHACH' | 'SHIPPER' | string;
    so_dien_thoai: string;
    dia_chi: string;
}

// 8. DANH MỤC
export interface DanhMuc {
    ma_danh_muc: number;
    ten_danh_muc: string;
    mo_ta: string;
}

// 2. DANH MỤC SẢN PHẨM
export interface SanPham {
    ma_san_pham: number;
    ma_danh_muc: number;
    ten_san_pham: string;
    sku: string;
    gia_ban: number;
    so_luong_ton: number;
}

// 3. PHIẾU NHẬP
export interface PhieuNhap {
    ma_phieu_nhap: number;
    ma_ncc: number;
    ngay_nhap: string;
}

export interface ChiTietPhieuNhap {
    ma_chi_tiet: number;
    ma_phieu_nhap: number;
    ma_san_pham: number;
    so_luong: number;
}

// 4. ĐƠN HÀNG
export interface DonHang {
    ma_don_hang: number;
    ma_khach_hang: number;
    ngay_ban: string;
}

export interface ChiTietDonHang {
    ma_chi_tiet: number;
    ma_don_hang: number;
    ma_san_pham: number;
    ma_serial: string;
    gia_ban: number;
}

// 5. PHIẾU GIAO HÀNG
export interface PhieuGiaoHang {
    ma_phieu_giao: number;
    ma_don_hang: number;
    ma_shipper: number;
    trang_thai_giao: 'DANG_VAN_CHUYEN' | 'DA_GIAO' | 'HOAN_VE' | string;
}

// 6. PHIẾU TRẢ HÀNG
export interface PhieuTraHang {
    ma_phieu_tra: number;
    ma_don_hang: number;
    ngay_tra: string;
    ma_serial: string;
}

// 7. PHIẾU TRẢ NHÀ CUNG CẤP
export interface PhieuTraNCC {
    ma_phieu_tra_ncc: number;
    ma_ncc: number;
    ngay_tra: string;
    ma_serial: string;
}
