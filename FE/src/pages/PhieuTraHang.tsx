import React, { useState, useEffect } from 'react';
import { PhieuTraHang, DonHang } from '../types';

const API_URL = 'http://localhost:5000/api/PhieuTraHang';
const DONHANG_URL = 'http://localhost:5000/api/DonHang';

export default function PhieuTraHangPage() {
    const [data, setData] = useState<any[]>([]);
    const [donHangs, setDonHangs] = useState<DonHang[]>([]);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [viewingItem, setViewingItem] = useState<any | null>(null);
    const [loadingSerials, setLoadingSerials] = useState(false);

    const [formData, setFormData] = useState<Partial<PhieuTraHang>>({
        ma_don_hang: 0,
        ma_serial: '',
        ngay_tra: new Date().toISOString().substring(0, 10)
    });

    useEffect(() => {
        fetchData();
        fetchDonHangs();
    }, []);

    useEffect(() => {
        if (formData.ma_don_hang) {
            fetchOrderDetails(formData.ma_don_hang);
        } else {
            setSelectedOrderDetails([]);
        }
    }, [formData.ma_don_hang]);

    const fetchData = async () => {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error('Network response was not ok');
            const result = await res.json();
            setData(result);
        } catch (error) {
            console.error('Lỗi khi tải phiếu trả hàng:', error);
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

    const fetchOrderDetails = async (orderId: number) => {
        setLoadingSerials(true);
        try {
            const res = await fetch(`${DONHANG_URL}/${orderId}`);
            if (res.ok) {
                const result = await res.json();
                setSelectedOrderDetails(result.details || []);
            } else {
                setSelectedOrderDetails([]);
            }
        } catch (error) {
            console.error('Lỗi khi tải chi tiết đơn hàng:', error);
            setSelectedOrderDetails([]);
        } finally {
            setLoadingSerials(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { 
                ...prev, 
                [name]: name === 'ma_don_hang' ? Number(value) : value 
            };
            if (name === 'ma_don_hang') {
                updated.ma_serial = '';
            }
            return updated;
        });
    };

    const handleEdit = (item: any) => {
        setFormData({
            ma_don_hang: item.ma_don_hang,
            ma_serial: item.ma_serial,
            ngay_tra: item.ngay_tra ? new Date(item.ngay_tra).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10)
        });
        setEditingId(item.ma_phieu_tra);
    };

    const handleClear = () => {
        setFormData({
            ma_don_hang: 0,
            ma_serial: '',
            ngay_tra: new Date().toISOString().substring(0, 10)
        });
        setEditingId(null);
        setSelectedOrderDetails([]);
    };

    const handleSave = async () => {
        if (!formData.ma_don_hang || !formData.ma_serial) {
            alert('Vui lòng chọn đơn hàng và mã serial sản phẩm');
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
                    alert('Cập nhật phiếu trả hàng thành công!');
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
                    alert('Thêm phiếu trả hàng thành công!');
                    fetchData();
                    handleClear();
                } else {
                    const errResult = await res.json();
                    alert('Lỗi khi thêm mới: ' + (errResult.message || 'Lỗi hệ thống'));
                }
            }
        } catch (error) {
            console.error('Lỗi lưu phiếu trả hàng:', error);
            alert('Lỗi hệ thống khi lưu');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bạn có chắc muốn xóa phiếu trả hàng này? Kho hàng sẽ tự động được điều chỉnh giảm.')) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('Xóa phiếu trả hàng thành công!');
                fetchData();
            } else {
                const errResult = await res.json();
                alert('Lỗi khi xóa: ' + (errResult.message || 'Lỗi hệ thống'));
            }
        } catch (error) {
            console.error('Lỗi xóa phiếu trả hàng:', error);
        }
    };

    const viewDetails = (item: any) => {
        setViewingItem(item);
    };

    const getAvailableSerials = () => {
        return selectedOrderDetails.filter(detail => {
            const isCurrentEditingSerial = editingId && editingId !== 0 && data.find(p => p.ma_phieu_tra === editingId)?.ma_serial === detail.ma_serial;
            if (isCurrentEditingSerial) return true;

            const isAlreadyReturned = data.some(p => p.ma_don_hang === formData.ma_don_hang && p.ma_serial === detail.ma_serial);
            return !isAlreadyReturned;
        });
    };

    const filtered = data.filter(p =>
        p.ma_phieu_tra.toString().includes(searchTerm) ||
        p.ma_serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ten_khach_hang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ten_san_pham?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="grid">
            <div className="card">
                <div className="products-header">
                    <h3>Quản Lý Phiếu Trả Hàng (Khách Trả Về Shop)</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã phiếu, khách hàng, serial, sản phẩm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                            style={{ width: '350px' }}
                        />
                        <button className="btn btn-jbl" onClick={() => setEditingId(0)}>+ Tạo Phiếu Trả</button>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Mã Phiếu Trả</th>
                            <th>Mã Đơn Hàng</th>
                            <th>Khách Hàng</th>
                            <th>Sản Phẩm</th>
                            <th>Mã Serial</th>
                            <th>Ngày Trả</th>
                            <th className="text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={7} className="empty-message">Chưa có dữ liệu</td></tr>
                        ) : (
                            filtered.map(item => (
                                <tr key={item.ma_phieu_tra}>
                                    <td className="font-semibold">PT{item.ma_phieu_tra}</td>
                                    <td>DH{item.ma_don_hang}</td>
                                    <td>{item.ten_khach_hang}</td>
                                    <td>{item.ten_san_pham || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Không rõ</span>}</td>
                                    <td className="font-mono">{item.ma_serial}</td>
                                    <td>{item.ngay_tra ? new Date(item.ngay_tra).toLocaleDateString() : ''}</td>
                                    <td className="text-right">
                                        <button className="btn btn-edit" onClick={() => viewDetails(item)}>Chi Tiết</button>
                                        <button className="btn btn-edit" onClick={() => handleEdit(item)} style={{ marginLeft: '6px', backgroundColor: '#e0f2fe', color: '#0369a1' }}>Sửa</button>
                                        <button className="btn btn-delete" onClick={() => handleDelete(item.ma_phieu_tra)} style={{ marginLeft: '6px' }}>Xóa</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Tạo / Sửa Phiếu Trả Hàng */}
            {editingId !== null && (
                <div className="modal-overlay">
                    <div className="card modal-card" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3>{editingId === 0 ? 'Tạo Phiếu Trả Hàng Khách Hàng' : `Cập Nhật Phiếu Trả PT${editingId}`}</h3>
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
                                {donHangs.map(dh => (
                                    <option key={dh.ma_don_hang} value={dh.ma_don_hang}>
                                        DH{dh.ma_don_hang} - Khách: {(dh as any).ten_khach_hang}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-row form-row-clean">
                            <label className="form-label">Chọn Mã Serial Sản Phẩm Trả:</label>
                            <select 
                                name="ma_serial" 
                                value={formData.ma_serial} 
                                onChange={handleInputChange}
                                className="form-select-full"
                                disabled={!formData.ma_don_hang || loadingSerials}
                            >
                                {!formData.ma_don_hang ? (
                                    <option value="">-- Vui lòng chọn đơn hàng trước --</option>
                                ) : loadingSerials ? (
                                    <option value="">Đang tải các mã serial...</option>
                                ) : (
                                    <>
                                        <option value="">-- Chọn mã serial --</option>
                                        {getAvailableSerials().map(detail => (
                                            <option key={detail.ma_chi_tiet} value={detail.ma_serial}>
                                                {detail.ma_serial} - {detail.ten_san_pham}
                                            </option>
                                        ))}
                                        {getAvailableSerials().length === 0 && (
                                            <option value="" disabled>Không còn mã serial khả dụng để trả</option>
                                        )}
                                    </>
                                )}
                            </select>
                        </div>

                        {formData.ma_serial && selectedOrderDetails.length > 0 && (
                            <div className="form-row form-row-clean" style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#64748b' }}>Thông tin sản phẩm trả:</p>
                                <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                                    {selectedOrderDetails.find(d => d.ma_serial === formData.ma_serial)?.ten_san_pham}
                                </p>
                                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--accent)', fontWeight: 600 }}>
                                    Giá trị bán: {Number(selectedOrderDetails.find(d => d.ma_serial === formData.ma_serial)?.gia_ban || 0).toLocaleString()}đ
                                </p>
                            </div>
                        )}

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

            {/* Modal Xem Chi Tiết Phiếu Trả Hàng */}
            {viewingItem && (
                <div className="modal-overlay">
                    <div className="card modal-card" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3>Chi Tiết Phiếu Trả Hàng PT{viewingItem.ma_phieu_tra}</h3>
                            <button className="btn btn-cancel modal-close" onClick={() => setViewingItem(null)}>✕</button>
                        </div>
                        <div className="detail-summary" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '10px 0' }}>
                            <p style={{ margin: 0 }}><strong>Mã Phiếu Trả:</strong> PT{viewingItem.ma_phieu_tra}</p>
                            <p style={{ margin: 0 }}><strong>Đơn Hàng Gốc:</strong> DH{viewingItem.ma_don_hang}</p>
                            <p style={{ margin: 0 }}><strong>Khách Hàng:</strong> {viewingItem.ten_khach_hang}</p>
                            <p style={{ margin: 0 }}><strong>Sản Phẩm Trả Lại:</strong> {viewingItem.ten_san_pham || 'Không rõ'}</p>
                            <p style={{ margin: 0 }}><strong>Mã Serial:</strong> <span className="font-mono" style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{viewingItem.ma_serial}</span></p>
                            <p style={{ margin: 0 }}><strong>Ngày Trả:</strong> {viewingItem.ngay_tra ? new Date(viewingItem.ngay_tra).toLocaleString() : ''}</p>
                            <div style={{ marginTop: '10px', padding: '12px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '6px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <div style={{ fontSize: '20px', color: '#059669' }}>✓</div>
                                <div style={{ fontSize: '13px', color: '#065f46' }}>Hàng hóa đã được hoàn trả thành công về kho. Số lượng tồn kho của sản phẩm này đã tự động được tăng thêm 1 đơn vị.</div>
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
