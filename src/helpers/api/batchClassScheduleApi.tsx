import apiClient from "../rootApi/apiClient";

// Create a new batch module schedule
export const createBatchClassScheduleApi = async (
  newBatchClassSchedule: any
) => {
  try {
    const response = await apiClient.post(
      "/batchClassSchedule",
      newBatchClassSchedule
    );
    return response.data;
  } catch (error) {
    console.error("Error creating course module", error);
    throw error;
  }
};

// Read all batch module schedules
export const fetchBatchClassScheduleApi = async () => {
  try {
    const response = await apiClient.get("/batchClassSchedule");
    console.log("response", response.data);
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch course module", error);
    throw error;
  }
};

//Read all batch module schedules by batch id
export const fetchBatchClassScheduleByBatchIdApi = async (id: string) => {
  try {
    console.log("Fetching schedule for batch ID:", id);
    const response = await apiClient.get(`/batchClassSchedulebybatch/${id}`);
    console.log("response", response.data.batchClassSchedule);
    return response.data.batchClassSchedule || [];
  } catch (error) {
    console.error("Failed to fetch batch module schedule by batch id", error);
    throw error;
  }
};

// Read a batch module schedule by id
export const fetchBatchClassScheduleByIdApi = async (id: string) => {
  try {
    const userId = parseInt(id.toString(), 10); // Convert id to integer
    console.log("Fetching schedule for user ID:", userId);
    const response = await apiClient.get(`/batchClassSchedule/${userId}`);
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch batch module schedule by id", error);
    throw error;
  }
};

// Update an batch module schedule
export const updateBatchClassScheduleApi = async (
  id: string,
  newBatchClassSchedule: any
) => {
  try {
    console.log("updatedCourseModule", newBatchClassSchedule);
    const response = await apiClient.put(
      `/batchClassSchedule/${id}`,
      newBatchClassSchedule
    );
    console.log("response batch module", response.data.data);
    return response.data;
  } catch (error) {
    console.error("Error updating course module", error);
    throw error;
  }
};

// Delete a batch module schedule
export const deleteBatchClassScheduleApi = async (id: string) => {
  try {
    const response = await apiClient.delete(`/batchClassSchedule/${id}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete course module", error);
    throw error;
  }
};
