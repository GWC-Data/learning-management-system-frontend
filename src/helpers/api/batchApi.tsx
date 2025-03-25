import apiClient from "../rootApi/apiClient";

// Create a new Batch
export const createBatchApi = async (newBatch: any) => {
  try {
    const response = await apiClient.post("/batch", newBatch);
    console.log("Batch creation response:", response);
    return response.data;
  } catch (error:any) {
    console.error("Error creating batch", error.response?.data || error.message);
    throw error;
  }
};

// Read all Batches
export const fetchBatchApi = async () => {
  try {
    const response = await apiClient.get("/batch");
    console.log("read all batches", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch Batches", error);
    throw error;
  }
};

export const fetchBatchByIdApi = async (batchId: string) => {
  try {
    const response = await apiClient.get(`/batch/${batchId}`);
    console.log(response.data.batch)
    return response.data.batch || [];
  } catch (error) {
    console.error("Failed to fetch batch by id", error);
    throw error;
  }
}; 

export const fetchBatchByBatchNameApi = async (batchName: String) => {
  try {
    const response = await apiClient.get(`/batchbyName/${batchName}`);
    console.log('FetchBatchbyName', response.data.batch)
    return response.data.batch || [];
  } catch (error) {
    console.error("Failed to fetch batch by id", error);
    throw error;
  }
}; 

// Update an existing Batch
export const updateBatchApi = async (id: string, updatedBatch: any) => {
  try {
    const response = await apiClient.put(`/batch/${id}`, updatedBatch);
    console.log("update batch", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating Batch", error);
    throw error;
  }
};

// Delete a course category
export const deleteBatchApi = async (id: string) => {
  try {
    const response = await apiClient.delete(`/batch/${id}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete batch", error);
    throw error;
  }
};