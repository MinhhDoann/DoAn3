import React, { useState, useEffect } from 'react';
import { PhieuNhap, DoiTac, SanPham } from '../types';

const API_URL = 'http://localhost:5000/api/PhieuNhap';
const NCC_URL = 'http://localhost:5000/api/DoiTac';
const SANPHAM_URL = 'http://localhost:5000/api/SanPham';

export default function PhieuNhapPage() {
    const [data, setData] = useState<any[]>([]);
    const [nccs, setNccs] = useState<DoiTac[]>([]);
    const [sanPhams, setSanPhams] = useState<SanPham[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [viewingOrder, setViewingOrder] = useState<any | null>(null);

    const [formData, setFormData] = useState({
        ma_ncc: '',
        details: [] as any[]
    });

    useEffect(() => {
        fetchData();
        fetchNccs();
        fetchSanPhams();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error('Network response was not ok');
            const result = await res.json();
            setData(result);
        } catch (error) {
            console.error('Lỗi khi tải phiếu nhập:', error);
        }
    };

    const fetchNccs = async () => {
        try {
            const res = await fetch(NCC_URL);
            const result = await res.json();
            // Lọc chỉ lấy nhà cung cấp
            setNccs(result.filter((item: any) => item.loai_doi_tac === 'NCC'));
        } catch (error) {
            console.error('Lỗi khi tải nhà cung cấp:', error);
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
        if (!window.confirm('Bạn có chắc muốn xóa phiếu nhập này?')) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('Xóa phiếu nhập thành công');
                fetchData();
            } else {
                alert('Lỗi khi xóa phiếu nhập');
            }
        } catch (error) {
            console.error('Lỗi xóa phiếu nhập:', error);
        }
    };

    const handleCreate = async () => {
        if (!formData.ma_ncc || formData.details.length === 0) {
            alert('Vui lòng chọn nhà cung cấp và ít nhất một sản phẩm');
            return;
        }

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert('Tạo phiếu nhập thành công!');
                setShowModal(false);
                setFormData({ ma_ncc: '', details: [] });
                fetchData();
            } else {
                alert('Lỗi khi tạo phiếu nhập');
            }
        } catch (error) {
            console.error('Lỗi tạo phiếu nhập:', error);
        }
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            details: [...prev.details, { ma_san_pham: '', so_luong: 1, gia_nhap: 0 }]
        }));
    };

    const removeItem = (index: number) => {
        const newDetails = [...formData.details];
        newDetails.splice(index, 1);
        setFormData(prev => ({ ...prev, details: newDetails }));
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newDetails = [...formData.details];
        newDetails[index] = { ...newDetails[index], [field]: value };
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
        d.ma_phieu_nhap.toString().includes(searchTerm) ||
        d.ten_ncc?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="grid">
            <div className="card">
                <div className="products-header">
                    <h3>Phiếu Nhập Hàng (Từ NCC)</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm phiếu nhập..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <button className="btn btn-jbl" onClick={() => setShowModal(true)}>+ Tạo Phiếu Nhập</button>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Mã Phiếu Nhập</th>
                            <th>Nhà Cung Cấp</th>
                            <th>Ngày Nhập</th>
                            <th className="text-right">Tổng Tiền</th>
                            <th className="text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={5} className="empty-message">Chưa có dữ liệu</td></tr>
                        ) : (
                            filtered.map(item => (
                                <tr key={item.ma_phieu_nhap}>
                                    <td className="font-semibold">PN{item.ma_phieu_nhap}</td>
                                    <td>{item.ten_ncc}</td>
                                    <td>{new Date(item.ngay_nhap).toLocaleDateString()}</td>
                                    <td className="text-right font-semibold" style={{ color: 'var(--accent)' }}>
                                        {Number(item.tong_tien || 0).toLocaleString()}đ
                                    </td>
                                    <td className="text-right">
                                        <button className="btn btn-edit" onClick={() => viewDetails(item.ma_phieu_nhap)}>Chi Tiết</button>
                                        <button className="btn btn-delete" onClick={() => handleDelete(item.ma_phieu_nhap)}>Xóa</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Tạo Phiếu Nhập */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="card" style={{ maxWidth: '800px', width: '100%', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <h3 style={{ padding: 0, margin: 0 }}>Tạo Phiếu Nhập Mới</h3>
                            <button className="btn btn-cancel" onClick={() => setShowModal(false)} style={{ padding: '4px 8px' }}>✕</button>
                        </div>

                        <div className="form-row" style={{ padding: '0', marginTop: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Nhà cung cấp:</label>
                            <select
                                value={formData.ma_ncc}
                                onChange={(e) => setFormData({ ...formData, ma_ncc: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                            >
                                <option value="">-- Chọn nhà cung cấp --</option>
                                {nccs.map(k => (
                                    <option key={k.ma_doi_tac} value={k.ma_doi_tac}>{k.ten_doi_tac}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginTop: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <h4 style={{ margin: 0 }}>Danh sách sản phẩm nhập</h4>
                                <button className="btn btn-jbl" onClick={addItem} style={{ padding: '6px 12px', fontSize: '12px' }}>+ Thêm dòng</button>
                            </div>
                            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg)', zIndex: 1 }}>
                                        <tr>
                                            <th style={{ padding: '10px' }}>Sản phẩm</th>
                                            <th style={{ padding: '10px' }}>Số lượng</th>
                                            <th style={{ padding: '10px' }} className="text-right">Giá nhập</th>
                                            <th style={{ padding: '10px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.details.length === 0 ? (
                                            <tr><td colSpan={4} className="text-center" style={{ padding: '20px', color: 'var(--text-muted)' }}>Chưa có dòng nào</td></tr>
                                        ) : (
                                            formData.details.map((item, index) => (
                                                <tr key={index}>
                                                    <td style={{ padding: '8px' }}>
                                                        <select
                                                            value={item.ma_san_pham}
                                                            onChange={(e) => updateItem(index, 'ma_san_pham', e.target.value)}
                                                            style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border)' }}
                                                        >
                                                            <option value="">-- Chọn SP --</option>
                                                            {sanPhams.map(s => (
                                                                <option key={s.ma_san_pham} value={s.ma_san_pham}>{s.ten_san_pham}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td style={{ padding: '8px' }}>
                                                        <input
                                                            type="number"
                                                            value={item.so_luong}
                                                            onChange={(e) => updateItem(index, 'so_luong', Number(e.target.value))}
                                                            style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border)' }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '8px' }}>
                                                        <input
                                                            type="number"
                                                            value={item.gia_nhap}
                                                            onChange={(e) => updateItem(index, 'gia_nhap', Number(e.target.value))}
                                                            style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border)', textAlign: 'right' }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '8px', textAlign: 'center' }}>
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
                            <button className="btn btn-jbl" onClick={handleCreate}>Lưu Phiếu Nhập</button>
                            <button className="btn btn-cancel" onClick={() => { setShowModal(false); setFormData({ ma_ncc: '', details: [] }) }}>Hủy</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Xem Chi Tiết */}
            {viewingOrder && (
                <div className="modal-overlay">
                    <div className="card" style={{ maxWidth: '600px', width: '100%', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <h3 style={{ padding: 0, margin: 0 }}>Chi Tiết Phiếu Nhập PN{viewingOrder.ma_phieu_nhap}</h3>
                            <button className="btn btn-cancel" onClick={() => setViewingOrder(null)} style={{ padding: '4px 8px' }}>✕</button>
                        </div>
                        <div style={{ backgroundColor: 'var(--bg)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                            <p style={{ marginBottom: '8px' }}><strong>Nhà cung cấp:</strong> {viewingOrder.ten_ncc}</p>
                            <p style={{ margin: 0 }}><strong>Ngày nhập:</strong> {new Date(viewingOrder.ngay_nhap).toLocaleString()}</p>
                        </div>

                        <h4 style={{ marginBottom: '12px' }}>Danh sách sản phẩm nhập</h4>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                    <th style={{ padding: '10px 0' }}>Sản phẩm</th>
                                    <th style={{ padding: '10px 0' }}>Số lượng</th>
                                    <th style={{ padding: '10px 0' }} className="text-right">Giá nhập</th>
                                </tr>
                            </thead>
                            <tbody>
                                {viewingOrder.details?.map((item: any) => (
                                    <tr key={item.ma_chi_tiet}>
                                        <td style={{ padding: '10px 0' }}>{item.ten_san_pham}</td>
                                        <td style={{ padding: '10px 0' }}>{item.so_luong}</td>
                                        <td style={{ padding: '10px 0' }} className="text-right">{Number(item.gia_nhap).toLocaleString()}đ</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ borderTop: '2px solid var(--border)' }}>
                                    <td colSpan={2} style={{ padding: '16px 0', fontWeight: '600' }}>Tổng cộng:</td>
                                    <td className="text-right" style={{ padding: '16px 0', fontWeight: '700', color: 'var(--accent)', fontSize: '18px' }}>
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
