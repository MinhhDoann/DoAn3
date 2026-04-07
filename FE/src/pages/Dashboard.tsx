import React from 'react';

export default function Dashboard() {
  return (
    <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '24px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Tổng doanh thu tháng</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-main)', marginTop: '10px' }}>0 ₫</div>
          <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-success)', fontWeight: 500 }}>Chưa có dữ liệu</div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '24px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Đơn hàng chờ duyệt</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#d97706', marginTop: '10px' }}>0</div>
          <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Chưa có dữ liệu</div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '24px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Sản phẩm sắp hết kho</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#ef4444', marginTop: '10px' }}>0</div>
          <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Chưa có dữ liệu</div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '24px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Khách hàng mới</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-main)', marginTop: '10px' }}>0</div>
          <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-success)', fontWeight: 500 }}>Chưa có dữ liệu</div>
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
              <th>Tên Khách hàng</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colSpan={5} className="empty-message">Chưa có đơn hàng nào</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
