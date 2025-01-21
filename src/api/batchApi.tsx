import apiClient from './apiClient';

// Create a new Batch
export const createBatchApi = async (newBatch: any) => {
  try {
    const response = await apiClient.post('/batch', newBatch);
    return response.data;
  } catch (error) {
    console.error('Error creating batch', error);
    throw error;
  }
};

// Read all Batches
export const fetchBatchApi = async () => {
  try {
    const response = await apiClient.get('/batch');
    console.log("read all batches", response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch Batches', error);
    throw error;
  }
};

export const fetchBatchByIdApi = async (batchId: number) => {
  try {
    const response = await apiClient.get(`/batch/${batchId}`);
    return response.data.batch || [];
  } catch (error) {
    console.error('Failed to fetch batch by id', error);
    throw error;
  }
};

// Update an existing Batch
export const updateBatchApi = async (id: number, updatedBatch: any) => {
  try {
    const response = await apiClient.put(`/batch/${id}`, updatedBatch);
    console.log("update batch", response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating Batch', error);
    throw error;
  }
};

// Delete a course category
export const deleteBatchApi = async (id: number) => {
  try {
    const response = await apiClient.delete(`/batch/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete batch', error);
    throw error;
  }
};
