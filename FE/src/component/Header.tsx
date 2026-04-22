import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-logo">
          Quản lý cửa hàng loa di động JBL
        </h1>
      </div>
      <div className="header-right">
        <div className="user-info">
          <div className="user-name">Nguyễn Văn A</div>
          <div className="user-role">Admin</div>
        </div>
        <div className="user-avatar">
          A
        </div>
      </div>
    </header>
  );
};

export default Header;
