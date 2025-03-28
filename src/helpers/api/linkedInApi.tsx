import apiClient from "../rootApi/apiClient";

export const createLinkedInJobApi = async (jobData: FormData) => {
  try {
    const response = await apiClient.post("/jobs", jobData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating LinkedIn job", error);
    throw error;
  }
};


//Read all LinkedIn JobRoles
export const fetchLinkedInJobsApi = async () => {
  try {
    const response = await apiClient.get("/jobs-all");
    return response.data;
  } catch (error) {
    console.error("Error fetching LinkedIn jobs", error);
    throw error;
  }
};


export const updateLinkedInJobByCompanyApi = async (company: string, imgFile: File) => {
  try {
    const formData = new FormData();
    formData.append("imgSrc", imgFile);

    const response = await apiClient.put(`/jobs-img/${company}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (error) {
    console.error("Error updating LinkedIn job image", error);
    throw error;
  }
};


export const updateCarrierPathLinkByIdApi = async (id: string, updateData: any) => {
  try {
    const response = await apiClient.put(`/jobs-carrierpath/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Error updating carrierPathLink", error);
    throw error;
  }
};


export const deleteLinkedInJobApi = async (id: string) => {
  try {
    const response = await apiClient.delete(`/jobs/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting LinkedIn job", error);
    throw error;
  }
};
