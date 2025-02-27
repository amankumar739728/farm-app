import React from "react";
import { useAuth } from "../context/AuthContext";

const LogoutButton = () => {
  const { logout } = useAuth();

  return (
    <button onClick={logout} style={{ marginLeft: "10px", cursor: "pointer" }}>
      Logout
    </button>
  );
};

export default LogoutButton;


