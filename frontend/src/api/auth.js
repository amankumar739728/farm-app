import api from "./api";

export const login = async (username, password) => {
  try {
    const response = await api.post("/login", { username, password });
    const { access_token, refresh_token } = response.data; // Ensure keys match the response

    console.log("Login response:", response.data); // Log the response data

    if (!access_token || !refresh_token) throw new Error("No token received");

    localStorage.setItem("token", access_token);
    localStorage.setItem("refreshToken", refresh_token); // Ensure consistent key usage

    console.log("Tokens stored in localStorage:", { access_token, refresh_token });

    return access_token;
  } catch (error) {
    console.error("Login Error:", error.response?.data?.detail || error.message);
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    const tokenRefresh = window.test_token_refresh; // Retrieve from memory
    console.log("Refresh token ...", tokenRefresh);
    if (!tokenRefresh) throw new Error("No refresh token available");

    const response = await api.post("/refresh-token", { refresh_token: tokenRefresh });
    const newAccessToken = response.data.access_token;

    if (!newAccessToken) throw new Error("No token received from refresh");

    const tokenParts = newAccessToken.split('.');
    if (tokenParts.length !== 3) {
      throw new Error("Invalid token format");
    }

    localStorage.setItem("token", newAccessToken);
    console.log("New token stored after refresh:", newAccessToken);
    console.log("Token payload:", JSON.parse(atob(tokenParts[1])));

    return newAccessToken;
  } catch (error) {
    console.error("Token refresh failed:", error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("tokenRefresh"); // Ensure key matches
  window.location.href = '/login';
};