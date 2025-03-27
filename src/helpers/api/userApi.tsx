import apiClient from "../rootApi/apiClient";

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
    console.log("resp", response.data);
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch users", error);
    throw error;
  }
};

// Read user by id
export const fetchUsersbyIdApi = async (userId: string) => {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    console.log("API Response Data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user by ID", error);
    return null;
  }
};

// Update an existing user
export const updateUserAdminApi = async (userId: string, userData: any) => {
  try {
    console.log("userrDataaa", userData);
    const response = await apiClient.put(`/userForAdmin/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user data", error);
    throw error;
  }
};

export const updateUserApi = async (userId: string, userData: any) => {
  try {
    console.log("userrDataaa", userData);
    const response = await apiClient.put(`/userForTrainee/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user data", error);
    throw error;
  }
};

// Delete a course
export const deleteUserApi = async (userId: string) => {
  try {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete user", error);
    throw error;
  }
};


//Update TraineeUser Api
export const updateTraineeUserApi = async (userId: string, formData: FormData) => {
  try {
    // Use FormData directly without manual file processing
    const response = await apiClient.put(`/userForTrainee/${userId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Axios will handle this correctly
      },
    });

    return response;
  } catch (error) {
    console.error("API Error in updateTraineeUserApi:", error);
    throw error;
  }
};