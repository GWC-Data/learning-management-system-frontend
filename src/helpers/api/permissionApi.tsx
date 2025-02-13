import apiClient from "../rootApi/apiClient";

// Create a new permission
export const createPermissionApi = async (newPermission: any) => {
  try {
    const response = await apiClient.post("/permissions", newPermission);
    return response.data;
  } catch (error) {
    console.error("Failed to add permission", error);
    throw error;
  }
};

// Read all permissions
export const fetchPermissionsApi = async () => {
  try {
    const response = await apiClient.get("/permissions");
    console.log("resp", response.data);
    return response.data.permissions || [];
  } catch (error) {
    console.error("Failed to fetch permissions", error);
    throw error;
  }
};

// Update an existing permission
export const updatePermissionApi = async (
  action: string,
  updatedPermission: any
) => {
  try {
    const response = await apiClient.put(
      `/permissions/${action}`,
      updatedPermission
    );
    return response.data;
  } catch (error) {
    console.error("Failed to update permission", error);
    throw error;
  }
};

// Delete a permission
export const deletePermissionApi = async (action: string) => {
  try {
    const response = await apiClient.delete(`/permissions/${action}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete permission", error);
    throw error;
  }
};
