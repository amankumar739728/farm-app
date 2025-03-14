import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { refreshToken as refreshTokenApi } from "../api/auth"; // Import the refreshToken function

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const navigate = useNavigate();

const logout = useCallback(() => {
  console.log("Logout function called"); // Debugging log
  console.log("LocalStorage before logout:", localStorage); // Debugging log

  setToken(null);
  localStorage.removeItem("token");
  localStorage.removeItem("tokenRefresh"); // Remove refresh token on logout
  console.log("LocalStorage after logout:", localStorage); // Debugging log

    navigate("/");
  }, [navigate]);

  const refreshToken = useCallback(async () => {
    try {
      const data = await refreshTokenApi(); // Call the refresh token API
      const access_token =  data; // Destructure tokens
      setToken(access_token);
      localStorage.setItem("token", access_token);
      // localStorage.setItem("refreshToken", access_token); // Save new refresh token
    } catch (error) {
      console.error("Failed to refresh token:", error);
      logout(); // Logout if refresh fails
    }
  }, [logout]);

  useEffect(() => {
    window.refreshToken = refreshToken; // Expose refreshToken globally
  }, [refreshToken]);

  const login = useCallback((data) => {
    const { access_token, refresh_token } = data;
    setToken(access_token);
    window.refreshToken = refresh_token;
    window.test_token_refresh = refresh_token;
    localStorage.setItem("token", access_token);
    localStorage.setItem("tokenRefresh", refresh_token);
    console.log('Token from window function', window.refreshToken) // Save refresh token
    navigate("/dashboard");
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ token, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
