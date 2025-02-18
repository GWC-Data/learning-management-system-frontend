// src/store/Course/actions.ts
import * as types from "./actionTypes";

// GET: Fetch CompanyInfos
export const fetchCompanyInfosRequest = () => ({
  type: types.FETCH_COMPANYINFOS_REQUEST,
});

export const fetchCompanyInfosSuccess = (data: any[]) => {
  console.log("FETCH_COMPANYINFOS_SUCCESS Payload:", data); // Log the payload
  return {
    type: types.FETCH_COMPANYINFOS_SUCCESS,
    payload: data,
  };
};

export const fetchCompanyInfosFailure = (error: string) => ({
  type: types.FETCH_COMPANYINFOS_FAILURE,
  payload: error,
});

// GET: Fetch CompanyInfo By Id
export const fetchCompanyInfoByIdRequest = (cmpyInfoData: any)=>({
    type: types.FETCH_COMPANYINFOBYID_REQUEST
})

export const fetchCompanyInfoByIdSuccess = (data: any) =>({
    type: types.FETCH_COMPANYINFOBYID_SUCCESS,
    payload: data
})

export const fetchCompanyInfoByIdFailure = (error: string) =>({
    type: types.FETCH_COMPANYINFOBYID_FAILURE,
    payload: error
})

// POST: Add CompanyInfo
export const addCompanyInfoRequest = (cmpyInfoData: any) => ({
  type: types.ADD_COMPANYINFO_REQUEST,
  payload: cmpyInfoData,
});

export const addCompanyInfoSuccess = (response: any) => ({
  type: types.ADD_COMPANYINFO_SUCCESS,
  payload: response,
});

export const addCompanyInfoFailure = (error: string) => ({
  type: types.ADD_COMPANYINFO_FAILURE,
  payload: error,
});

// PUT: Update CompanyInfo
export const updateCompanyInfoRequest = (cmpyInfoData: any) => ({
  type: types.UPDATE_COMPANYINFO_REQUEST,
  payload: cmpyInfoData,
});

export const updateCompanyInfoSuccess = (response: any) => ({
  type: types.UPDATE_COMPANYINFO_SUCCESS,
  payload: response,
});

export const updateCompanyInfoFailure = (error: string) => ({
  type: types.UPDATE_COMPANYINFO_FAILURE,
  payload: error,
});

// DELETE: Remove CompanyInfo
export const deleteCompanyInfoRequest = (cmpyInfoId: number) => ({
  type: types.DELETE_COMPANYINFO_REQUEST,
  payload: cmpyInfoId,
});

export const deleteCompanyInfoSuccess = (response: any) => ({
  type: types.DELETE_COMPANYINFO_SUCCESS,
  payload: response,
});

export const deleteCompanyInfoFailure = (error: string) => ({
  type: types.DELETE_COMPANYINFO_FAILURE,
  payload: error,
});

