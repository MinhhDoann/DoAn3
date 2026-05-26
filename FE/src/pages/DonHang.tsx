import React, { useState, useEffect } from 'react';
import { DonHang, DoiTac, SanPham } from '../types';

const API_URL = 'http://localhost:5000/api/DonHang';
const KHACH_URL = 'http://localhost:5000/api/DoiTac';
const SANPHAM_URL = 'http://localhost:5000/api/SanPham';

export default function DonHangPage() {
    const [data, setData] = useState<any[]>([]);
    const [khachHangs, setKhachHangs] = useState<DoiTac[]>([]);
    const [sanPhams, setSanPhams] = useState<SanPham[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [viewingOrder, setViewingOrder] = useState<any | null>(null);

    const [formData, setFormData] = useState({
        ma_khach_hang: '',
        details: [] as any[]
    });

    useEffect(() => {
        fetchData();
        fetchKhachHangs();
        fetchSanPhams();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error('Network response was not ok');
            const result = await res.json();
            setData(result);
        } catch (error) {
            console.error('Lỗi khi tải đơn hàng:', error);
        }
    };

    const fetchKhachHangs = async () => {
        try {
            const res = await fetch(KHACH_URL);
            const result = await res.json();
            setKhachHangs(result.filter((item: any) => item.loai_doi_tac === 'KHACH'));
        } catch (error) {
            console.error('Lỗi khi tải khách hàng:', error);
        }
    };

    const fetchSanPhams = async () => {
        try {
            const res = await fetch(SANPHAM_URL);
            const result = await res.json();
            setSanPhams(result);
        } catch (error) {
            console.error('Lỗi khi tải sản phẩm:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bạn có chắc muốn xóa đơn hàng này?')) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('Xóa đơn hàng thành công');
                fetchData();
            } else {
                alert('Lỗi khi xóa đơn hàng');
            }
        } catch (error) {
            console.error('Lỗi xóa đơn hàng:', error);
        }
    };

    const handleCreateOrder = async () => {
        if (!formData.ma_khach_hang || formData.details.length === 0) {
            alert('Vui lòng chọn khách hàng và ít nhất một sản phẩm');
            return;
        }

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert('Tạo đơn hàng thành công!');
                setShowModal(false);
                setFormData({ ma_khach_hang: '', details: [] });
                fetchData();
            } else {
                alert('Lỗi khi tạo đơn hàng');
            }
        } catch (error) {
            console.error('Lỗi tạo đơn hàng:', error);
        }
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            details: [...prev.details, { ma_san_pham: '', ma_serial: '', gia_ban: 0 }]
        }));
    };

    const removeItem = (index: number) => {
        const newDetails = [...formData.details];
        newDetails.splice(index, 1);
        setFormData(prev => ({ ...prev, details: newDetails }));
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newDetails = [...formData.details];
        if (field === 'ma_san_pham') {
            const sp = sanPhams.find(s => s.ma_san_pham === Number(value));
            newDetails[index] = { ...newDetails[index], [field]: value, gia_ban: sp ? sp.gia_ban : 0 };
        } else {
            newDetails[index] = { ...newDetails[index], [field]: value };
        }
        setFormData(prev => ({ ...prev, details: newDetails }));
    };

    const viewDetails = async (id: number) => {
        try {
            const res = await fetch(`${API_URL}/${id}`);
            const result = await res.json();
            setViewingOrder(result);
        } catch (error) {
            console.error('Lỗi lấy chi tiết:', error);
        }
    };

    const filtered = data.filter(d =>
        d.ma_don_hang.toString().includes(searchTerm) || 
        d.ten_khach_hang?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="grid">
            <div className="card">
                <div className="products-header">
                    <h3>Đơn Bán Hàng (Bán Cho Khách)</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm đơn hàng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <button className="btn btn-jbl" onClick={() => setShowModal(true)}>+ Tạo Đơn Hàng</button>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Mã Đơn Hàng</th>
                            <th>Khách Hàng</th>
                            <th>Ngày Bán</th>
                            <th className="text-right">Tổng Tiền</th>
                            <th className="text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={5} className="empty-message">Chưa có dữ liệu</td></tr>
                        ) : (
                            filtered.map(item => (
                                <tr key={item.ma_don_hang}>
                                    <td className="font-bold">DH{item.ma_don_hang}</td>
                                    <td>{item.ten_khach_hang}</td>
                                    <td>{new Date(item.ngay_ban).toLocaleDateString()}</td>
                                    <td className="text-right font-bold" style={{ color: 'var(--accent)' }}>
                                        {Number(item.tong_tien || 0).toLocaleString()}đ
                                    </td>
                                    <td className="text-right">
                                        <button className="btn btn-edit" onClick={() => viewDetails(item.ma_don_hang)}>Chi Tiết</button>
                                        <button className="btn btn-delete" onClick={() => handleDelete(item.ma_don_hang)}>Xóa</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Tạo Đơn Hàng */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="card modal-card" style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h3>Tạo Đơn Hàng Mới</h3>
                            <button className="btn btn-cancel modal-close" onClick={() => {setShowModal(false); setFormData({ma_khach_hang: '', details: []})}}>✕</button>
                        </div>

                        <div className="form-row form-row-clean">
                            <label className="form-label">Khách hàng:</label>
                            <select 
                                value={formData.ma_khach_hang} 
                                onChange={(e) => setFormData({...formData, ma_khach_hang: e.target.value})}
                                className="form-select-full"
                            >
                                <option value="">-- Chọn khách hàng --</option>
                                {khachHangs.map(k => (
                                    <option key={k.ma_doi_tac} value={k.ma_doi_tac}>{k.ten_doi_tac}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="detail-container">
                            <div className="detail-header">
                                <h4 style={{ margin: 0 }}>Danh sách sản phẩm</h4>
                                <button className="btn btn-jbl" onClick={addItem} style={{ padding: '6px 12px', fontSize: '12px' }}>+ Thêm dòng</button>
                            </div>
                            <div className="detail-scroll">
                                <table className="detail-table">
                                    <thead>
                                        <tr>
                                            <th>Sản phẩm</th>
                                            <th>Mã Serial</th>
                                            <th className="text-right">Giá bán</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.details.length === 0 ? (
                                            <tr><td colSpan={4} className="empty-message">Chưa có sản phẩm nào</td></tr>
                                        ) : (
                                            formData.details.map((item, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <select 
                                                            value={item.ma_san_pham} 
                                                            onChange={(e) => updateItem(index, 'ma_san_pham', e.target.value)}
                                                            className="form-select-full"
                                                            style={{ padding: '6px' }}
                                                        >
                                                            <option value="">-- Chọn SP --</option>
                                                            {sanPhams.map(s => (
                                                                <option key={s.ma_san_pham} value={s.ma_san_pham}>{s.ten_san_pham}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <input 
                                                            placeholder="Serial" 
                                                            value={item.ma_serial} 
                                                            onChange={(e) => updateItem(index, 'ma_serial', e.target.value)} 
                                                            className="form-select-full"
                                                            style={{ padding: '6px' }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input 
                                                            type="number" 
                                                            value={item.gia_ban} 
                                                            onChange={(e) => updateItem(index, 'gia_ban', e.target.value)} 
                                                            className="form-select-full"
                                                            style={{ padding: '6px', textAlign: 'right' }}
                                                        />
                                                    </td>
                                                    <td className="text-center">
                                                        <button className="btn btn-delete" onClick={() => removeItem(index)} style={{ padding: '4px 8px' }}>✕</button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="form-actions" style={{ padding: '24px 0 0 0', background: 'transparent', borderTop: 'none' }}>
                            <button className="btn btn-jbl" onClick={handleCreateOrder}>Lưu Đơn Hàng</button>
                            <button className="btn btn-cancel" onClick={() => {setShowModal(false); setFormData({ma_khach_hang: '', details: []})}}>Hủy</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Xem Chi Tiết */}
            {viewingOrder && (
                <div className="modal-overlay">
                    <div className="card modal-card">
                        <div className="modal-header">
                            <h3>Chi Tiết Đơn Hàng DH{viewingOrder.ma_don_hang}</h3>
                            <button className="btn btn-cancel modal-close" onClick={() => setViewingOrder(null)}>✕</button>
                        </div>
                        <div className="detail-summary">
                            <p><strong>Khách hàng:</strong> {viewingOrder.ten_khach_hang}</p>
                            <p><strong>Ngày bán:</strong> {new Date(viewingOrder.ngay_ban).toLocaleString()}</p>
                        </div>
                        
                        <h4 style={{ marginBottom: '12px' }}>Danh sách sản phẩm</h4>
                        <table className="detail-table">
                            <thead>
                                <tr>
                                    <th>Sản phẩm</th>
                                    <th>Serial</th>
                                    <th className="text-right">Giá bán</th>
                                </tr>
                            </thead>
                            <tbody>
                                {viewingOrder.details?.map((item: any) => (
                                    <tr key={item.ma_chi_tiet}>
                                        <td>{item.ten_san_pham}</td>
                                        <td>{item.ma_serial}</td>
                                        <td className="text-right">{Number(item.gia_ban).toLocaleString()}đ</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ borderTop: '2px solid var(--border)' }}>
                                    <td colSpan={2} style={{ padding: '16px 10px', fontWeight: '600' }}>Tổng cộng:</td>
                                    <td className="text-right" style={{ padding: '16px 10px', fontWeight: '700', color: 'var(--accent)', fontSize: '18px' }}>
                                        {Number(viewingOrder.tong_tien).toLocaleString()}đ
                                    </td>
                                </tr>
                            </tfoot>
                        </table>

                        <div className="form-actions" style={{ padding: '24px 0 0 0', background: 'transparent', borderTop: 'none' }}>
                            <button className="btn btn-cancel" onClick={() => setViewingOrder(null)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
