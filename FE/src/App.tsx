import React, { useState, useEffect } from "react";
import Sidebar from "./component/Sidebar";
import Header from "./component/Header";
import Dashboard from "./pages/Dashboard";
import DoiTac from "./pages/DoiTac";
import DanhMuc from "./pages/DanhMuc";
import SanPham from "./pages/SanPham";
import PhieuNhap from "./pages/PhieuNhap";
import DonHang from "./pages/DonHang";
import ChiTietDonHang from "./pages/ChiTietDonHang";
import PhieuGiaoHang from "./pages/PhieuGiaoHang";
import PhieuTraHang from "./pages/PhieuTraHang";
import PhieuTraNCC from "./pages/PhieuTraNCC";
import ChiTietPhieuNhap from "./pages/ChiTietPhieuNhap";
import Login from "./pages/Login";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  
  const [activeSection, setActiveSection] = useState("dashboard");

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      setIsLoggedIn(false);
      localStorage.removeItem('isLoggedIn');
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <Header onLogout={handleLogout} />
      <div className="main-layout">
        <Sidebar
          activeSection={activeSection}
          onChange={setActiveSection}
        />
        <main className="content">
          {activeSection === "dashboard" && <Dashboard />}
          {activeSection === "doitac" && <DoiTac />}
          {activeSection === "danhmuc" && <DanhMuc />}
          {activeSection === "sanpham" && <SanPham />}
          {activeSection === "phieunhap" && <PhieuNhap />}
          {activeSection === "chitietphieunhap" && <ChiTietPhieuNhap />}
          {activeSection === "donhang" && <DonHang />}
          {activeSection === "chitietdonhang" && <ChiTietDonHang />}
          {activeSection === "phieugiaohang" && <PhieuGiaoHang />}
          {activeSection === "phieutrahang" && <PhieuTraHang />}
          {activeSection === "phieutrancc" && <PhieuTraNCC />}
        </main>
      </div>
    </div>
  );
}