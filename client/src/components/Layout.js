import React from "react";
import { Badge, message } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Chatbot from "./Chatbot";
import "../styles/LayoutStyles.css";

const userMenu = [
  { name: "Find a doctor", path: "/", icon: "⌕" },
  { name: "Appointments", path: "/appointments", icon: "▦" },
  { name: "Apply as a doctor", path: "/apply-doctor", icon: "✚" },
];

const doctorMenu = [
  { name: "Overview", path: "/", icon: "⌂" },
  { name: "Appointments", path: "/doctor/appointments", icon: "▦" },
  { name: "My profile", path: "/doctor/profile", icon: "◉" },
];

const adminMenu = [
  { name: "Overview", path: "/", icon: "⌂" },
  { name: "Users", path: "/admin/users", icon: "♙" },
  { name: "Doctors", path: "/admin/doctors", icon: "✚" },
  { name: "Demo data", path: "/admin/demo-data", icon: "✦" },
];

const Layout = ({ children }) => {
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const menu = user?.isAdmin ? adminMenu : user?.isDoctor ? doctorMenu : userMenu;
  const initials = (user?.name || "M")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    localStorage.clear();
    message.success("Logged out successfully");
    navigate("/login");
  };

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/" || location.pathname.startsWith("/doctor/book-appointment")
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <div className="main">
      <div className="layout">
        <aside className="sidebar">
          <Link className="logo" to="/" aria-label="MediMate home">
            <span className="brand-mark"><span>+</span></span>
            <span className="brand-copy"><strong>medimate</strong><small>CARE, MADE PERSONAL</small></span>
          </Link>
          <div className="sidebar-label">YOUR SPACE</div>
          <nav className="menu" aria-label="Main navigation">
            {menu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`menu-item${isActive(item.path) ? " active" : ""}`}
                aria-current={isActive(item.path) ? "page" : undefined}
              >
                <span className="menu-icon" aria-hidden="true">{item.icon}</span>
                <span>{item.name}</span>
                {isActive(item.path) && <span className="active-indicator" aria-hidden="true" />}
              </Link>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="sidebar-care-mark" aria-hidden="true">✳</div>
            <p>Good health is built<br />one small step at a time.</p>
            <span>TAKE CARE OF YOU</span>
          </div>
        </aside>

        <div className="content">
          <header className="header">
            <div className="header-brandline"><span className="header-dot" /> A calmer way to care for yourself</div>
            <div className="header-content">
              <button className="notification-button" type="button" onClick={() => navigate("/notification")} aria-label="Notifications">
                <Badge count={user?.notifications?.length || 0} size="small">
                  <svg className="bell" aria-hidden="true" viewBox="0 0 24 24" fill="none">
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Badge>
              </button>
              <span className="account-divider" />
              <div className="account-chip">
                <span className="account-avatar">{initials}</span>
                <span className="account-name">{user?.name || "Welcome"}<small>{user?.isAdmin ? "Administrator" : user?.isDoctor ? "Care provider" : "Patient account"}</small></span>
              </div>
              <button className="logout-button" type="button" onClick={handleLogout}>Log out</button>
            </div>
          </header>
          <main className="body">{children}</main>
        </div>
      </div>
      <Chatbot />
    </div>
  );
};

export default Layout;
