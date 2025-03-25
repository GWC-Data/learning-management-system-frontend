// src/store/Course/actions.ts
import * as types from "./actionTypes";

// GET: Fetch Course Categories
export const fetchCourseCategoryRequest = () => ({
  type: types.FETCH_COURSECATEGORY_REQUEST,
});


export const fetchCourseCategorySuccess = (data: any[]) => {
  console.log("FETCH_COURSECATEGORY_SUCCESS Payload:", data);
  return {
    type: types.FETCH_COURSECATEGORY_SUCCESS,
    payload: data,
  };
};

export const fetchCourseCategoryFailure = (error: string) => ({
  type: types.FETCH_COURSECATEGORY_FAILURE,
  payload: error,
});

// POST: Add Course Category
export const addCourseCategoryRequest = (courseCategoryData: any) => ({
  type: types.ADD_COURSECATEGORY_REQUEST,
  payload: courseCategoryData,
});

export const addCourseCategorySuccess = (response: any) => ({
  type: types.ADD_COURSECATEGORY_SUCCESS,
  payload: response,
});

export const addCourseCategoryFailure = (error: string) => ({
  type: types.ADD_COURSECATEGORY_FAILURE,
  payload: error,
});

// PUT: Update Course Category
export const updateCourseCategoryRequest = (courseCategoryData: any) => ({
  type: types.UPDATE_COURSECATEGORY_REQUEST,
  payload: courseCategoryData,
});

export const updateCourseCategorySuccess = (response: any) => ({
  type: types.UPDATE_COURSECATEGORY_SUCCESS,
  payload: response,
});

export const updateCourseCategoryFailure = (error: string) => ({
  type: types.UPDATE_COURSECATEGORY_FAILURE,
  payload: error,
});

// DELETE: Remove Course Category
export const deleteCourseCategoryRequest = (courseCategoryId: string) => ({
  type: types.DELETE_COURSECATEGORY_REQUEST,
  payload: courseCategoryId,
});

export const deleteCourseCategorySuccess = (response: any) => ({
  type: types.DELETE_COURSECATEGORY_SUCCESS,
  payload: response,
});

export const deleteCourseCategoryFailure = (error: string) => ({
  type: types.DELETE_COURSECATEGORY_FAILURE,
  payload: error,
});