import apiClient from "../rootApi/apiClient";

// Read a course by id
export const fetchBatchIdByTraineeIdApi = async (traineeId: string) => {
  try {
    console.log("fetchBatchByTraineeIdApi", traineeId);
    const response = await apiClient.get(`/batchTrainee/${traineeId}`);
    console.log("fetchBatchByTraineeIdApi response", response.data.batchIds);
    return response.data.batchIds || [];
  } catch (error) {
    console.error("Failed to fetch batchId by id", error);
    throw error;
  }
};
