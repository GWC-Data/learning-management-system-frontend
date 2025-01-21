
import apiClient from './apiClient';

// Read a course by id
export const fetchBatchByTraineeIdApi = async (traineeId: number) => {
    try {
      console.log("fetchBatchByTraineeIdApi", traineeId);
      const response = await apiClient.get(`/batchTrainee/${traineeId}`);
      return response.data.batchIds || [];
    } catch (error) {
      console.error('Failed to fetch batchId by id', error);
      throw error;
    }
  };