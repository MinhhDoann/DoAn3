import React, { useState } from 'react';
import { DanhMuc } from '../types';

export default function DanhMucPage() {
    const [data, setData] = useState<DanhMuc[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Partial<DanhMuc>>({
        ten_danh_muc: '',
        mo_ta: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEdit = (item: DanhMuc) => {
        setFormData(item);
        setEditingId(item.ma_danh_muc);
    };

    const handleClear = () => {
        setFormData({ ten_danh_muc: '', mo_ta: '' });
        setEditingId(null);
    };

    const handleSave = () => {
        alert(editingId ? "Cập nhật danh mục thành công!" : "Thêm danh mục thành công!");
        handleClear();
    };

    const filtered = data.filter(d =>
        d.ten_danh_muc.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="grid">
            <div className="card">
                <div className="products-header">
                    <h3>Quản Lý Danh Mục</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm danh mục..."
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
                            <th>Mã Danh Mục</th>
                            <th>Tên Danh Mục</th>
                            <th>Mô Tả</th>
                            <th className="text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={4} className="empty-message">Chưa có dữ liệu</td></tr>
                        ) : (
                            filtered.map(item => (
                                <tr key={item.ma_danh_muc}>
                                    <td>{item.ma_danh_muc}</td>
                                    <td className="font-semibold">{item.ten_danh_muc}</td>
                                    <td>{item.mo_ta}</td>
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
                        <h3>{editingId === 0 ? 'Thêm Danh Mục Mới' : 'Sửa Danh Mục'}</h3>
                        <div className="form-row">
                            <input name="ten_danh_muc" placeholder="Tên danh mục" value={formData.ten_danh_muc || ''} onChange={handleInputChange} />
                        </div>
                        <div className="form-row">
                            <textarea 
                                name="mo_ta" 
                                placeholder="Mô tả danh mục" 
                                value={formData.mo_ta || ''} 
                                onChange={handleInputChange}
                                style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
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
