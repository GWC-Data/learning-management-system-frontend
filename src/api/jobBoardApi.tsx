// src/api/courseApi.ts
import apiClient from "./apiClient";

// Create a new course
export const createJobBoardApi = async (jobBoardData: any) => {
  try {
    const response = await apiClient.post("/job-board", jobBoardData);
    return response.data;
  } catch (error) {
    console.error("Error creating jobBoard", error);
    throw error;
  }
};

// Read all courses
export const fetchJobBoardApi = async () => {
  try {
    const response = await apiClient.get("/job-board");
    return response.data.jobBoard || [];
  } catch (error) {
    console.error("Failed to fetch jobBoard", error);
    throw error;
  }
};

// Read a course by id
export const fetchJobBoardByIdApi = async (jobBoardId: number) => {
  try {
    console.log("fetchJobBoardByIdApi", jobBoardId);
    const response = await apiClient.get(`/job-board/${jobBoardId}`);
    return response || [];
  } catch (error) {
    console.error("Failed to fetch jobBoard by id", error);
    throw error;
  }
};

// Update an existing course
export const updateJobBoardApi = async (
  jobBoardId: number,
  jobBoardData: any
) => {
  try {
    const response = await apiClient.put(
      `/job-board/${jobBoardId}`,
      jobBoardData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating jobBoardData", error);
    throw error;
  }
};

// Delete a course
export const deleteJobBoardApi = async (jobBoardId: number) => {
  try {
    const response = await apiClient.delete(`/job-board/${jobBoardId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete jobBoardData", error);
    throw error;
  }
};
