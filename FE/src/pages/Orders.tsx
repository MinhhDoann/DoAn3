import React, { useState } from 'react';
import { Order } from '../types';

export default function Orders() {

  const [orders] = useState<Order[]>([]);

  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const getStatusTheme = (status: string) => {
    switch (status) {
      case 'PENDING': return { bg: '#fef3c7', text: '#d97706', label: 'Chờ xử lý' };
      case 'CONFIRMED': return { bg: '#dbeafe', text: '#1d4ed8', label: 'Đã xác nhận' };
      case 'SHIPPING': return { bg: '#ffedd5', text: '#c2410c', label: 'Đang giao' };
      case 'COMPLETED': return { bg: '#dcfce7', text: '#15803d', label: 'Hoàn thành' };
      case 'CANCELLED': return { bg: '#fee2e2', text: '#b91c1c', label: 'Đã hủy' };
      default: return { bg: '#f3f4f6', text: '#374151', label: status };
    }
  };

  const filtered = filterStatus === 'ALL' ? orders : orders.filter(o => o.Status === filterStatus);

  return (
    <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
      <div className="card">
        <div className="products-header">
          <h3>Quản lý Đơn hàng</h3>
          <select
            className="search-input"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="SHIPPING">Đang giao</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
        <table>
          <thead>
            <tr>
              <th>Mã ĐH</th>
              <th>Khách hàng</th>
              <th className="text-right">Tổng tiền</th>
              <th>Thanh toán</th>
              <th className="text-center">Trạng thái</th>
              <th>Ngày đặt</th>
              <th className="text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="empty-message">Không có đơn hàng nào đáp ứng bộ lọc</td></tr>
            ) : (
              filtered.map(order => {
                const theme = getStatusTheme(order.Status);
                return (
                  <tr key={order.OrderID}>
                    <td className="font-semibold">#{order.OrderID}</td>
                    <td>ID KH: {order.UserID}</td>
                    <td className="text-right font-semibold" style={{ color: 'var(--accent)' }}>
                      {order.TotalAmount.toLocaleString('vi-VN')} ₫
                    </td>
                    <td>{order.PaymentMethod}</td>
                    <td className="text-center">
                      <span
                        className="status-badge"
                        style={{ backgroundColor: theme.bg, color: theme.text }}
                      >
                        {theme.label}
                      </span>
                    </td>
                    <td>{order.CreatedAt}</td>
                    <td className="text-right">
                      <button className="btn btn-edit">Chi tiết</button>
                      {order.Status === 'PENDING' && (
                        <button className="btn btn-jbl" style={{ fontSize: '13px', padding: '6px 12px' }}>Duyệt</button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}