import * as types from "./actionTypes";

export const fetchBatchClassScheduleRequest = () => ({
  type: types.FETCH_BATCH_CLASS_SCHEDULE_REQUEST,
});

export const fetchBatchClassScheduleSuccess = (batchClassSchedules: any) => ({
  type: types.FETCH_BATCH_CLASS_SCHEDULE_SUCCESS,
  payload: batchClassSchedules,
});

export const fetchBatchClassScheduleFailure = (error: any) => ({
  type: types.FETCH_BATCH_CLASS_SCHEDULE_FAILURE,
  payload: error,
});

// ✅ Action to fetch batch module schedule by ID
export const fetchBatchClassScheduleByIdRequest = (id: string) => ({
  type: types.FETCH_BATCH_CLASS_SCHEDULE_BY_ID_REQUEST,
  payload: id,
});

export const fetchBatchClassScheduleByIdSuccess = (data: any) => ({
  type: types.FETCH_BATCH_CLASS_SCHEDULE_BY_ID_SUCCESS,
  payload: data,
});

export const fetchBatchClassScheduleByIdFailure = (error: string) => ({
  type: types.FETCH_BATCH_CLASS_SCHEDULE_BY_ID_FAILURE,
  payload: error,
});

// Fetch by Batch ID
export const fetchBatchClassScheduleByBatchIdRequest = (batchId: number) => {
  console.log("BatchId Dispatched:", batchId);
  return{
    type: types.FETCH_BATCH_CLASS_SCHEDULE_BY_BATCH_ID_REQUEST,
    payload: batchId,
  }
};

export const fetchBatchClassScheduleByBatchIdSuccess = (
  batchId: number,
  batchClassSchedules: any
) => ({
  type: types.FETCH_BATCH_CLASS_SCHEDULE_BY_BATCH_ID_SUCCESS,
  payload: { batchId, batchClassSchedules },
});

export const fetchBatchClassScheduleByBatchIdFailure = (error: any) => ({
  type: types.FETCH_BATCH_CLASS_SCHEDULE_BY_BATCH_ID_FAILURE,
  payload: error,
});

// Create
export const createBatchClassScheduleRequest = (
  newBatchClassSchedule: any
) => ({
  type: types.CREATE_BATCH_CLASS_SCHEDULE_REQUEST,
  payload: newBatchClassSchedule,
});

export const createBatchClassScheduleSuccess = (batchClassSchedule: any) => ({
  type: types.CREATE_BATCH_CLASS_SCHEDULE_SUCCESS,
  payload: batchClassSchedule,
});

export const createBatchClassScheduleFailure = (error: any) => ({
  type: types.CREATE_BATCH_CLASS_SCHEDULE_FAILURE,
  payload: error,
});

// Update
export const updateBatchClassScheduleRequest = (
  id: number,
  updatedBatchClassSchedule: any
) => ({
  type: types.UPDATE_BATCH_CLASS_SCHEDULE_REQUEST,
  payload: { id, updatedBatchClassSchedule },
});

export const updateBatchClassScheduleSuccess = (
  updatedBatchClassSchedule: any
) => ({
  type: types.UPDATE_BATCH_CLASS_SCHEDULE_SUCCESS,
  payload: updatedBatchClassSchedule,
});

export const updateBatchClassScheduleFailure = (error: any) => ({
  type: types.UPDATE_BATCH_CLASS_SCHEDULE_FAILURE,
  payload: error,
});

// Delete
export const deleteBatchClassScheduleRequest = (id: string) => ({
  type: types.DELETE_BATCH_CLASS_SCHEDULE_REQUEST,
  payload: id,
});

export const deleteBatchClassScheduleSuccess = (id: string) => ({
  type: types.DELETE_BATCH_CLASS_SCHEDULE_SUCCESS,
  payload: id,
});

export const deleteBatchClassScheduleFailure = (error: any) => ({
  type: types.DELETE_BATCH_CLASS_SCHEDULE_FAILURE,
  payload: error,
});
