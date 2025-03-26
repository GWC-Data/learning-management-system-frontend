// src/api/classForModule.tsx
import apiClient from "../rootApi/apiClient";

// Create a new class for module
export const createClassForModuleApi = async (classData: any) => {
  try {
    const response = await apiClient.post("/class", classData,  {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating class", error);
    throw error;
  }
};

// Read all classes
export const fetchClassForModuleApi = async () => {
  try {
    const response = await apiClient.get("/class");
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch class", error);
    throw error;
  }
};

// Read a class by id
export const fetchClassForModuleByIdApi = async (classId: string) => {
  try {
    console.log("fetchClassForModuleByIdApi", classId);
    const response = await apiClient.get(`/class/${classId}`);
    return response.data.classData || [];
  } catch (error) {
    console.error("Failed to fetch class by id", error);
    throw error;
  }
};

// Read a class by moduleId
export const fetchClassForModuleByModuleIdApi = async (moduleId: string) => {
  try {
    console.log("fetchClassForModuleByModuleIdApi", moduleId);
    const response = await apiClient.get(`/classbyModule/${moduleId}`);
    return response.data.classData || [];
  } catch (error) {
    console.error("Failed to fetch class by moduleId", error);
    throw error;
  }
};

// Update an existing class
export const updateClassForModuleApi = async (
  classId: string,
  classData: any
) => {
  try {
    const response = await apiClient.put(`/class/${classId}`, classData,  {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating class data", error);
    throw error;
  }
};

// Delete a class
export const deleteClassForModuleApi = async (classId: string) => {
  try {
    const response = await apiClient.delete(`/class/${classId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete class", error);
    throw error;
  }
};
