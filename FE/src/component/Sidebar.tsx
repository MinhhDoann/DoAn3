import React from 'react';

interface SidebarProps {
  activeSection: string;
  onChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'doitac', label: 'Đối Tác' },
    { id: 'danhmuc', label: 'Danh Mục' },
    { id: 'sanpham', label: 'Sản Phẩm' },
    { id: 'phieunhap', label: 'Phiếu Nhập' },
    { id: 'chitietphieunhap', label: 'Chi Tiết Phiếu Nhập' },
    { id: 'donhang', label: 'Đơn Hàng' },
    { id: 'chitietdonhang', label: 'Chi Tiết Đơn Hàng' },
    { id: 'phieugiaohang', label: 'Phiếu Giao Hàng' },
    { id: 'phieutrahang', label: 'Trả Hàng (Khách)' },
    { id: 'phieutrancc', label: 'Trả Hàng (NCC)' },
  ];
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Admin Panel</h2>
      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li
            key={item.id}
            className={`nav-button ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => onChange(item.id)}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
