import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { token, userRole } = useAuth();

  if (!token) return <Navigate to="/login" />;
  if (!allowedRoles.includes(userRole)) return <Navigate to="/dashboard" />;

  return children;
};

export default RoleBasedRoute;
