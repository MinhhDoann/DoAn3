import React, { useEffect, useState } from 'react';
import { Product, ProductFormData } from '../types';

const API_BASE = 'http://localhost:5000/api';

const Products: React.FC = () => {
    const [productList, setProductList] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Form state
    const [formData, setFormData] = useState<ProductFormData>({
        CategoryID: 0,
        Name: '',
        Code: '',
        Price: 0,
        ImportPrice: 0,
        Stock: 0,
        Image: '',
        Description: '',
        IsActive: true,
    });

    const [editingId, setEditingId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/products`);
            if (!response.ok) throw new Error('Lỗi tải dữ liệu');
            const data: Product[] = await response.json();
            setProductList(data || []);
        } catch (err) {
            console.error('Lỗi tải sản phẩm:', err);
            alert('Không thể tải danh sách sản phẩm từ server');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleSave = async () => {
        if (!formData.Name.trim() || !formData.Code.trim()) {
            alert('Vui lòng nhập đầy đủ Tên và Mã sản phẩm!');
            return;
        }

        const payload = {
            CategoryID: formData.CategoryID,
            Name: formData.Name.trim(),
            Code: formData.Code.trim().toUpperCase(),
            Price: formData.Price,
            ImportPrice: formData.ImportPrice || null,
            Stock: formData.Stock,
            Image: formData.Image || null,
            Description: formData.Description?.trim() || null,
            IsActive: formData.IsActive,
        };

        try {
            const url = editingId
                ? `${API_BASE}/products/${editingId}`
                : `${API_BASE}/products`;

            const response = await fetch(url, {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || 'Lưu thất bại');
            }

            alert(editingId ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!');
            await fetchProducts();
            handleClear();
        } catch (err: any) {
            alert(err.message || 'Có lỗi khi lưu sản phẩm');
        }
    };

    const handleEdit = (product: Product) => {
        setFormData({
            CategoryID: product.CategoryID,
            Name: product.Name,
            Code: product.Code,
            Price: product.Price,
            ImportPrice: product.ImportPrice || 0,
            Stock: product.Stock,
            Image: product.Image,
            Description: product.Description || '',
            IsActive: product.IsActive,
        });
        setEditingId(product.ProductID);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) return;

        try {
            await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
            await fetchProducts();
            alert('Xóa sản phẩm thành công!');
        } catch (err) {
            alert('Không thể xóa sản phẩm');
        }
    };

    const handleClear = () => {
        setFormData({
            CategoryID: 0,
            Name: '',
            Code: '',
            Price: 0,
            ImportPrice: 0,
            Stock: 0,
            Image: '',
            Description: '',
            IsActive: true,
        });
        setEditingId(null);
    };

    const filteredProducts = productList.filter(p =>
        p.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.Code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="grid">
            {/* Bảng danh sách sản phẩm */}
            <div className="card">
                <div className="products-header">
                    <h3>Quản lý Sản phẩm Loa JBL</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <button className="btn btn-jbl" onClick={() => setEditingId(0)}>+ Thêm mới</button>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Mã SP</th>
                            <th>Tên sản phẩm</th>
                            <th>Danh mục</th>
                            <th>Giá bán</th>
                            <th>Tồn kho</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8' }}>Đang tải dữ liệu...</td></tr>
                        ) : filteredProducts.length === 0 ? (
                            <tr><td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8' }}>Không tìm thấy sản phẩm</td></tr>
                        ) : (
                            filteredProducts.map((product, index) => (
                                <tr key={product.ProductID}>
                                    <td>{index + 1}</td>
                                    <td><strong>{product.Code}</strong></td>
                                    <td>{product.Name}</td>
                                    <td>{product.Category?.Name || 'Chưa phân loại'}</td>
                                    <td style={{ textAlign: 'right', fontWeight: '600' }}>
                                        {product.Price.toLocaleString('vi-VN')} ₫
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span style={{ color: product.Stock < 10 ? '#ef4444' : '#10b981', fontWeight: '600' }}>
                                            {product.Stock}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span style={{
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontSize: '13px',
                                            backgroundColor: product.IsActive ? '#22c55e' : '#ef4444',
                                            color: '#fff'
                                        }}>
                                            {product.IsActive ? 'Đang bán' : 'Ngừng bán'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-jbl"
                                            style={{ marginRight: '8px', padding: '6px 12px', fontSize: '13px' }}
                                            onClick={() => handleEdit(product)}
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            className="btn btn-delete"
                                            onClick={() => handleDelete(product.ProductID)}
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Form Thêm / Sửa sản phẩm - Chỉ hiện khi ấn Sửa */}
            {editingId !== null && (
                <div className="modal-overlay">
                    <div className="card">
                        <h3>Sửa sản phẩm</h3>

                        <div className="form-row">
                            <input name="Name" placeholder="Tên sản phẩm" value={formData.Name} onChange={handleInputChange} />
                        </div>
                        <div className="form-row">
                            <input name="Code" placeholder="Mã sản phẩm (JBL-XXX)" value={formData.Code} onChange={handleInputChange} style={{ textTransform: 'uppercase' }} />
                        </div>

                        <div className="form-row">
                            <select name="CategoryID" value={formData.CategoryID} onChange={handleInputChange}>
                                <option value={0}>Chọn danh mục</option>
                                <option value={1}>Loa di động</option>
                                <option value={2}>Loa karaoke</option>
                                <option value={3}>Loa sân khấu</option>
                            </select>
                        </div>

                        <div className="form-row form-row-2">
                            <input name="Price" type="number" placeholder="Giá bán (VNĐ)" value={formData.Price} onChange={handleInputChange} />
                            <input name="ImportPrice" type="number" placeholder="Giá nhập (VNĐ)" value={formData.ImportPrice} onChange={handleInputChange} />
                        </div>

                        <div className="form-row">
                            <input name="Stock" type="number" placeholder="Tồn kho" value={formData.Stock} onChange={handleInputChange} />
                        </div>

                        <div className="form-row">
                            <input name="Image" placeholder="Đường dẫn ảnh chính" value={typeof formData.Image === 'string' ? formData.Image : ''} onChange={handleInputChange} />
                        </div>

                        <div className="form-row">
                            <textarea name="Description" placeholder="Mô tả sản phẩm" value={formData.Description} onChange={handleInputChange} rows={4} />
                        </div>

                        <div className="form-row">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.IsActive}
                                    onChange={(e) => setFormData(prev => ({ ...prev, IsActive: e.target.checked }))}
                                />
                                &nbsp; Đang kinh doanh
                            </label>
                        </div>

                        <div className="form-actions">
                            <button className="btn btn-jbl" onClick={handleSave}>Cập nhật sản phẩm</button>
                            <button className="btn btn-cancel" onClick={handleClear}>Hủy</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;