import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { refreshToken as refreshTokenApi } from "../api/auth";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState(null); // Add username state
  const navigate = useNavigate();

  const logout = useCallback(() => {
    setToken(null);
    setUserRole(null);
    setUsername(null); // Clear username on logout
    localStorage.removeItem("token");
    localStorage.removeItem("tokenRefresh");
    navigate("/");
  }, [navigate]);

  const refreshToken = useCallback(async () => {
    try {
      const data = await refreshTokenApi();
      const access_token = data.access_token;
      setToken(access_token);
      localStorage.setItem("token", access_token);

      const decodedToken = jwtDecode(access_token);
      setUserRole(decodedToken.role);
      setUsername(decodedToken.sub); // Set username from token
    } catch (error) {
      console.error("Failed to refresh token:", error);
      logout();
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserRole(decodedToken.role);
      setUsername(decodedToken.sub); // Set username from token
    }
  }, [token]);

  const login = useCallback((data) => {
    const { access_token, refresh_token } = data;
    setToken(access_token);
    localStorage.setItem("token", access_token);
    localStorage.setItem("tokenRefresh", refresh_token);

    const decodedToken = jwtDecode(access_token);
    setUserRole(decodedToken.role);
    setUsername(decodedToken.sub); // Set username from token

    navigate("/dashboard");
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ token, login, logout, refreshToken, userRole, username }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};