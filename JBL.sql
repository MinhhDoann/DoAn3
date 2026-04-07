CREATE DATABASE JBL_Store;
GO

USE JBL_Store;
GO
CREATE TABLE Users (
    UserID          INT IDENTITY(1,1) PRIMARY KEY,
    Name            NVARCHAR(100) NOT NULL,
    Email           NVARCHAR(100) UNIQUE NOT NULL,
    Password        NVARCHAR(255) NOT NULL,       
    Phone           NVARCHAR(20),
    Address         NVARCHAR(255),
    Role            NVARCHAR(20) DEFAULT 'CUSTOMER' CHECK (Role IN ('ADMIN', 'STAFF')),
    CreatedAt       DATETIME DEFAULT GETDATE(),
    UpdatedAt       DATETIME DEFAULT GETDATE()
);
GO

-- 2. Bảng Category (Danh mục loa JBL)
CREATE TABLE Categories (
    CategoryID      INT IDENTITY(1,1) PRIMARY KEY,
    Name            NVARCHAR(100) NOT NULL,           -- Ví dụ: Loa Karaoke, Loa Di Động, Loa Sân Khấu
    Description     NVARCHAR(500),
    Image           NVARCHAR(255),                    -- Đường dẫn ảnh danh mục
    CreatedAt       DATETIME DEFAULT GETDATE()
);
GO

-- 3. Bảng Product (Sản phẩm loa JBL)
CREATE TABLE Products (
    ProductID       INT IDENTITY(1,1) PRIMARY KEY,
    CategoryID      INT NOT NULL,
    Name            NVARCHAR(150) NOT NULL,
    Code            NVARCHAR(50) UNIQUE NOT NULL,     -- Mã sản phẩm: JBL-XXX
    Price           DECIMAL(18,2) NOT NULL,           -- Giá bán
    ImportPrice     DECIMAL(18,2),                    -- Giá nhập (để tính lợi nhuận)
    Stock           INT NOT NULL DEFAULT 0,
    Image           NVARCHAR(255) NOT NULL,           -- Ảnh chính
    Images          NVARCHAR(MAX),                    -- JSON string ảnh phụ (hoặc dùng JSON column)
    Specs           NVARCHAR(MAX),                   -- JSON: công suất, pin, Bluetooth, waterproof... 
    Description     NVARCHAR(MAX),
    IsActive        BIT DEFAULT 1,
    CreatedAt       DATETIME DEFAULT GETDATE(),
    UpdatedAt       DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT FK_Products_Category FOREIGN KEY (CategoryID) 
        REFERENCES Categories(CategoryID) ON DELETE CASCADE
);
GO

-- 4. Bảng Order (Đơn hàng)
CREATE TABLE Orders (
    OrderID         INT IDENTITY(1,1) PRIMARY KEY,
    UserID          INT NOT NULL,
    TotalAmount     DECIMAL(18,2) NOT NULL,
    Status          NVARCHAR(20) DEFAULT 'PENDING' 
        CHECK (Status IN ('PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED')),
    PaymentMethod   NVARCHAR(50),                     -- COD, Bank Transfer...
    ShippingAddress NVARCHAR(255),
    CreatedAt       DATETIME DEFAULT GETDATE(),
    UpdatedAt       DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT FK_Orders_User FOREIGN KEY (UserID) 
        REFERENCES Users(UserID)
);
GO

-- 5. Bảng OrderDetail (Chi tiết đơn hàng)
CREATE TABLE OrderDetails (
    OrderDetailID   INT IDENTITY(1,1) PRIMARY KEY,
    OrderID         INT NOT NULL,
    ProductID       INT NOT NULL,
    Quantity        INT NOT NULL CHECK (Quantity > 0),
    PriceAtOrder    DECIMAL(18,2) NOT NULL,           -- Giá tại thời điểm đặt hàng
    
    CONSTRAINT FK_OrderDetails_Order FOREIGN KEY (OrderID) 
        REFERENCES Orders(OrderID) ON DELETE CASCADE,
    CONSTRAINT FK_OrderDetails_Product FOREIGN KEY (ProductID) 
        REFERENCES Products(ProductID)
);
GO

-- 6. Bảng InventoryLog (Lịch sử nhập/xuất kho)
CREATE TABLE InventoryLogs (
    LogID           INT IDENTITY(1,1) PRIMARY KEY,
    ProductID       INT NOT NULL,
    Type            NVARCHAR(10) NOT NULL CHECK (Type IN ('IMPORT', 'EXPORT')),
    Quantity        INT NOT NULL,
    Note            NVARCHAR(255),
    CreatedAt       DATETIME DEFAULT GETDATE(),
    CreatedBy       INT,                              -- UserID thực hiện (Admin/Staff)
    
    CONSTRAINT FK_InventoryLogs_Product FOREIGN KEY (ProductID) 
        REFERENCES Products(ProductID)
);
GO


-- =============================================
-- TẠO INDEX ĐỂ TĂNG TỐC ĐỘ TRUY VẤN
-- =============================================
CREATE INDEX IX_Products_CategoryID ON Products(CategoryID);
CREATE INDEX IX_Orders_UserID ON Orders(UserID);
CREATE INDEX IX_Orders_Status ON Orders(Status);
CREATE INDEX IX_Products_Code ON Products(Code);
GO
