import React, { useState, useEffect } from 'react';
import { DoiTac } from '../types';

const API_URL = 'http://localhost:5000/api/DoiTac';

export default function DoiTacPage() {
    const [data, setData] = useState<DoiTac[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Partial<DoiTac>>({
        ten_doi_tac: '',
        loai_doi_tac: 'KHACH',
        so_dien_thoai: '',
        dia_chi: ''
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
            console.error('Lỗi khi tải đối tác:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEdit = (item: DoiTac) => {
        setFormData(item);
        setEditingId(item.ma_doi_tac);
    };

    const handleClear = () => {
        setFormData({ ten_doi_tac: '', loai_doi_tac: 'KHACH', so_dien_thoai: '', dia_chi: '' });
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
                    alert('Cập nhật đối tác thành công!');
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
                    alert('Thêm đối tác thành công!');
                    fetchData();
                    handleClear();
                } else {
                    alert('Lỗi thêm mới');
                }
            }
        } catch (error) {
            console.error('Lỗi lưu đối tác:', error);
            alert('Lỗi khi lưu đối tác');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bạn có chắc muốn xóa đối tác này?')) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                alert('Xóa đối tác thành công');
                fetchData();
            } else {
                alert('Lỗi xóa đối tác');
            }
        } catch (error) {
            console.error('Lỗi xóa đối tác:', error);
            alert('Lỗi khi xóa đối tác');
        }
    };

    const filtered = data.filter(u =>
        u.ten_doi_tac.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="grid">
            <div className="card">
                <div className="products-header">
                    <h3>Danh Mục Đối Tác (Khách, NCC, Shipper)</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm đối tác..."
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
                            <th>Mã Đối Tác</th>
                            <th>Tên Đối Tác</th>
                            <th>Loại</th>
                            <th>Số Điện Thoại</th>
                            <th>Địa Chỉ</th>
                            <th className="text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={6} className="empty-message">Chưa có dữ liệu</td></tr>
                        ) : (
                            filtered.map(item => (
                                <tr key={item.ma_doi_tac}>
                                    <td>{item.ma_doi_tac}</td>
                                    <td className="font-semibold">{item.ten_doi_tac}</td>
                                    <td>
                                        <span className={`status-badge`} style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>
                                            {item.loai_doi_tac}
                                        </span>
                                    </td>
                                    <td>{item.so_dien_thoai}</td>
                                    <td>{item.dia_chi}</td>
                                    <td className="text-right">
                                        <button className="btn btn-edit" onClick={() => handleEdit(item)}>Sửa</button>
                                        <button className="btn btn-delete" onClick={() => handleDelete(item.ma_doi_tac)}>Xóa</button>
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
                        <h3>{editingId === 0 ? 'Thêm Đối Tác Mới' : 'Sửa Đối Tác'}</h3>
                        <div className="form-row">
                            <input name="ten_doi_tac" placeholder="Tên đối tác" value={formData.ten_doi_tac || ''} onChange={handleInputChange} />
                        </div>
                        <div className="form-row">
                            <select name="loai_doi_tac" value={formData.loai_doi_tac || ''} onChange={handleInputChange}>
                                <option value="KHACH">Khách hàng</option>
                                <option value="NCC">Nhà cung cấp</option>
                                <option value="SHIPPER">Shipper</option>
                            </select>
                        </div>
                        <div className="form-row">
                            <input name="so_dien_thoai" placeholder="Số điện thoại" value={formData.so_dien_thoai || ''} onChange={handleInputChange} />
                        </div>
                        <div className="form-row">
                            <input name="dia_chi" placeholder="Địa chỉ" value={formData.dia_chi || ''} onChange={handleInputChange} />
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
