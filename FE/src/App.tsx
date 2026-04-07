import React from "react";
import Sidebar from "./component/Sidebar";
import Header from "./component/Header";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Orders from "./pages/Orders";

class App extends React.Component {
  state = {
    activeSection: "products"
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
            {this.state.activeSection === "products" && <Products />}
            {this.state.activeSection === "categories" && <Categories />}
            {this.state.activeSection === "orders" && <Orders />}
          </main>
        </div>
      </div>
    );
  }
}

export default App;