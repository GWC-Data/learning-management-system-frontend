// src/redux/actions.ts

import * as actionTypes from "./actionTypes";

// Fetch all classes
export const fetchClassRequest = () => ({
  type: actionTypes.FETCH_CLASS_REQUEST,
});

export const fetchClassSuccess = (data: any) => ({
  type: actionTypes.FETCH_CLASS_SUCCESS,
  payload: data,
});

export const fetchClassFailure = (error: any) => ({
  type: actionTypes.FETCH_CLASS_FAILURE,
  payload: error,
});

// Fetch class by ID
export const fetchClassByIdRequest = (classId: number) => ({
  type: actionTypes.FETCH_CLASS_BY_ID_REQUEST,
  payload: classId,
});

export const fetchClassByIdSuccess = (data: any) => ({
  type: actionTypes.FETCH_CLASS_BY_ID_SUCCESS,
  payload: data,
});

export const fetchClassByIdFailure = (error: any) => ({
  type: actionTypes.FETCH_CLASS_BY_ID_FAILURE,
  payload: error,
});

// Fetch class by module ID
export const fetchClassByModuleRequest = (moduleIds: number[]) => ({
  type: actionTypes.FETCH_CLASS_BY_MODULE_REQUEST,
  payload: moduleIds,
});


export const fetchClassByModuleSuccess = (moduleIds: number[]) => ({
  type: actionTypes.FETCH_CLASS_BY_MODULE_SUCCESS,
  payload: moduleIds,
});

export const fetchClassByModuleFailure = (error: any) => ({
  type: actionTypes.FETCH_CLASS_BY_MODULE_FAILURE,
  payload: error,
});

// Create class
export const createClassRequest = (classData: any) => ({
  type: actionTypes.CREATE_CLASS_REQUEST,
  payload: classData,
});

export const createClassSuccess = (data: any) => ({
  type: actionTypes.CREATE_CLASS_SUCCESS,
  payload: data,
});

export const createClassFailure = (error: any) => ({
  type: actionTypes.CREATE_CLASS_FAILURE,
  payload: error,
});

// Update class
export const updateClassRequest = (classId: number, classData: any) => ({
  type: actionTypes.UPDATE_CLASS_REQUEST,
  payload: { classId, classData },
});

export const updateClassSuccess = (data: any) => ({
  type: actionTypes.UPDATE_CLASS_SUCCESS,
  payload: data,
});

export const updateClassFailure = (error: any) => ({
  type: actionTypes.UPDATE_CLASS_FAILURE,
  payload: error,
});

// Delete class
export const deleteClassRequest = (classId: number) => ({
  type: actionTypes.DELETE_CLASS_REQUEST,
  payload: classId,
});

export const deleteClassSuccess = (data: any) => ({
  type: actionTypes.DELETE_CLASS_SUCCESS,
  payload: data,
});

export const deleteClassFailure = (error: any) => ({
  type: actionTypes.DELETE_CLASS_FAILURE,
  payload: error,
});
