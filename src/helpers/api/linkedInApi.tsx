import apiClient from "../rootApi/apiClient";

//Read all LinkedIn JobRoles
export const fetchLinkedInJobsApi = async () => {
  try {
    const response = await apiClient.get("/jobs-all");
    console.log("Response", response.data);
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch LinkedIn Jobs", error);
    throw error;
  }
};
