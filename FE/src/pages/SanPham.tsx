import React, { useState } from 'react';
import { SanPham } from '../types';

export default function SanPhamPage() {
    const [data, setData] = useState<SanPham[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Partial<SanPham>>({
        ma_danh_muc: 0,
        ten_san_pham: '',
        sku: '',
        gia_ban: 0,
        so_luong_ton: 0
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleEdit = (item: SanPham) => {
        setFormData(item);
        setEditingId(item.ma_san_pham);
    };

    const handleClear = () => {
        setFormData({ ma_danh_muc: 0, ten_san_pham: '', sku: '', gia_ban: 0, so_luong_ton: 0 });
        setEditingId(null);
    };

    const handleSave = () => {
        alert(editingId ? "Cập nhật thành công!" : "Thêm mới thành công!");
        handleClear();
    };

    const filtered = data.filter(s =>
        s.ten_san_pham.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.sku && s.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="grid">
            <div className="card">
                <div className="products-header">
                    <h3>Danh Mục Sản Phẩm</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
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
                            <th>Mã SP</th>
                            <th>Mã Danh Mục</th>
                            <th>Tên Sản Phẩm</th>
                            <th>Giá Bán</th>
                            <th>Số Lượng Tồn</th>
                            <th className="text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={7} className="empty-message">Chưa có dữ liệu</td></tr>
                        ) : (
                            filtered.map(item => (
                                <tr key={item.ma_san_pham}>
                                    <td>{item.ma_san_pham}</td>
                                    <td>{item.ma_danh_muc}</td>
                                    <td className="font-semibold">{item.ten_san_pham}</td>
                                    <td className="text-jbl font-semibold">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.gia_ban)}
                                    </td>
                                    <td>
                                        <span className={`status-badge`} style={{ backgroundColor: item.so_luong_ton > 0 ? '#dbeafe' : '#fee2e2', color: item.so_luong_ton > 0 ? '#1d4ed8' : '#b91c1c' }}>
                                            {item.so_luong_ton}
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <button className="btn btn-edit" onClick={() => handleEdit(item)}>Sửa</button>
                                        <button className="btn btn-delete">Xóa</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {editingId !== null && (
                <div className="modal-overlay">
                    <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
                        <h3>{editingId === 0 ? 'Thêm Sản Phẩm Mới' : 'Sửa Sản Phẩm'}</h3>
                        <div className="form-row">
                            <input name="ten_san_pham" placeholder="Tên sản phẩm" value={formData.ten_san_pham || ''} onChange={handleInputChange} />
                        </div>
                        <div className="form-row form-row-2">
                            <input name="ma_danh_muc" type="number" placeholder="Mã danh mục" value={formData.ma_danh_muc || ''} onChange={handleInputChange} />
                            <input name="sku" placeholder="Mã SKU" value={formData.sku || ''} onChange={handleInputChange} />
                        </div>
                        <div className="form-row form-row-2">
                            <input name="gia_ban" type="number" placeholder="Giá bán" value={formData.gia_ban || ''} onChange={handleInputChange} />
                            <input name="so_luong_ton" type="number" placeholder="Số lượng tồn" value={formData.so_luong_ton || ''} onChange={handleInputChange} />
                        </div>
                        <div className="form-actions">
                            <button className="btn btn-jbl" onClick={handleSave}>Lưu thông tin</button>
                            <button className="btn btn-cancel" onClick={handleClear}>Hủy</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
