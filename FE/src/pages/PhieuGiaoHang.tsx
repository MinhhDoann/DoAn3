import React, { useState } from 'react';
import { PhieuGiaoHang } from '../types';

export default function PhieuGiaoHangPage() {
    const [data, setData] = useState<PhieuGiaoHang[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = data.filter(p =>
        p.ma_phieu_giao.toString().includes(searchTerm)
    );

    return (
        <div className="grid">
            <div className="card">
                <div className="products-header">
                    <h3>Phiếu Giao Hàng</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm mã phiếu giao..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <button className="btn btn-jbl">+ Tạo Phiếu Giao</button>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Mã Phiếu Giao</th>
                            <th>Mã Đơn Hàng</th>
                            <th>Mã Shipper</th>
                            <th>Trạng Thái Giao</th>
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
                                    <td>SP{item.ma_shipper}</td>
                                    <td>
                                        <span className={`status-badge`} style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                                            {item.trang_thai_giao}
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <button className="btn btn-edit">Cập Nhật TT</button>
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
