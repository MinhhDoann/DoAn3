import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api/dashboard/stats';

interface DashboardStats {
  totalRevenue: number;
  pendingOrders: number;
  lowStock: number;
  totalCustomers: number;
  recentOrders: {
    ma_don_hang: number;
    ten_khach_hang: string;
    tong_tien: number;
    trang_thai: string;
    ngay_ban: string;
  }[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi khi tải dashboard:', err);
        setLoading(false);
      });
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Đã giao': return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'Đang giao': return { backgroundColor: '#dbeafe', color: '#1d4ed8' };
      case 'Hoàn về': return { backgroundColor: '#fee2e2', color: '#991b1b' };
      case 'Chờ duyệt': return { backgroundColor: '#fef3c7', color: '#92400e' };
      default: return { backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  if (loading) return <div className="loading" style={{ padding: '40px', textAlign: 'center' }}>Đang tải dữ liệu dashboard...</div>;
  if (!stats) return <div className="error" style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>Không thể tải dữ liệu dashboard</div>;

  return (
    <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '24px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Tổng doanh thu tháng</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-main)', marginTop: '10px' }}>
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-success)', fontWeight: 500 }}>Doanh thu ghi nhận mới</div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '24px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Đơn hàng chờ duyệt</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#d97706', marginTop: '10px' }}>
            {stats.pendingOrders}
          </div>
          <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Chưa tạo phiếu giao</div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '24px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Sản phẩm sắp hết kho</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#ef4444', marginTop: '10px' }}>
            {stats.lowStock}
          </div>
          <div style={{ marginTop: '8px', fontSize: '13px', color: '#ef4444', fontWeight: 500 }}>Số lượng tồn &lt; 10</div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '24px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Tổng khách hàng</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-main)', marginTop: '10px' }}>
            {stats.totalCustomers}
          </div>
          <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-success)', fontWeight: 500 }}>Khách hàng trong hệ thống</div>
        </div>

      </div>

      <div className="card" style={{ marginTop: '10px' }}>
        <div className="products-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ margin: 0 }}>Đơn hàng mới nhất</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Mã ĐH</th>
              <th>Khách hàng</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentOrders.length === 0 ? (
              <tr><td colSpan={5} className="empty-message">Chưa có đơn hàng nào</td></tr>
            ) : (
              stats.recentOrders.map(order => (
                <tr key={order.ma_don_hang}>
                  <td className="font-bold">DH{order.ma_don_hang}</td>
                  <td className="font-bold">{order.ten_khach_hang || 'N/A'}</td>
                  <td className="text-jbl font-bold">{formatCurrency(order.tong_tien || 0)}</td>
                  <td>
                    <span className="status-badge" style={getStatusStyle(order.trang_thai)}>
                      {order.trang_thai}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{formatDate(order.ngay_ban)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

