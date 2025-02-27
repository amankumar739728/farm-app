// src/components/Navbar.js
import React from "react";

const Navbar = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="navbar">
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
    </nav>
  );
};

export default Navbar;