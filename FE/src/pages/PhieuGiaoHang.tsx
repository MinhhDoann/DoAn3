import React, { useState, useEffect } from 'react';
import { PhieuGiaoHang, DonHang, DoiTac } from '../types';

const API_URL = 'http://localhost:5000/api/PhieuGiaoHang';
const DONHANG_URL = 'http://localhost:5000/api/DonHang';
const DOITAC_URL = 'http://localhost:5000/api/DoiTac';

export default function PhieuGiaoHangPage() {
    const [data, setData] = useState<any[]>([]);
    const [donHangs, setDonHangs] = useState<DonHang[]>([]);
    const [shippers, setShippers] = useState<DoiTac[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Partial<PhieuGiaoHang>>({
        ma_don_hang: 0,
        ma_shipper: 0,
        trang_thai_giao: 'DANG_VAN_CHUYEN'
    });

    useEffect(() => {
        fetchData();
        fetchDonHangs();
        fetchShippers();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error('Network response was not ok');
            const result = await res.json();
            setData(result);
        } catch (error) {
            console.error('Lỗi khi tải phiếu giao hàng:', error);
        }
    };

    const fetchDonHangs = async () => {
        try {
            const res = await fetch(DONHANG_URL);
            const result = await res.json();
            setDonHangs(result);
        } catch (error) {
            console.error('Lỗi khi tải đơn hàng:', error);
        }
    };

    const fetchShippers = async () => {
        try {
            const res = await fetch(DOITAC_URL);
            const result = await res.json();
            setShippers(result.filter((item: any) => item.loai_doi_tac === 'SHIPPER'));
        } catch (error) {
            console.error('Lỗi khi tải shipper:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: (name === 'ma_don_hang' || name === 'ma_shipper') ? Number(value) : value 
        }));
    };

    const handleEdit = (item: PhieuGiaoHang) => {
        setFormData(item);
        setEditingId(item.ma_phieu_giao);
    };

    const handleClear = () => {
        setFormData({ ma_don_hang: 0, ma_shipper: 0, trang_thai_giao: 'DANG_VAN_CHUYEN' });
        setEditingId(null);
    };

    const handleSave = async () => {
        if (!formData.ma_don_hang || !formData.ma_shipper) {
            alert('Vui lòng chọn đơn hàng và shipper');
            return;
        }

        try {
            if (editingId) {
                const res = await fetch(`${API_URL}/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                if (res.ok) {
                    alert('Cập nhật phiếu giao hàng thành công!');
                    fetchData();
                    handleClear();
                } else {
                    alert('Lỗi khi cập nhật');
                }
            } else {
                const res = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                if (res.ok) {
                    alert('Thêm phiếu giao hàng thành công!');
                    fetchData();
                    handleClear();
                } else {
                    const errorData = await res.json();
                    alert('Lỗi khi thêm mới: ' + (errorData.error || errorData.message));
                }
            }
        } catch (error) {
            console.error('Lỗi lưu phiếu giao hàng:', error);
            alert('Lỗi hệ thống khi lưu');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bạn có chắc muốn xóa phiếu giao hàng này?')) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('Xóa phiếu giao hàng thành công');
                fetchData();
            } else {
                alert('Lỗi khi xóa');
            }
        } catch (error) {
            console.error('Lỗi xóa phiếu giao hàng:', error);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'DA_GIAO': return { backgroundColor: '#dcfce7', color: '#166534' };
            case 'HOAN_VE': return { backgroundColor: '#fee2e2', color: '#991b1b' };
            default: return { backgroundColor: '#fef3c7', color: '#92400e' };
        }
    };

    const filtered = data.filter(p =>
        p.ma_phieu_giao.toString().includes(searchTerm) ||
        p.ten_shipper?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="grid">
            <div className="card">
                <div className="products-header">
                    <h3>Quản Lý Phiếu Giao Hàng</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm phiếu giao..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <button className="btn btn-jbl" onClick={() => setEditingId(0)}>+ Tạo Phiếu Giao</button>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Mã Phiếu Giao</th>
                            <th>Đơn Hàng</th>
                            <th>Shipper</th>
                            <th>Trạng Thái</th>
                            <th className="text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={5} className="empty-message">Chưa có dữ liệu</td></tr>
                        ) : (
                            filtered.map(item => (
                                <tr key={item.ma_phieu_giao}>
                                    <td className="font-semibold">PG{item.ma_phieu_giao}</td>
                                    <td>DH{item.ma_don_hang}</td>
                                    <td>{item.ten_shipper}</td>
                                    <td>
                                        <span className={`status-badge`} style={getStatusStyle(item.trang_thai_giao)}>
                                            {item.trang_thai_giao}
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <button className="btn btn-edit" onClick={() => handleEdit(item)}>Sửa</button>
                                        <button className="btn btn-delete" onClick={() => handleDelete(item.ma_phieu_giao)}>Xóa</button>
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
                            <h3>{editingId === 0 ? 'Tạo Phiếu Giao Hàng' : 'Cập Nhật Phiếu Giao'}</h3>
                            <button className="btn btn-cancel modal-close" onClick={handleClear}>✕</button>
                        </div>
                        
                        <div className="form-row form-row-clean">
                            <label className="form-label">Chọn Đơn Hàng:</label>
                            <select 
                                name="ma_don_hang" 
                                value={formData.ma_don_hang} 
                                onChange={handleInputChange}
                                className="form-select-full"
                            >
                                <option value={0}>-- Chọn đơn hàng --</option>
                                {donHangs.filter(dh => (editingId && formData.ma_don_hang === dh.ma_don_hang) || !data.some(p => p.ma_don_hang === dh.ma_don_hang)).map(dh => (
                                    <option key={dh.ma_don_hang} value={dh.ma_don_hang}>
                                        DH{dh.ma_don_hang} - Khách: {(dh as any).ten_khach_hang}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-row form-row-clean">
                            <label className="form-label">Chọn Shipper:</label>
                            <select 
                                name="ma_shipper" 
                                value={formData.ma_shipper} 
                                onChange={handleInputChange}
                                className="form-select-full"
                            >
                                <option value={0}>-- Chọn shipper --</option>
                                {shippers.map(s => (
                                    <option key={s.ma_doi_tac} value={s.ma_doi_tac}>{s.ten_doi_tac}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-row form-row-clean">
                            <label className="form-label">Trạng Thái Giao Hàng:</label>
                            <select 
                                name="trang_thai_giao" 
                                value={formData.trang_thai_giao} 
                                onChange={handleInputChange}
                                className="form-select-full"
                            >
                                <option value="DANG_VAN_CHUYEN">Đang vận chuyển</option>
                                <option value="DA_GIAO">Đã giao</option>
                                <option value="HOAN_VE">Hoàn về</option>
                            </select>
                        </div>

                        <div className="form-actions" style={{ padding: '24px 0 0 0', background: 'transparent', borderTop: 'none' }}>
                            <button className="btn btn-jbl" onClick={handleSave}>Lưu Thông Tin</button>
                            <button className="btn btn-cancel" onClick={handleClear}>Hủy</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
