import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { refreshToken } from "../api/auth"; // Import the refreshToken function

const PrivateRoute = ({ children }) => {
  const { token, logout } = useAuth();

  useEffect(() => {
    const handle401Error = async () => {
      try {
        // Attempt to refresh the token
        console.log('Inside private router try block');
        await refreshToken();
      } catch (error) {
        console.log('Inside the priavte router catch block');
        // If refresh fails, log out the user
        logout();
      }
    };

    // Check if the token is expired or invalid
    if (!token) {
      handle401Error();
    }
  }, [token, logout]);

  return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
