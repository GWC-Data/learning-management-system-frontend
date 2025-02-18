import apiClient from "../rootApi/apiClient";

// Create a new batch module schedule
export const createBatchModuleScheduleApi = async (
  newBatchModuleSchedule: any
) => {
  try {
    const response = await apiClient.post(
      "/batchModuleSchedule",
      newBatchModuleSchedule
    );
    return response.data;
  } catch (error) {
    console.error("Error creating course module", error);
    throw error;
  }
};

// Read all batch module schedules
export const fetchBatchModuleScheduleApi = async () => {
  try {
    const response = await apiClient.get("/batchModuleSchedule");
    console.log("response", response.data.data);
    return response.data.data || [];
  } catch (error) {
    console.error("Failed to fetch course module", error);
    throw error;
  }
};

//Read all batch module schedules by batch id
export const fetchBatchModuleScheduleByBatchIdApi = async (id: number) => {
  try {
    console.log("Fetching schedule for batch ID:", id);
    const response = await apiClient.get(`/batchModuleSchedulebybatch/${id}`);
    console.log("response", response.data.batchModuleSchedule);
    return response.data.batchModuleSchedule || [];
  } catch (error) {
    console.error("Failed to fetch batch module schedule by batch id", error);
    throw error;
  }
};

// Read a batch module schedule by id
export const fetchBatchModuleScheduleByIdApi = async (id: number) => {
  try {
    const userId = parseInt(id.toString(), 10); // Convert id to integer
    console.log("Fetching schedule for user ID:", userId);
    const response = await apiClient.get(`/batchModuleSchedule/${userId}`);
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch batch module schedule by id", error);
    throw error;
  }
};

// Update an batch module schedule
export const updateBatchModuleScheduleApi = async (
  id: number,
  newBatchModuleSchedule: any
) => {
  try {
    console.log("updatedCourseModule", newBatchModuleSchedule);
    const response = await apiClient.put(
      `/batchModuleSchedule/${id}`,
      newBatchModuleSchedule
    );
    console.log("response batch module", response.data.data);
    return response.data;
  } catch (error) {
    console.error("Error updating course module", error);
    throw error;
  }
};

// Delete a batch module schedule
export const deleteBatchModuleScheduleApi = async (id: number) => {
  try {
    const response = await apiClient.delete(`/batchModuleSchedule/${id}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete course module", error);
    throw error;
  }
};
