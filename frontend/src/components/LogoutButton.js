import React from "react";
import { useAuth } from "../context/AuthContext";

const LogoutButton = () => {
  console.log("Logout button clicked"); // Debugging log

  const { logout } = useAuth();

  console.log("Calling logout function"); // Debugging log
  return (

    <button onClick={logout} style={{ marginLeft: "10px", cursor: "pointer" }}>
      Logout
    </button>
  );
};

export default LogoutButton;
