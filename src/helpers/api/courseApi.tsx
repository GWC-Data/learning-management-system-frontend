// src/api/courseApi.ts
import apiClient from "../rootApi/apiClient";

// Create a new course
export const createCourseApi = async (courseData: any) => {
  try {
    const response = await apiClient.post("/course", courseData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating course", error);
    throw error;
  }
};

// Read all courses
export const fetchCourseApi = async () => {
  try {
    const response = await apiClient.get("/course");
    return response.data.course || [];
  } catch (error) {
    console.error("Failed to fetch courses", error);
    throw error;
  }
};

// Read a course by id
export const fetchCourseByIdApi = async (courseId: string) => {
  try {
    console.log("fetchCourseByIdApi", courseId);
    const response = await apiClient.get(`/course/${courseId}`);
    return response || [];
  } catch (error) {
    console.error("Failed to fetch course by id", error);
    throw error;
  }
};

// Update an existing course
export const updateCourseApi = async (courseId: string, courseData: any) => {
  try {
    const response = await apiClient.put(`/course/${courseId}`, courseData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating course data", error);
    throw error;
  }
};

// Delete a course
export const deleteCourseApi = async (courseId: string) => {
  try {
    const response = await apiClient.delete(`/course/${courseId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete course", error);
    throw error;
  }
};