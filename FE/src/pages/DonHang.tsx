import React, { useState } from 'react';
import { DonHang } from '../types';

export default function DonHangPage() {
    const [data, setData] = useState<DonHang[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = data.filter(d =>
        d.ma_don_hang.toString().includes(searchTerm)
    );

    return (
        <div className="grid">
            <div className="card">
                <div className="products-header">
                    <h3>Đơn Bán Hàng (Bán Cho Khách)</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm mã đơn hàng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <button className="btn btn-jbl">+ Tạo Đơn Hàng</button>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Mã Đơn Hàng</th>
                            <th>Mã Khách Hàng</th>
                            <th>Ngày Bán</th>
                            <th className="text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={4} className="empty-message">Chưa có dữ liệu</td></tr>
                        ) : (
                            filtered.map(item => (
                                <tr key={item.ma_don_hang}>
                                    <td className="font-semibold">DH{item.ma_don_hang}</td>
                                    <td>KH-{item.ma_khach_hang}</td>
                                    <td>{item.ngay_ban}</td>
                                    <td className="text-right">
                                        <button className="btn btn-edit">Chi Tiết</button>
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
