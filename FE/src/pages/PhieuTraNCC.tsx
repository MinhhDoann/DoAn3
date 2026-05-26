import React, { useState, useEffect } from 'react';
import { PhieuTraNCC, DoiTac } from '../types';

const API_URL = 'http://localhost:5000/api/PhieuTraNCC';
const DOITAC_URL = 'http://localhost:5000/api/DoiTac';

export default function PhieuTraNCCPage() {
    const [data, setData] = useState<any[]>([]);
    const [nccs, setNccs] = useState<DoiTac[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [viewingItem, setViewingItem] = useState<any | null>(null);

    const [formData, setFormData] = useState<Partial<PhieuTraNCC>>({
        ma_ncc: 0,
        ma_serial: '',
        ngay_tra: new Date().toISOString().substring(0, 10)
    });

    useEffect(() => {
        fetchData();
        fetchNccs();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error('Network response was not ok');
            const result = await res.json();
            setData(result);
        } catch (error) {
            console.error('Lỗi khi tải phiếu trả NCC:', error);
        }
    };

    const fetchNccs = async () => {
        try {
            const res = await fetch(DOITAC_URL);
            const result = await res.json();
            setNccs(result.filter((item: any) => item.loai_doi_tac === 'NCC'));
        } catch (error) {
            console.error('Lỗi khi tải nhà cung cấp:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'ma_ncc' ? Number(value) : value 
        }));
    };

    const handleEdit = (item: any) => {
        setFormData({
            ma_ncc: item.ma_ncc,
            ma_serial: item.ma_serial,
            ngay_tra: item.ngay_tra ? new Date(item.ngay_tra).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10)
        });
        setEditingId(item.ma_phieu_tra_ncc);
    };

    const handleClear = () => {
        setFormData({
            ma_ncc: 0,
            ma_serial: '',
            ngay_tra: new Date().toISOString().substring(0, 10)
        });
        setEditingId(null);
    };

    const handleSave = async () => {
        if (!formData.ma_ncc || !formData.ma_serial) {
            alert('Vui lòng chọn nhà cung cấp và điền mã serial');
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
                    alert('Cập nhật phiếu trả NCC thành công!');
                    fetchData();
                    handleClear();
                } else {
                    const errResult = await res.json();
                    alert('Lỗi khi cập nhật: ' + (errResult.message || 'Lỗi hệ thống'));
                }
            } else {
                const res = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                if (res.ok) {
                    alert('Thêm phiếu trả NCC thành công!');
                    fetchData();
                    handleClear();
                } else {
                    const errResult = await res.json();
                    alert('Lỗi khi thêm mới: ' + (errResult.message || 'Lỗi hệ thống'));
                }
            }
        } catch (error) {
            console.error('Lỗi lưu phiếu trả NCC:', error);
            alert('Lỗi hệ thống khi lưu');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bạn có chắc muốn xóa phiếu trả NCC này? Số lượng tồn kho sản phẩm sẽ được tự động điều chỉnh tăng trở lại.')) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('Xóa phiếu trả NCC thành công!');
                fetchData();
            } else {
                const errResult = await res.json();
                alert('Lỗi khi xóa: ' + (errResult.message || 'Lỗi hệ thống'));
            }
        } catch (error) {
            console.error('Lỗi xóa phiếu trả NCC:', error);
        }
    };

    const filtered = data.filter(p =>
        p.ma_phieu_tra_ncc.toString().includes(searchTerm) ||
        p.ma_serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ten_ncc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ten_san_pham?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="grid">
            <div className="card">
                <div className="products-header">
                    <h3>Phiếu Trả Hàng (Shop Trả Cho NCC)</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm mã phiếu, NCC, serial hoặc sản phẩm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                            style={{ width: '350px' }}
                        />
                        <button className="btn btn-jbl" onClick={() => setEditingId(0)}>+ Tạo Phiếu Trả NCC</button>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Mã Phiếu Trả NCC</th>
                            <th>Nhà Cung Cấp</th>
                            <th>Sản Phẩm</th>
                            <th>Mã Serial</th>
                            <th>Ngày Trả</th>
                            <th className="text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={6} className="empty-message">Chưa có dữ liệu</td></tr>
                        ) : (
                            filtered.map(item => (
                                <tr key={item.ma_phieu_tra_ncc}>
                                    <td className="font-bold">PTN{item.ma_phieu_tra_ncc}</td>
                                    <td>{item.ten_ncc}</td>
                                    <td>{item.ten_san_pham || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Không xác định</span>}</td>
                                    <td className="font-bold font-mono">{item.ma_serial}</td>
                                    <td>{item.ngay_tra ? new Date(item.ngay_tra).toLocaleDateString() : ''}</td>
                                    <td className="text-right">
                                        <button className="btn btn-edit" onClick={() => setViewingItem(item)}>Chi Tiết</button>
                                        <button className="btn btn-edit" onClick={() => handleEdit(item)} style={{ marginLeft: '6px', backgroundColor: '#e0f2fe', color: '#0369a1' }}>Sửa</button>
                                        <button className="btn btn-delete" onClick={() => handleDelete(item.ma_phieu_tra_ncc)} style={{ marginLeft: '6px' }}>Xóa</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Tạo / Sửa Phiếu Trả NCC */}
            {editingId !== null && (
                <div className="modal-overlay">
                    <div className="card modal-card" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3>{editingId === 0 ? 'Tạo Phiếu Trả Hàng Cho NCC' : `Cập Nhật Phiếu Trả PTN${editingId}`}</h3>
                            <button className="btn btn-cancel modal-close" onClick={handleClear}>✕</button>
                        </div>
                        
                        <div className="form-row form-row-clean">
                            <label className="form-label">Chọn Nhà Cung Cấp:</label>
                            <select 
                                name="ma_ncc" 
                                value={formData.ma_ncc} 
                                onChange={handleInputChange}
                                className="form-select-full"
                            >
                                <option value={0}>-- Chọn nhà cung cấp --</option>
                                {nccs.map(n => (
                                    <option key={n.ma_doi_tac} value={n.ma_doi_tac}>
                                        {n.ten_doi_tac}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-row form-row-clean">
                            <label className="form-label">Mã Serial Sản Phẩm Trả:</label>
                            <input 
                                type="text"
                                name="ma_serial"
                                placeholder="Nhập mã serial sản phẩm trả cho NCC"
                                value={formData.ma_serial}
                                onChange={handleInputChange}
                                className="form-select-full"
                                style={{ padding: '8px 12px' }}
                            />
                        </div>

                        <div className="form-row form-row-clean">
                            <label className="form-label">Ngày Trả Hàng:</label>
                            <input 
                                type="date"
                                name="ngay_tra" 
                                value={formData.ngay_tra} 
                                onChange={handleInputChange}
                                className="form-select-full"
                            />
                        </div>

                        <div className="form-actions" style={{ padding: '24px 0 0 0', background: 'transparent', borderTop: 'none' }}>
                            <button className="btn btn-jbl" onClick={handleSave}>Lưu Thông Tin</button>
                            <button className="btn btn-cancel" onClick={handleClear}>Hủy</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Xem Chi Tiết Phiếu Trả NCC */}
            {viewingItem && (
                <div className="modal-overlay">
                    <div className="card modal-card" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3>Chi Tiết Phiếu Trả Hàng Cho NCC PTN{viewingItem.ma_phieu_tra_ncc}</h3>
                            <button className="btn btn-cancel modal-close" onClick={() => setViewingItem(null)}>✕</button>
                        </div>
                        <div className="detail-summary" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '10px 0' }}>
                            <p style={{ margin: 0 }}><strong>Mã Phiếu Trả NCC:</strong> PTN{viewingItem.ma_phieu_tra_ncc}</p>
                            <p style={{ margin: 0 }}><strong>Nhà Cung Cấp:</strong> {viewingItem.ten_ncc}</p>
                            <p style={{ margin: 0 }}><strong>Sản Phẩm:</strong> {viewingItem.ten_san_pham || 'Không xác định'}</p>
                            <p style={{ margin: 0 }}><strong>Mã Serial:</strong> <span className="font-mono" style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{viewingItem.ma_serial}</span></p>
                            <p style={{ margin: 0 }}><strong>Ngày Trả:</strong> {viewingItem.ngay_tra ? new Date(viewingItem.ngay_tra).toLocaleString() : ''}</p>
                            <div style={{ marginTop: '10px', padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <div style={{ fontSize: '20px', color: '#dc2626' }}>⚠</div>
                                <div style={{ fontSize: '13px', color: '#991b1b' }}>Hàng lỗi đã được gửi trả thành công về Nhà cung cấp. Số lượng tồn kho của sản phẩm này đã được điều chỉnh giảm 1 đơn vị.</div>
                            </div>
                        </div>

                        <div className="form-actions" style={{ padding: '20px 0 0 0', background: 'transparent', borderTop: 'none' }}>
                            <button className="btn btn-cancel" onClick={() => setViewingItem(null)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
