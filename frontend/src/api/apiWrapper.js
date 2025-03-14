// frontend/src/api/apiWrapper.js
import api from "./api";
import { refreshToken } from "./auth"; // Import the refreshToken function

const apiWrapper = async (method, url, data = null) => {
    try {
      const response = await api[method](url, data);
      return response;
    } catch (error) {
    //   if (error.config && error.config._retry) {
    //     // If the request has already been retried, rethrow the error
    //     throw error;
    //   }
      if (error.response) {
        if (error.response.status === 401) {
          console.log("401 error encountered, attempting to refresh token...");
          await refreshToken(); // Retry refreshing the token
          error.config._retry = true; // Mark the request as retried
          return await api[method](url, data); // Retry the original request
        } 
        if (error.response.status === 403){
            console.log("403 error encountered, redirecting user to login page...");
            throw error;
        }
        else {
          throw error; // Rethrow the error for further handling
        }
      } else {
        // If error.response is null or undefined, it's likely a CORS policy error
        console.error("CORS policy error:", error);
        throw error; // Rethrow the error for further handling
      }
    }
  };

export default apiWrapper;