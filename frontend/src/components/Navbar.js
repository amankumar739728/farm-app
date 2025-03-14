// src/components/Navbar.js
import React from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useNavigate

const Navbar = ({ activeTab, setActiveTab }) => {
  const location = useLocation(); // Get the current route location
  const navigate = useNavigate(); // Hook for navigation

  return (
    <nav className="navbar">
      {/* Show Details and Dynamic_Details buttons only on the Dashboard page */}
      {location.pathname === "/dashboard" && (
        <>
          <button
            className={`nav-button ${activeTab === "get" ? "active" : ""}`}
            onClick={() => setActiveTab("get")}
          >
            Details
          </button>
          <button
            className={`nav-button ${activeTab === "post" ? "active" : ""}`}
            onClick={() => setActiveTab("post")}
          >
            Dynamic_Details
          </button>
        </>
      )}

      {/* Show Auction button only if NOT on the Auction page */}
      {location.pathname !== "/auction" && (
        <button
          className="nav-button"
          onClick={() => navigate("/auction")} // Navigate to /auction
        >
          Auction
        </button>
      )}
    </nav>
  );
};

export default Navbar;