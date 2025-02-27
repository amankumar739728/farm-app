import api from "./api";

export const login = async (username, password) => {
  try {
    const response = await api.post("/login", { username, password });
    
    console.log("API Response:", response.data);

    const { access_token } = response.data;
    if (!access_token) throw new Error("No token received");

    // Verify token structure
    const tokenParts = access_token.split('.');
    if (tokenParts.length !== 3) {
      throw new Error("Invalid token format");
    }
    
    localStorage.setItem("token", access_token);
    console.log("Token stored in localStorage:", access_token);
    console.log("Token payload:", JSON.parse(atob(tokenParts[1])));


    return access_token;


  } catch (error) {
    console.error("Login Error:", error.response?.data?.detail || error.message);
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    const response = await api.post("/refresh-token");


    const newToken = response.data.access_token;
    
    if (!newToken) throw new Error("No token received from refresh");

    // Verify token structure
    const tokenParts = newToken.split('.');
    if (tokenParts.length !== 3) {
      throw new Error("Invalid token format");
    }
    
    localStorage.setItem("token", newToken);
    console.log("New token stored after refresh:", newToken);
    console.log("Token payload:", JSON.parse(atob(tokenParts[1])));

    
    return newToken;
  } catch (error) {
    console.error("Token refresh failed:", error);
    throw error;
  }
};


export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");

  window.location.href = '/login';
};
