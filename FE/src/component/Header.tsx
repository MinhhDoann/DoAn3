import React from 'react';

interface HeaderProps {
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-logo">
          JBL STORE ADMIN
        </h1>
      </div>
      <div className="header-right">
        <div className="user-info">
          <div className="user-name">Quản trị viên</div>
          <div className="user-role">Admin</div>
        </div>
        <div className="user-avatar" title="Click để đăng xuất" onClick={onLogout} style={{ cursor: 'pointer' }}>
          A
        </div>
        {onLogout && (
          <button className="btn btn-delete" onClick={onLogout} style={{ fontSize: '12px', padding: '4px 8px' }}>
            Đăng xuất
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
