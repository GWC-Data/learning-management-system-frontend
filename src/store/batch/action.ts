// src/store/Course/actions.ts
import * as types from "./actionTypes";

// GET: Fetch Batches
export const fetchBatchesRequest = () => ({
  type: types.FETCH_BATCHES_REQUEST,
});

export const fetchBatchesSuccess = (data: any[]) => {
  console.log("FETCH_BATCHES_SUCCESS Payload:", data); // Log the payload
  return {
    type: types.FETCH_BATCHES_SUCCESS,
    payload: data,
  };
};

export const fetchBatchesFailure = (error: string) => ({
  type: types.FETCH_BATCHES_FAILURE,
  payload: error,
});

// GET: Fetch Batch By Id
export const fetchBatchByIdRequest = (batchData: any)=>({
    type: types.FETCH_BATCHBYID_REQUEST
})

export const fetchBatchByIdSuccess = (data: any) =>({
    type: types.FETCH_BATCHBYID_SUCCESS,
    payload: data
})

export const fetchBatchByIdFailure = (error: string) =>({
    type: types.FETCH_BATCHBYID_FAILURE,
    payload: error
})

// POST: Add Batch
export const addBatchRequest = (batchData: any) => ({
  type: types.ADD_BATCH_REQUEST,
  payload: batchData,
});

export const addBatchSuccess = (response: any) => ({
  type: types.ADD_BATCH_SUCCESS,
  payload: response,
});

export const addBatchFailure = (error: string) => ({
  type: types.ADD_BATCH_FAILURE,
  payload: error,
});

// PUT: Update Batch
export const updateBatchRequest = (batchData: any) => ({
  type: types.UPDATE_BATCH_REQUEST,
  payload: batchData,
});

export const updateBatchSuccess = (response: any) => ({
  type: types.UPDATE_BATCH_SUCCESS,
  payload: response,
});

export const updateBatchFailure = (error: string) => ({
  type: types.UPDATE_BATCH_FAILURE,
  payload: error,
});

// DELETE: Remove Batch
export const deleteBatchRequest = (batchId: number) => ({
  type: types.DELETE_BATCH_REQUEST,
  payload: batchId,
});

export const deleteBatchSuccess = (response: any) => ({
  type: types.DELETE_BATCH_SUCCESS,
  payload: response,
});

export const deleteBatchFailure = (error: string) => ({
  type: types.DELETE_BATCH_FAILURE,
  payload: error,
});

