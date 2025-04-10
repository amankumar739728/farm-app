import React, { useContext, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { 
  FaSignOutAlt, 
  FaCog, 
  FaUserCircle, 
  FaChevronDown, 
  FaChevronUp,
  FaUser,
  FaKey
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

import lightLogo from "../assets/company-logo-light.png";
import darkLogo from "../assets/company-logo-dark.png";

const Header = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { logout, userRole, username } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Hide Logout Button on Auth pages
  const isAuthPage =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/reset-password";

  const logoSrc = isDarkMode ? darkLogo : lightLogo;

  const handleProfileClick = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowUserDropdown(false);
  };

  const handlePasswordChange = () => {
    navigate("/change-password");
    setShowUserDropdown(false);
  };

  const handleProfileView = () => {
    navigate("/profile");
    setShowUserDropdown(false);
  };

  return (
    <header className={`app-header ${isDarkMode ? "dark-mode" : ""}`}>
      <div className="logo-container">
        <img src={logoSrc} alt="Company Logo" className="company-logo" />
      </div>

      <div className="header-actions">
        <button onClick={toggleTheme} className="theme-toggle">
          {isDarkMode ? "🌞 Light" : "🌙 Dark"}
        </button>

        {!isAuthPage && (
          <div className="user-profile-container">
            <div className="user-profile" onClick={handleProfileClick}>
              <FaUserCircle className="user-icon" />
              <span className="username">{username || "User"}</span>
              {showUserDropdown ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            
            {showUserDropdown && (
              <div className={`user-dropdown ${isDarkMode ? "dark-mode" : ""}`}>
                <div className="user-info">
                  <FaUserCircle className="dropdown-user-icon" />
                  <div>
                    <p className="user-role">{userRole}</p>
                    <p className="user-email">{username}</p>
                  </div>
                </div>
                
                <div className="dropdown-divider"></div>
                
                <button 
                  onClick={handleProfileView}
                  className="dropdown-item"
                >
                  <FaUser className="dropdown-icon" /> My Profile
                </button>
                
                <button 
                  onClick={handlePasswordChange}
                  className="dropdown-item"
                >
                  <FaKey className="dropdown-icon" /> Change Password
                </button>
                
                {userRole === "admin" && (
                  <>
                    <div className="dropdown-divider"></div>
                    <Link 
                      to="/user-management" 
                      className="dropdown-item"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <FaCog className="dropdown-icon" /> User Management
                    </Link>
                  </>
                )}
                
                <div className="dropdown-divider"></div>
                <button 
                  onClick={handleLogout}
                  className="dropdown-item logout"
                >
                  <FaSignOutAlt className="dropdown-icon" /> Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;