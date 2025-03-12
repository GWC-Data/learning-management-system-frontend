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
export const fetchBatchByIdRequest = (batchData: any) => {
  console.log(batchData); // Log batchData before returning the action
  return {
    type: types.FETCH_BATCHBYID_REQUEST,
    payload: batchData,
  };
};

export const fetchBatchByIdSuccess = (data: any) => ({
  type: types.FETCH_BATCHBYID_SUCCESS,
  payload: data,
});

export const fetchBatchByIdFailure = (error: string) => ({
  type: types.FETCH_BATCHBYID_FAILURE,
  payload: error,
});

//GET: BY BATCHNAME

// Request Action
export const fetchBatchByNameRequest = (batchName: string) => {
  console.log("📡 Dispatching FETCH_BATCH_BY_NAME_REQUEST for:", batchName);
  return {
    type: types.FETCH_BATCH_BY_NAME_REQUEST,
    payload: batchName,
  };
};

// Success Action
export const fetchBatchByNameSuccess = (data: any) => ({
  type: types.FETCH_BATCH_BY_NAME_SUCCESS,
  payload: data,
});

// Failure Action
export const fetchBatchByNameFailure = (error: string) => ({
  type: types.FETCH_BATCH_BY_NAME_FAILURE,
  payload: error,
});



// GET: BY ID MULTIPLE BATCHES

// Action to request multiple batch details
export const fetchBatchesByIdRequest = (batchIds: number[]) => {
  console.log(batchIds);
  return {
    type: types.FETCH_BATCHES_BY_ID_REQUEST,
    payload: batchIds,
  };
};

// Action on successful batch data fetch
export const fetchBatchesByIdSuccess = (batchData: any[]) => ({
  type: types.FETCH_BATCHES_BY_ID_SUCCESS,
  payload: batchData,
});

// Action on failure
export const fetchBatchesByIdFailure = (error: string) => ({
  type: types.FETCH_BATCHES_BY_ID_FAILURE,
  payload: error,
});

//SELECTED COURSE
// Action to store selected batch ID
export const setSelectedBatchId = (batchId: number | null) => ({
  type: types.SET_SELECTED_BATCH_ID,
  payload: batchId,
});

// Action to store batch data
export const setBatchDataById = (batchId: number, batchData: any) => ({
  type: types.SET_BATCH_DATA_BY_ID,
  payload: { batchId, batchData },
});


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
