// import axios from "axios";

// // Base URL of your FastAPI backend
// const API_BASE_URL = "http://0.0.0.0:9123"; // Change this if using a different host/port

// // Function to fetch team details
// export const getTeamDetails = async (teamName) => {
//   try {
//     const response = await axios.get(`${API_BASE_URL}/auction/team_details/${teamName}`);
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching team details:", error.response?.data || error.message);
//     throw error;
//   }
// };

// // Function to create a new team
// export const createTeam = async (teamData) => {
//   try {
//     const response = await axios.post(`${API_BASE_URL}/auction/team/`, teamData);
//     return response.data;
//   } catch (error) {
//     console.error("Error creating team:", error.response?.data || error.message);
//     throw error;
//   }
// };






// import axios from "axios";
// import { refreshToken } from "./auth";

// const API_URL = "http://localhost:9123"; // Update with your FastAPI URL

// // Get token from localStorage
// const getToken = () => localStorage.getItem("token");

// // Axios instance with default headers
// const api = axios.create({
//   baseURL: API_URL,
//   headers: { "Content-Type": "application/json" }
// });

// // Add Authorization header to each request
// api.interceptors.request.use((config) => {
//   const token = getToken();
//   if (token) {
//     console.log("Token added to request:", token);
//     config.headers.Authorization = `Bearer ${token}`;
//   } else {
//     console.error("No token found in localStorage");
//   }
//   return config;
// });

// // Add response interceptor to handle token refresh
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
    
//     // If 401 error and not a refresh request
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       console.log("Detected 401 unauthorized error, attempting token refresh...");
//       originalRequest._retry = true;
      
//       try {
//         console.log("Refreshing token...");
//         const newToken = await refreshToken();
//         console.log("Token refresh successful, new token:", newToken);
//         localStorage.setItem("token", newToken);
        
//         // Update Authorization header and retry request
//         console.log("Retrying original request with new token");
//         originalRequest.headers.Authorization = `Bearer ${newToken}`;
//         return api(originalRequest);
//       } catch (refreshError) {
//         console.error("Token refresh failed:", refreshError);
//         console.log("Clearing token and redirecting to login");
//         localStorage.removeItem("token");
//         window.location.href = '/login';
//         return Promise.reject(refreshError);
//       }
//     }
    
//     console.log("Non-401 error or already retried, passing through error");
//     return Promise.reject(error);
//   }
// );


// export default api;




import axios from "axios";

const API_URL = "https://farm-app-t7hi.onrender.com";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" }
});

// ✅ Ensure token is added to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("🔑 Sending Request with Token:", token); // Debugging
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.method === 'OPTIONS') {
    config.headers['Access-Control-Request-Headers'] = 'Authorization';
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const response = await axios.post(`${API_URL}/refresh-token`, { refreshToken });
        const newAccessToken = response.data.access_token;
        localStorage.setItem("token", newAccessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("🚨 Token Refresh Failed:", refreshError);
        // logout();
        // window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);


export default api;



// import axios from 'axios';
// import {logout } from './auth';
// // import { useAuth } from '../context/AuthContext';

// const API_URL = "http://localhost:9123";

// const api = axios.create({
//   baseURL: API_URL,
//   headers: { "Content-Type": "application/json" }
// });

// // Ensure token is added to every request
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// Handle token refresh on 401 errors
// api.interceptors.response.use(
//   response => response,
//   async error => {
//     const originalRequest = error.config;

//     if (error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       try {
//         const refreshToken = localStorage.getItem("refreshToken");
//         const response = await axios.post(`${API_URL}/refresh-token`, { refreshToken });
//         const newAccessToken = response.data.access_token;
//         localStorage.setItem("token", newAccessToken);
//         api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
//         return api(originalRequest);
//       } catch (refreshError) {
//         console.error("🚨 Token Refresh Failed:", refreshError);
//         // logout();
//         // window.location.href = '/login';
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;



// import axios from 'axios';
// // import { refreshToken, logout } from './auth';

// const API_URL = "http://localhost:9123";

// const api = axios.create({
//   baseURL: API_URL,
//   headers: { "Content-Type": "application/json" }
// });

// // Ensure token is added to every request
// api.interceptors.request.use((config) => {
//   const token = window.localStorage.getItem("token"); // Keep this as is

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // Handle token refresh on 401 errors
// api.interceptors.response.use(
//   response => response,
//   async error => {
//     const originalRequest = error.config;
//     debugger
//     if (error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       try {
//         await refreshToken(); // Use the refreshToken function to get a new access token
//         const newAccessToken = localStorage.getItem("token");
//         api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
//         return api(originalRequest);
//       } catch (refreshError) {
//         console.error("Token Refresh Failed:", refreshError);
//         logout();
//         window.location.href = '/login';
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;





// import axios from 'axios';
// import { refreshToken, logout } from './auth';

// const API_URL = "http://localhost:9123";
// const token = localStorage.getItem("token");

// const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     Authorization: `Bearer ${token}`,
//     "Content-Type": "application/json",
//   },
//   withCredentials: true
// });

// // Ensure token is added to every request
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   console.log("🔑 Sending Request with Token:", token); // Debugging
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });


// // Add request interceptor to log headers
// api.interceptors.request.use(config => {
//   console.log("Request headers:", config.headers);
//   // Ensure Authorization header is included in preflight requests
//   if (config.method === 'OPTIONS') {
//     config.headers['Access-Control-Request-Headers'] = 'Authorization';
//   }
//   return config;
// });
// // Handle token refresh on 401 errors
// api.interceptors.response.use(
//   response => response,
//   async error => {
//     const originalRequest = error.config;

//     if (error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         console.log("🔄 Attempting to refresh token..."); // Debugging
//         const newAccessToken = await refreshToken();
//         localStorage.setItem("token", newAccessToken);
//         api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
//         originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
//         return api(originalRequest);
//       } catch (refreshError) {
//         console.error("Token refresh failed:", refreshError);
//         logout();
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;
