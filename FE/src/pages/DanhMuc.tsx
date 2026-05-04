import React, { useState, useEffect } from 'react';
import { DanhMuc } from '../types';

const API_URL = 'http://localhost:5000/api/DanhMuc';

export default function DanhMucPage() {
    const [data, setData] = useState<DanhMuc[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Partial<DanhMuc>>({
        ten_danh_muc: '',
        mo_ta: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error('Network response was not ok');
            const result = await res.json();
            setData(result);
        } catch (error) {
            console.error('Lỗi khi tải danh mục:', error);
        }
    };

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

    const handleSave = async () => {
        try {
            if (editingId) {
                // Sửa
                const res = await fetch(`${API_URL}/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                if (res.ok) {
                    alert('Cập nhật danh mục thành công!');
                    fetchData();
                    handleClear();
                } else {
                    alert('Lỗi cập nhật');
                }
            } else {
                // Thêm mới
                const res = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                if (res.ok) {
                    alert('Thêm danh mục thành công!');
                    fetchData();
                    handleClear();
                } else {
                    alert('Lỗi thêm mới');
                }
            }
        } catch (error) {
            console.error('Lỗi lưu danh mục:', error);
            alert('Lỗi khi lưu danh mục');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                alert('Xóa danh mục thành công');
                fetchData();
            } else {
                alert('Lỗi xóa danh mục');
            }
        } catch (error) {
            console.error('Lỗi xóa danh mục:', error);
            alert('Lỗi khi xóa danh mục');
        }
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
                            <th>Mã danh mục</th>
                            <th>Tên Danh Mục</th>
                            <th>Mô Tả</th>
                            <th className="text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={4} className="empty-message">Chưa có dữ liệu</td></tr>
                        ) : (
                            filtered.map((danhmuc, index) => (
                                <tr key={danhmuc.ma_danh_muc}>
                                    <td>{index + 1}</td>
                                    <td className="font-semibold">{danhmuc.ten_danh_muc}</td>
                                    <td>{danhmuc.mo_ta}</td>
                                    <td className="text-right">
                                        <button className="btn btn-edit" onClick={() => handleEdit(danhmuc)}>Sửa</button>
                                        <button className="btn btn-delete" onClick={() => handleDelete(danhmuc.ma_danh_muc)}>Xóa</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {editingId !== null && (
                <div className="modal-overlay">
                    <div className="card modal-card" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3>{editingId === 0 ? 'Thêm Danh Mục Mới' : 'Sửa Danh Mục'}</h3>
                            <button className="btn btn-cancel modal-close" onClick={handleClear}>✕</button>
                        </div>
                        <div className="form-row form-row-clean">
                            <label className="form-label">Tên danh mục:</label>
                            <input name="ten_danh_muc" placeholder="Tên danh mục" value={formData.ten_danh_muc || ''} onChange={handleInputChange} />
                        </div>
                        <div className="form-row form-row-clean">
                            <label className="form-label">Mô tả:</label>
                            <textarea
                                name="mo_ta"
                                placeholder="Mô tả danh mục"
                                value={formData.mo_ta || ''}
                                onChange={handleInputChange}
                                style={{ minHeight: '80px' }}
                            />
                        </div>
                        <div className="form-actions" style={{ padding: '24px 0 0 0', background: 'transparent', borderTop: 'none' }}>
                            <button className="btn btn-jbl" onClick={handleSave}>Lưu thông tin</button>
                            <button className="btn btn-cancel" onClick={handleClear}>Hủy</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
