export interface Product {
    ProductID: number;
    CategoryID: number;
    Name: string;
    Code: string;
    Price: number;
    ImportPrice?: number;           // Giá nhập (dùng tính lợi nhuận)
    Stock: number;
    Image: string;                  // Ảnh chính
    Images?: string[];              // Mảng ảnh phụ (JSON → convert sang array)
    Specs?: ProductSpecs;           // Thông số kỹ thuật dạng JSON
    Description?: string;
    IsActive: boolean;
    CreatedAt: string;
    UpdatedAt?: string;

    // Quan hệ với Category (khi join)
    Category?: Category;
}

/**
 * INTERFACE THÔNG SỐ KỸ THUẬT CỦA LOA JBL
 */
export interface ProductSpecs {
    power?: string;           // Công suất (ví dụ: "100W RMS")
    battery?: string;         // Pin (ví dụ: "24 giờ")
    bluetooth?: string;       // Bluetooth version
    waterproof?: string;      // Chống nước (IP67, IPX7...)
    weight?: string;          // Trọng lượng
    dimensions?: string;      // Kích thước
    frequency?: string;       // Dải tần số
    drivers?: string;         // Loa con
    connectivity?: string[];  // Kết nối (Bluetooth, AUX, USB...)
    features?: string[];      // Tính năng nổi bật
}

/**
 * INTERFACE DANH MỤC (CATEGORY)
 */
export interface Category {
    CategoryID: number;
    Name: string;
    Description?: string;
    Image?: string;
    CreatedAt?: string;
}

/**
 * INTERFACE ĐƠN HÀNG (Order) - Dùng sau này
 */
export interface Order {
    OrderID: number;
    UserID: number;
    TotalAmount: number;
    Status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
    PaymentMethod?: string;
    ShippingAddress?: string;
    CreatedAt: string;
    UpdatedAt?: string;
    OrderDetails?: OrderDetail[];
}

/**
 * INTERFACE CHI TIẾT ĐƠN HÀNG
 */
export interface OrderDetail {
    OrderDetailID: number;
    OrderID: number;
    ProductID: number;
    Quantity: number;
    PriceAtOrder: number;
    Product?: Product;
}

/**
 * INTERFACE USER (Admin / Customer)
 */
export interface User {
    UserID: number;
    Name: string;
    Email: string;
    Phone?: string;
    Address?: string;
    Role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
    CreatedAt: string;
}

/**
 * INTERFACE CHO FORM THÊM / SỬA SẢN PHẨM (Dùng trong Modal)
 */
export interface ProductFormData {
    CategoryID: number;
    Name: string;
    Code: string;
    Price: number;
    ImportPrice?: number;
    Stock: number;
    Image: File | string;           // File khi upload, string khi edit
    Images?: File[];                // Mảng file ảnh phụ
    Description?: string;
    Specs?: ProductSpecs;
    IsActive: boolean;
}

/**
 * INTERFACE PHÂN TRANG & LỌC SẢN PHẨM
 */
export interface ProductFilter {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sortBy?: 'price_asc' | 'price_desc' | 'name' | 'stock' | 'newest';
}

/**
 * INTERFACE RESPONSE TỪ API BACKEND
 */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    total?: number;
    page?: number;
    totalPages?: number;
}

/**
 * INTERFACE CHO STATISTICS (Thống kê nhanh)
 */
export interface ProductStats {
    totalProducts: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    activeProducts: number;
}

export default Product;