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
                    <div className="card modal-card" style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h3>Tạo Phiếu Nhập Mới</h3>
                            <button className="btn btn-cancel modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        <div className="form-row form-row-clean">
                            <label className="form-label">Nhà cung cấp:</label>
                            <select
                                value={formData.ma_ncc}
                                onChange={(e) => setFormData({ ...formData, ma_ncc: e.target.value })}
                                className="form-select-full"
                            >
                                <option value="">-- Chọn nhà cung cấp --</option>
                                {nccs.map(k => (
                                    <option key={k.ma_doi_tac} value={k.ma_doi_tac}>{k.ten_doi_tac}</option>
                                ))}
                            </select>
                        </div>

                        <div className="detail-container">
                            <div className="detail-header">
                                <h4 style={{ margin: 0 }}>Danh sách sản phẩm nhập</h4>
                                <button className="btn btn-jbl" onClick={addItem} style={{ padding: '6px 12px', fontSize: '12px' }}>+ Thêm dòng</button>
                            </div>
                            <div className="detail-scroll">
                                <table className="detail-table">
                                    <thead>
                                        <tr>
                                            <th>Sản phẩm</th>
                                            <th>Số lượng</th>
                                            <th className="text-right">Giá nhập</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.details.length === 0 ? (
                                            <tr><td colSpan={4} className="empty-message">Chưa có dòng nào</td></tr>
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
                                                            type="number"
                                                            value={item.so_luong}
                                                            onChange={(e) => updateItem(index, 'so_luong', Number(e.target.value))}
                                                            className="form-select-full"
                                                            style={{ padding: '6px' }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            value={item.gia_nhap}
                                                            onChange={(e) => updateItem(index, 'gia_nhap', Number(e.target.value))}
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
                            <button className="btn btn-jbl" onClick={handleCreate}>Lưu Phiếu Nhập</button>
                            <button className="btn btn-cancel" onClick={() => { setShowModal(false); setFormData({ ma_ncc: '', details: [] }) }}>Hủy</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Xem Chi Tiết */}
            {viewingOrder && (
                <div className="modal-overlay">
                    <div className="card modal-card">
                        <div className="modal-header">
                            <h3>Chi Tiết Phiếu Nhập PN{viewingOrder.ma_phieu_nhap}</h3>
                            <button className="btn btn-cancel modal-close" onClick={() => setViewingOrder(null)}>✕</button>
                        </div>
                        <div className="detail-summary">
                            <p><strong>Nhà cung cấp:</strong> {viewingOrder.ten_ncc}</p>
                            <p><strong>Ngày nhập:</strong> {new Date(viewingOrder.ngay_nhap).toLocaleString()}</p>
                        </div>

                        <h4 style={{ marginBottom: '12px' }}>Danh sách sản phẩm nhập</h4>
                        <table className="detail-table">
                            <thead>
                                <tr>
                                    <th>Sản phẩm</th>
                                    <th>Số lượng</th>
                                    <th className="text-right">Giá nhập</th>
                                </tr>
                            </thead>
                            <tbody>
                                {viewingOrder.details?.map((item: any) => (
                                    <tr key={item.ma_chi_tiet}>
                                        <td>{item.ten_san_pham}</td>
                                        <td>{item.so_luong}</td>
                                        <td className="text-right">{Number(item.gia_nhap).toLocaleString()}đ</td>
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
