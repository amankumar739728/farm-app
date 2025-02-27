import { createContext, useContext, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const navigate = useNavigate();

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem("token");
    navigate("/");
  }, [navigate]);

  const login = useCallback((token) => {
    setToken(token);
    localStorage.setItem("token", token);
    navigate("/dashboard");
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
