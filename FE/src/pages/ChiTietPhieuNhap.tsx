import React, { useState } from 'react';
import { ChiTietPhieuNhap } from '../types';

export default function ChiTietPhieuNhapPage() {
    const [data, setData] = useState<ChiTietPhieuNhap[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = data.filter(p =>
        p.ma_phieu_nhap.toString().includes(searchTerm)
    );

    return (
        <div className="grid">
            <div className="card">
                <div className="products-header">
                    <h3>Chi Tiết Phiếu Nhập</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm mã phiếu nhập..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <button className="btn btn-jbl">+ Thêm Chi Tiết</button>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Mã Chi Tiết</th>
                            <th>Mã Phiếu Nhập</th>
                            <th>Mã Sản Phẩm</th>
                            <th>Số Lượng</th>
                            <th className="text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={5} className="empty-message">Chưa có dữ liệu</td></tr>
                        ) : (
                            filtered.map(item => (
                                <tr key={item.ma_chi_tiet}>
                                    <td className="font-semibold">CTPN{item.ma_chi_tiet}</td>
                                    <td>PN{item.ma_phieu_nhap}</td>
                                    <td>SP{item.ma_san_pham}</td>
                                    <td>{item.so_luong}</td>
                                    <td className="text-right">
                                        <button className="btn btn-edit">Sửa</button>
                                        <button className="btn btn-delete">Xóa</button>
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
