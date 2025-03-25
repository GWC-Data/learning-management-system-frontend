// src/api/courseApi.ts
import apiClient from "../rootApi/apiClient";

// Create a new companyInfo
export const createCompanyInfoApi = async (cmpyInfoData: any) => {
  try {
    const response = await apiClient.post("/companyinfo", cmpyInfoData);
    return response.data;
  } catch (error) {
    console.error("Error creating companyInfo", error);
    throw error;
  }
};

// Read all companyInfos
export const fetchCompanyInfosApi = async () => {
  try {
    const response = await apiClient.get("/companyinfo");
    console.log('Resp', response.data)
    return response.data;
  } catch (error) {
    console.error("Failed to fetch companyInfo", error);
    throw error;
  }
};

// Read a companyInfo by id
export const fetchCompanyInfoByIdApi = async (cmpyInfoId: string) => {
  try {
    console.log("fetchCompanyInfoByIdApi", cmpyInfoId);
    const response = await apiClient.get(`/companyinfo/${cmpyInfoId}`);
    return response || [];
  } catch (error) {
    console.error("Failed to fetch companyInfo by id", error);
    throw error;
  }
};

// Update an existing companyInfo
export const updateCompanyInfoApi = async (
  cmpyInfoId: number,
  cmpyInfoData: any
) => {
  try {
    const response = await apiClient.put(
      `/companyinfo/${cmpyInfoId}`,
      cmpyInfoData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating companyInfoData", error);
    throw error;
  }
};

// Delete a companyInfo
export const deleteCompanyInfoApi = async (cmpyInfoId: string) => {
  try {
    const response = await apiClient.delete(`/companyinfo/${cmpyInfoId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete companyInfoData", error);
    throw error;
  }
};
