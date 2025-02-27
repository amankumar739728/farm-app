import React from "react";
import Header from "./Header";  // ✅ Header is inside Layout

const Layout = ({ children }) => {
  return (
    <>
      <Header />  {/* ✅ This makes the header always visible */}
      <main className="app-container">{children}</main>
    </>
  );
};

export default Layout;
