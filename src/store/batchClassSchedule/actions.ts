import * as types from "./actionTypes";

export const fetchBatchClassScheduleRequest = () => ({
  type: types.FETCH_BATCH_CLASS_SCHEDULE_REQUEST,
});

export const fetchBatchClassScheduleSuccess = (batchModuleSchedules: any) => ({
  type: types.FETCH_BATCH_CLASS_SCHEDULE_SUCCESS,
  payload: batchModuleSchedules,
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
export const fetchBatchClassScheduleByBatchIdRequest = (batchId: string) => {
  console.log("BatchId Dispatched:", batchId);
  return{
    type: types.FETCH_BATCH_CLASS_SCHEDULE_BY_BATCH_ID_REQUEST,
    payload: batchId,
  }
};

export const fetchBatchClassScheduleByBatchIdSuccess = (
  batchId: string,
  batchModuleSchedules: any
) => ({
  type: types.FETCH_BATCH_CLASS_SCHEDULE_BY_BATCH_ID_SUCCESS,
  payload: { batchId, batchModuleSchedules },
});

export const fetchBatchClassScheduleByBatchIdFailure = (error: any) => ({
  type: types.FETCH_BATCH_CLASS_SCHEDULE_BY_BATCH_ID_FAILURE,
  payload: error,
});

// Create
export const createBatchClassScheduleRequest = (
  newBatchModuleSchedule: any
) => ({
  type: types.CREATE_BATCH_CLASS_SCHEDULE_REQUEST,
  payload: newBatchModuleSchedule,
});

export const createBatchClassScheduleSuccess = (batchModuleSchedule: any) => ({
  type: types.CREATE_BATCH_CLASS_SCHEDULE_SUCCESS,
  payload: batchModuleSchedule,
});

export const createBatchClassScheduleFailure = (error: any) => ({
  type: types.CREATE_BATCH_CLASS_SCHEDULE_FAILURE,
  payload: error,
});

// Update
export const updateBatchClassScheduleRequest = (
  id: string,
  updatedBatchModuleSchedule: any
) => ({
  type: types.UPDATE_BATCH_CLASS_SCHEDULE_REQUEST,
  payload: { id, updatedBatchModuleSchedule },
});

export const updateBatchClassScheduleSuccess = (
  updatedBatchModuleSchedule: any
) => ({
  type: types.UPDATE_BATCH_CLASS_SCHEDULE_SUCCESS,
  payload: updatedBatchModuleSchedule,
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
