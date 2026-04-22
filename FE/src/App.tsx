import React from "react";
import Sidebar from "./component/Sidebar";
import Header from "./component/Header";
import Dashboard from "./pages/Dashboard";
import DoiTac from "./pages/DoiTac";
import DanhMuc from "./pages/DanhMuc";
import SanPham from "./pages/SanPham";
import PhieuNhap from "./pages/PhieuNhap";
import DonHang from "./pages/DonHang";
import PhieuGiaoHang from "./pages/PhieuGiaoHang";
import PhieuTraHang from "./pages/PhieuTraHang";
import PhieuTraNCC from "./pages/PhieuTraNCC";
import ChiTietPhieuNhap from "./pages/ChiTietPhieuNhap";

class App extends React.Component {
  state = {
    activeSection: "dashboard"
  };

  changeSection = (section: string) => {
    this.setState({ activeSection: section });
  };

  render() {
    return (
      <div className="app">
        <Header />
        <div className="main-layout">
          <Sidebar
            activeSection={this.state.activeSection}
            onChange={this.changeSection}
          />
          <main className="content">
            {this.state.activeSection === "dashboard" && <Dashboard />}
            {this.state.activeSection === "doitac" && <DoiTac />}
            {this.state.activeSection === "danhmuc" && <DanhMuc />}
            {this.state.activeSection === "sanpham" && <SanPham />}
            {this.state.activeSection === "phieunhap" && <PhieuNhap />}
            {this.state.activeSection === "chitietphieunhap" && <ChiTietPhieuNhap />}
            {this.state.activeSection === "donhang" && <DonHang />}
            {this.state.activeSection === "phieugiaohang" && <PhieuGiaoHang />}
            {this.state.activeSection === "phieutrahang" && <PhieuTraHang />}
            {this.state.activeSection === "phieutrancc" && <PhieuTraNCC />}
          </main>
        </div>
      </div>
    );
  }
}

export default App;