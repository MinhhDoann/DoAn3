import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api/ChiTietPhieuNhap';

export default function ChiTietPhieuNhapPage() {
    const [data, setData] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

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
            console.error('Lỗi khi tải chi tiết phiếu nhập:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bạn có chắc muốn xóa chi tiết này? Tồn kho sẽ được trừ lại.')) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('Xóa chi tiết thành công!');
                fetchData();
            } else {
                alert('Lỗi khi xóa chi tiết');
            }
        } catch (error) {
            console.error('Lỗi xóa:', error);
        }
    };

    const filtered = data.filter(p =>
        p.ma_phieu_nhap.toString().includes(searchTerm) ||
        p.ten_san_pham?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="grid">
            <div className="card">
                <div className="products-header">
                    <h3>Toàn Bộ Chi Tiết Phiếu Nhập</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm mã phiếu hoặc SP..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Mã Chi Tiết</th>
                            <th>Mã Phiếu Nhập</th>
                            <th>Tên Sản Phẩm</th>
                            <th className="text-right">Số Lượng</th>
                            <th className="text-right">Giá Nhập</th>
                            <th className="text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={6} className="empty-message">Chưa có dữ liệu</td></tr>
                        ) : (
                            filtered.map(item => (
                                <tr key={item.ma_chi_tiet}>
                                    <td className="font-semibold">CTPN{item.ma_chi_tiet}</td>
                                    <td>PN{item.ma_phieu_nhap}</td>
                                    <td>{item.ten_san_pham}</td>
                                    <td className="text-right font-semibold">{item.so_luong}</td>
                                    <td className="text-right">{Number(item.gia_nhap).toLocaleString()}đ</td>
                                    <td className="text-right">
                                        <button className="btn btn-delete" onClick={() => handleDelete(item.ma_chi_tiet)}>Xóa</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
