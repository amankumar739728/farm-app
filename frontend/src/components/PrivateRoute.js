import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { refreshToken } from "../api/auth";

const PrivateRoute = ({ children }) => {
  const { token, logout } = useAuth();

  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          const expirationTime = decodedToken.exp * 1000;
          const currentTime = Date.now();
          
          if (currentTime > expirationTime) {
            try {
              await refreshToken();
            } catch (error) {
              logout();
            }
          }
        } catch (error) {
          logout();
        }
      }
    };

    validateToken();
  }, [token, logout]);

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
};


export default PrivateRoute;
