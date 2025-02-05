import apiClient from "./apiClient";

// Create a new role
export const createRoleApi = async (roleData: any) => {
  try {
    const response = await apiClient.post("/roles", roleData);
    return response.data;
  } catch (error) {
    console.error("Error creating role", error);
    throw error;
  }
};

//Read all roles
export const fetchRolesApi = async () => {
  try {
    const response = await apiClient.get("/roles");
    console.log("Response", response.data);
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch roles", error);
    throw error;
  }
};

// Update an existing role
export const updateRoleApi = async (roleId: number, roleData: any) => {
  try {
    const response = await apiClient.put(`/roles/${roleId}`, roleData);
    return response.data;
  } catch (error) {
    console.error("Error updating role data", error);
    throw error;
  }
};

// Delete a role
export const deleteRoleApi = async (roleId: number) => {
  try {
    const response = await apiClient.delete(`/roles/${roleId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete role", error);
    throw error;
  }
};
