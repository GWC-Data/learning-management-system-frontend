// import axios from "axios";

// // Create an Axios instance
// const apiClient = axios.create({
//   baseURL: "/", // Base URL is set to '/' because Vite's proxy handles the actual target URLs
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Helper to get token
// const getToken = () => localStorage.getItem("authToken");

// // Add a request interceptor to automatically add the Authorization header
// apiClient.interceptors.request.use(
//   (config) => {
//     const token = getToken();
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default apiClient;


import axios from "axios";
 
// Create an Axios instance
const apiClient = axios.create({
  baseURL: "/", // Adjust according to your backend API
  headers: {
    "Content-Type": "application/json",
  },
});
 
 
// Helper functions for token management
const getToken = () => localStorage.getItem("authToken");
const getTokenExpiry = () => localStorage.getItem("tokenExpiry");
const getUserEmail = () => localStorage.getItem("userEmail");
const getUserPassword = () => localStorage.getItem("userPassword");
 
const saveAuthData = (accessToken: string, tokenExpiry: string) => {
  localStorage.setItem("authToken", accessToken);
  localStorage.setItem("tokenExpiry", tokenExpiry);
};
 
// Function to check if token is expired
// const isTokenExpired = () => {
//   const expiry = getTokenExpiry();
//   console.log('Expiry',expiry);
//   return expiry && new Date().getTime() > Number(expiry);
// };
 
const formatISTTime = (timestampInMs: number) => {
  return new Date(timestampInMs).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
};
 
const isTokenExpired = () => {
  const expiry = getTokenExpiry();
  console.log("Expiry from storage:", expiry);
 
  if (!expiry) return true; // No expiry stored, assume expired
 
  const expiryTimeMs = Number(expiry) * 1000; // Convert seconds to milliseconds
  const currentTimeMs = new Date().getTime();
 
  console.log(`Current Time (IST): ${formatISTTime(currentTimeMs)}`);
  console.log(`Token Expiry Time (IST): ${formatISTTime(expiryTimeMs)}`);
  console.log("Is token expired?", currentTimeMs > expiryTimeMs);
 
  return currentTimeMs > expiryTimeMs;
};
 
// Function to log out the user
const handleLogout = () => {
  console.warn("Logging out due to authentication failure.");
  localStorage.clear();
  window.location.href = "/login"; // Redirect to login page
};
 
// Function to refresh the token by logging in again
const refreshAccessToken = async () => {
  try {
    const email = getUserEmail();
    const password = getUserPassword();
 
    if (!email || !password) {
      console.error("Missing user credentials. Cannot refresh token.");
      handleLogout();
      return null;
    }
 
    // This should match your login API endpoint structure
    const response = await axios.post("/auth/login", {
      email,
      password,
    });
 
    // Use the same structure as in your Login component
    if (response.data?.login?.accessToken) {
      console.log("Token refreshed successfully.");
      const { accessToken, tokenExpiry } = response.data.login;
      saveAuthData(accessToken, tokenExpiry);
      return accessToken;
    }
 
    return null;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    handleLogout();
    return null;
  }
};
 
// Request Interceptor: Attach token and refresh if expired
apiClient.interceptors.request.use(
  async (config) => {
    let token = getToken();
 
    if (isTokenExpired()) {
      console.warn("Token expired. Attempting to refresh...");
      token = await refreshAccessToken();
 
      if (!token) {
        console.error("Token refresh failed. Logging out...");
        return Promise.reject(new Error("Session expired. Please log in again."));
      }
    }
 
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
 
// Response Interceptor: Handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log('Original Req',originalRequest);
   
 
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn("Unauthorized request detected. Attempting to refresh token...");
      originalRequest._retry = true; // Prevent infinite loop
     
      const newToken = await refreshAccessToken();
 
      if (newToken) {
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return apiClient(originalRequest); // Retry failed request
      } else {
        handleLogout();
      }
    }
 
    return Promise.reject(error);
  }
);
 
export default apiClient;