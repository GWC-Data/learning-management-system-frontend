import apiClient from "./apiClient";

// const userId = localStorage.getItem('userId');

// Create a new course
export const createUserApi = async (userData: any) => {
  try {
    const response = await apiClient.post("/users", userData);
    return response.data;
  } catch (error) {
    console.error("Error creating user", error);
    throw error;
  }
};

//Read all users
export const fetchUsersApi = async () => {
  try {
    const response = await apiClient.get("/users");
    console.log("resp", response.data.Users);
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch users", error);
    throw error;
  }
};

// Read user by id
export const fetchUsersbyIdApi = async (userId: number) => {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    console.log("resp", response.data.user);
    return response.data.user || [];
  } catch (error) {
    console.error("Failed to fetch user by ID", error);
    throw error;
  }
};

// Update an existing user
export const updateUserApi = async (userId: number, userData: any) => {
  try {
    console.log("userrDataaa", userData);
    const response = await apiClient.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user data", error);
    throw error;
  }
};

// Delete a course
export const deleteUserApi = async (userId: number) => {
  try {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete user", error);
    throw error;
  }
};
