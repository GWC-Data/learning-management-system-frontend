import apiClient from "../rootApi/apiClient";

// Read all courses
export const fetchLinkedInJObsApi = async () => {
    try {
      const response = await apiClient.get("/jobs");
      console.log("fetchJobs", response.data);
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch Jobs", error);
      throw error;
    }
  };