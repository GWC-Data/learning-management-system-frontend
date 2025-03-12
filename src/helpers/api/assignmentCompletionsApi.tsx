import apiClient from "../rootApi/apiClient";

// Create a new assignment completion
export const createAssignmentCompletionsApi = async (formData: FormData) => {
  try {
    const response = await apiClient.post("/assignment-completion", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Axios will handle this correctly
      },
    });

    console.log("createAssignmentCompletionsApi", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating assignment completion", error);
    throw error;
  }
};


// Read all assignment completions
export const fetchAssignmentCompletionsApi = async () => {
  try {
    const response = await apiClient.get("/assignment-completion");
    console.log("fetchAssignmentCompletionsApi", response.data);
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch assignment completions", error);
    throw error;
  }
};

// Read assignment completion by ID
export const fetchAssignmentCompletionsByIdApi = async (id: number) => {
  try {
    console.log("AssignmentCompletionId", id);
    const response = await apiClient.get(`/assignment-completion/${id}`);
    console.log("fetchAssignmentCompletionsByIdApi", response.data);
    return response.data || {};
  } catch (error) {
    console.error("Failed to fetch assignment completion by ID", error);
    throw error;
  }
};

// Update an existing assignment completion
export const updateAssignmentCompletionsApi = async (
  id: number,
  updatedAssignmentCompletion: any
) => {
  try {
    const response = await apiClient.put(
      `/assignment-completion/${id}`,
      updatedAssignmentCompletion
    );
    console.log("updateAssignmentCompletionsApi", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating assignment completion", error);
    throw error;
  }
};

// Delete an assignment completion
export const deleteAssignmentCompletionsApi = async (id: number) => {
  try {
    const response = await apiClient.delete(`/assignment-completion/${id}`);
    console.log("deleteAssignmentCompletionApi", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to delete assignment completion", error);
    throw error;
  }
};
