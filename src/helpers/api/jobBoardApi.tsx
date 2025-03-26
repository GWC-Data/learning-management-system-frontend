// src/api/courseApi.ts
import apiClient from "../rootApi/apiClient";

// Create a new JobBoard
export const createJobBoardApi = async (jobBoardData: any) => {
  try {
    const response = await apiClient.post("/job-board", jobBoardData);
    return response.data;
  } catch (error) {
    console.error("Error creating jobBoard", error);
    throw error;
  }
};

// Read all JobBoards
export const fetchJobBoardsApi = async () => {
  try {
    const response = await apiClient.get("/job-board");
    return response.data.jobBoard || [];
  } catch (error) {
    console.error("Failed to fetch jobBoard", error);
    throw error;
  }
};

// Read a JobBoard by id
export const fetchJobBoardByIdApi = async (jobBoardId: string) => {
  try {
    console.log("fetchJobBoardByIdApi", jobBoardId);
    const response = await apiClient.get(`/job-board/${jobBoardId}`);
    return response || [];
  } catch (error) {
    console.error("Failed to fetch jobBoard by id", error);
    throw error;
  }
};

// Update an existing JobBoard
export const updateJobBoardApi = async (
  jobBoardId: string,
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

// Delete a JobBoard
export const deleteJobBoardApi = async (jobBoardId: string) => {
  try {
    const response = await apiClient.delete(`/job-board/${jobBoardId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete jobBoardData", error);
    throw error;
  }
};
