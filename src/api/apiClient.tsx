import axios from "axios";

// Create an Axios instance
const apiClient = axios.create({
  baseURL: "/", // Base URL is set to '/' because Vite's proxy handles the actual target URLs
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to get token
const getToken = () => localStorage.getItem("authToken");

// Add a request interceptor to automatically add the Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
