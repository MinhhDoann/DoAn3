import React, { useState } from 'react';
import { ChiTietDonHang } from '../types';

export default function ChiTietDonHangPage() {
    const [data, setData] = useState<ChiTietDonHang[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = data.filter(p =>
        p.ma_don_hang.toString().includes(searchTerm)
    );

    return (
        <div className="grid">
            <div className="card">
                <div className="products-header">
                    <h3>Chi Tiết Đơn Hàng</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm mã đơn hàng..."
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
                            <th>Mã Đơn Hàng</th>
                            <th>Mã Sản Phẩm</th>
                            <th>Giá Bán</th>
                            <th>Mã Serial</th>
                            <th className="text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={5} className="empty-message">Chưa có dữ liệu</td></tr>
                        ) : (
                            filtered.map(item => (
                                <tr key={item.ma_chi_tiet}>
                                    <td className="font-semibold">CTDH{item.ma_chi_tiet}</td>
                                    <td>DH{item.ma_don_hang}</td>
                                    <td>SP{item.ma_san_pham}</td>
                                    <td>{item.gia_ban}</td>
                                    <td>{item.ma_serial}</td>
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
