import React, { useContext } from "react";
import { useLocation } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import LogoutButton from "./LogoutButton";
import { FaSignOutAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import "./Header.css";

import lightLogo from "../assets/company-logo-light.png";
import darkLogo from "../assets/company-logo-dark.png";

const Header = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();

  // ✅ Hide Logout Button on Login & Forgot Password pages
  const isLoginPage =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/reset-password";

  const logoSrc = isDarkMode ? darkLogo : lightLogo;

  return (
    <header className={`app-header ${isDarkMode ? "dark-mode" : ""}`}>
      <div className="logo-container">
        <img src={logoSrc} alt="Company Logo" className="company-logo" />
      </div>

      <div className="header-actions">
        <button onClick={toggleTheme} className="theme-toggle">
          {isDarkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>

        {/* ✅ Home Button for Forgot Password Page */}
        {location.pathname === "/forgot-password" && (
          <Link to="/login" className="home-button">
            <FaHome /> Home
          </Link>
        )}

        {/* ✅ Show Logout Button Only If Not on Login/Forgot Password */}
        {!isLoginPage && (
          <LogoutButton>
            <FaSignOutAlt /> Logout
          </LogoutButton>
        )}
      </div>
    </header>
  );
};

export default Header;