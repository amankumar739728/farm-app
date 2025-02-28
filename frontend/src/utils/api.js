import axios from "axios";
import { useAuth } from "../context/AuthContext";

export const useApi = () => {
  const { logout } = useAuth();
  const token = localStorage.getItem("token");

  // Validate token before creating axios instance
  if (!token) {
    console.warn("No authentication token found, redirecting to login...");
    logout();
    return null;  // Instead of throwing an error
  }

  console.log("Using token for API requests:", token);
  
  const api = axios.create({
    baseURL: 'https://farm-app-t7hi.onrender.com',
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    withCredentials: true
  });


  // Add request interceptor to log headers
  api.interceptors.request.use(config => {
    console.log("Request headers:", config.headers);
    // Ensure Authorization header is included in preflight requests
    if (config.method === 'OPTIONS') {
      config.headers['Access-Control-Request-Headers'] = 'Authorization';
    }
    return config;
  });



  // Add response interceptor to handle 401 errors
  api.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        logout();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return api;
};
