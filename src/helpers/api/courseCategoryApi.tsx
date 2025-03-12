import apiClient from "../rootApi/apiClient";

// Create a new course category
export const createCourseCategoryApi = async (newCategory: any) => {
  try {
    const response = await apiClient.post("/coursecategory", newCategory, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating course category", error);
    throw error;
  }
};

// Read all course categories
export const fetchCourseCategoryApi = async () => {
  try {
    const response = await apiClient.get("/coursecategory");
    console.log("courseCategory", response.data);
    return response.data.coursecategory || [];
  } catch (error) {
    console.error("Failed to fetch course categories", error);
    throw error;
  }
};

// Read a course category by id
export const fetchCourseCategoryByIdApi = async (
  id: string
) => {
  try {
    const response = await apiClient.get(`/coursecategory/${id}`);
    return response.data.category || [];
  } catch (error) {
    console.error("Failed to fetch course categories", error);
    throw error;
  }
};

// Update an existing course category
export const updateCourseCategoryApi = async (
  id: string,
  updatedCategory: any
) => {
  try {
    const response = await apiClient.put(
      `/coursecategory/${id}`,
      updatedCategory, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating course category", error);
    throw error;
  }
};

// Delete a course category
export const deleteCourseCategoryApi = async (id: string) => {
  try {
    const response = await apiClient.delete(`/coursecategory/${id}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete course category", error);
    throw error;
  }
};
