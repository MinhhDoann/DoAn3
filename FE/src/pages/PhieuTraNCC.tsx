import React, { useState } from 'react';
import { PhieuTraNCC } from '../types';

export default function PhieuTraNCCPage() {
    const [data, setData] = useState<PhieuTraNCC[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = data.filter(p =>
        p.ma_phieu_tra_ncc.toString().includes(searchTerm) || 
        p.ma_serial.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="grid">
            <div className="card">
                <div className="products-header">
                    <h3>Phiếu Trả Hàng (Shop Trả Cho NCC)</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm mã phiếu hoặc mã serial..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <button className="btn btn-jbl">+ Tạo Phiếu Trả NCC</button>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Mã Phiếu Trả NCC</th>
                            <th>Mã Nhà Cung Cấp</th>
                            <th>Ngày Trả</th>
                            <th>Mã Serial Hàng Hóa</th>
                            <th className="text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={5} className="empty-message">Chưa có dữ liệu</td></tr>
                        ) : (
                            filtered.map(item => (
                                <tr key={item.ma_phieu_tra_ncc}>
                                    <td className="font-semibold">PTN{item.ma_phieu_tra_ncc}</td>
                                    <td>NCC-{item.ma_ncc}</td>
                                    <td>{item.ngay_tra}</td>
                                    <td className="font-mono">{item.ma_serial}</td>
                                    <td className="text-right">
                                        <button className="btn btn-edit">Chi Tiết</button>
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
