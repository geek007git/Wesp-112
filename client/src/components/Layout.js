import React from "react";
import { Badge, message } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "../styles/LayoutStyles.css";

const userMenu = [
  { name: "Home", path: "/", icon: "🏠" },
  { name: "Appointments", path: "/appointments", icon: "📅" },
  { name: "Apply Doctor", path: "/apply-doctor", icon: "🩺" },
];

const doctorMenu = [
  { name: "Home", path: "/", icon: "🏠" },
  { name: "Appointments", path: "/doctor/appointments", icon: "📅" },
  { name: "Profile", path: "/doctor/profile", icon: "👤" },
];

const adminMenu = [
  { name: "Home", path: "/", icon: "🏠" },
  { name: "Users", path: "/admin/users", icon: "👥" },
  { name: "Doctors", path: "/admin/doctors", icon: "🩺" },
];

const Layout = ({ children }) => {
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const menu = user && user.isAdmin ? adminMenu : user && user.isDoctor ? doctorMenu : userMenu;

  const handleLogout = () => {
    localStorage.clear();
    message.success("Logout Successfully");
    navigate("/login");
  };

  return (
    <div className="main">
      <div className="layout">
        <div className="sidebar">
          <div className="logo">
            <h6>DOC APP</h6>
            <hr />
          </div>
          <div className="menu">
            {menu.map((item) => (
              <div
                key={item.path}
                className={`menu-item ${
                  location.pathname === item.path ? "active" : ""
                }`}
              >
                <span className="menu-icon">{item.icon}</span>
                <Link to={item.path}>{item.name}</Link>
              </div>
            ))}
            <div className="menu-item" onClick={handleLogout}>
              <span className="menu-icon">🚪</span>
              <Link to="/login">Logout</Link>
            </div>
          </div>
        </div>
        <div className="content">
          <div className="header">
            <div className="header-content">
              <Badge
                count={user && user.notifications ? user.notifications.length : 0}
                onClick={() => navigate("/notification")}
              >
                <span className="bell">🔔</span>
              </Badge>
              <span className="user-name">{user ? user.name : ""}</span>
            </div>
          </div>
          <div className="body">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
