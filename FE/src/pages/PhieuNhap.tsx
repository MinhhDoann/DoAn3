import React, { useState } from 'react';
import { PhieuNhap } from '../types';

export default function PhieuNhapPage() {
    const [data, setData] = useState<PhieuNhap[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = data.filter(p =>
        p.ma_phieu_nhap.toString().includes(searchTerm)
    );

    return (
        <div className="grid">
            <div className="card">
                <div className="products-header">
                    <h3>Phiếu Nhập Hàng (Từ NCC)</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm mã phiếu nhập..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <button className="btn btn-jbl">+ Tạo Phiếu Nhập</button>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Mã Phiếu Nhập</th>
                            <th>Mã Nhà Cung Cấp</th>
                            <th>Ngày Nhập</th>
                            <th className="text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={4} className="empty-message">Chưa có dữ liệu</td></tr>
                        ) : (
                            filtered.map(item => (
                                <tr key={item.ma_phieu_nhap}>
                                    <td className="font-semibold">PN{item.ma_phieu_nhap}</td>
                                    <td>NCC-{item.ma_ncc}</td>
                                    <td>{item.ngay_nhap}</td>
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
