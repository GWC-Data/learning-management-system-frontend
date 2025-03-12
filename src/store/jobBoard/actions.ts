// src/store/jobBoard/actions.ts
import * as types from "./actionTypes";

// GET: Fetch JobBoards
export const fetchJobBoardsRequest = () => ({
  type: types.FETCH_JOBBOARDS_REQUEST,
});

export const fetchJobBoardsSuccess = (data: any[]) => {
  console.log("FETCH_JOBBOARDS_SUCCESS Payload:", data); // Log the payload
  return {
    type: types.FETCH_JOBBOARDS_SUCCESS,
    payload: data,
  };
};

export const fetchJobBoardsFailure = (error: string) => ({
  type: types.FETCH_JOBBOARDS_FAILURE,
  payload: error,
});

// GET: Fetch JobBoard By Id
export const fetchJobBoardByIdRequest = (jobBoardId: number) => ({
  type: types.FETCH_JOBBOARDBYID_REQUEST,
  payload: jobBoardId,
});

export const fetchJobBoardByIdSuccess = (data: any) => ({
  type: types.FETCH_JOBBOARDBYID_SUCCESS,
  payload: data,
});

export const fetchJobBoardByIdFailure = (error: string) => ({
  type: types.FETCH_JOBBOARDBYID_FAILURE,
  payload: error,
});

// POST: Add JobBoard
export const addJobBoardRequest = (jobBoardData: any) => ({
  type: types.ADD_JOBBOARD_REQUEST,
  payload: jobBoardData,
});

export const addJobBoardSuccess = (response: any) => ({
  type: types.ADD_JOBBOARD_SUCCESS,
  payload: response,
});

export const addJobBoardFailure = (error: string) => ({
  type: types.ADD_JOBBOARD_FAILURE,
  payload: error,
});

// PUT: Update JobBoard
export const updateJobBoardRequest = (jobBoardData: any) => ({
  type: types.UPDATE_JOBBOARD_REQUEST,
  payload: jobBoardData,
});

export const updateJobBoardSuccess = (response: any) => ({
  type: types.UPDATE_JOBBOARD_SUCCESS,
  payload: response,
});

export const updateJobBoardFailure = (error: string) => ({
  type: types.UPDATE_JOBBOARD_FAILURE,
  payload: error,
});

// DELETE: Remove JobBoard
export const deleteJobBoardRequest = (jobBoardId: number) => ({
  type: types.DELETE_JOBBOARD_REQUEST,
  payload: jobBoardId,
});

export const deleteJobBoardSuccess = (response: any) => ({
  type: types.DELETE_JOBBOARD_SUCCESS,
  payload: response,
});

export const deleteJobBoardFailure = (error: string) => ({
  type: types.DELETE_JOBBOARD_FAILURE,
  payload: error,
});
