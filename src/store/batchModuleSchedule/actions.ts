import * as types from "./actionTypes";

export const fetchBatchModuleScheduleRequest = () => ({
  type: types.FETCH_BATCH_MODULE_SCHEDULE_REQUEST,
});

export const fetchBatchModuleScheduleSuccess = (batchModuleSchedules: any) => ({
  type: types.FETCH_BATCH_MODULE_SCHEDULE_SUCCESS,
  payload: batchModuleSchedules,
});

export const fetchBatchModuleScheduleFailure = (error: any) => ({
  type: types.FETCH_BATCH_MODULE_SCHEDULE_FAILURE,
  payload: error,
});

// ✅ Action to fetch batch module schedule by ID
export const fetchBatchModuleScheduleByIdRequest = (id: number) => ({
  type: types.FETCH_BATCH_MODULE_SCHEDULE_BY_ID_REQUEST,
  payload: id,
});

export const fetchBatchModuleScheduleByIdSuccess = (data: any) => ({
  type: types.FETCH_BATCH_MODULE_SCHEDULE_BY_ID_SUCCESS,
  payload: data,
});

export const fetchBatchModuleScheduleByIdFailure = (error: string) => ({
  type: types.FETCH_BATCH_MODULE_SCHEDULE_BY_ID_FAILURE,
  payload: error,
});

// Fetch by Batch ID
export const fetchBatchModuleScheduleByBatchIdRequest = (batchId: number) => {
  console.log("BatchId Dispatched:", batchId);
  return{
    type: types.FETCH_BATCH_MODULE_SCHEDULE_BY_BATCH_ID_REQUEST,
    payload: batchId,
  }
};

export const fetchBatchModuleScheduleByBatchIdSuccess = (
  batchId: number,
  batchModuleSchedules: any
) => ({
  type: types.FETCH_BATCH_MODULE_SCHEDULE_BY_BATCH_ID_SUCCESS,
  payload: { batchId, batchModuleSchedules },
});

export const fetchBatchModuleScheduleByBatchIdFailure = (error: any) => ({
  type: types.FETCH_BATCH_MODULE_SCHEDULE_BY_BATCH_ID_FAILURE,
  payload: error,
});

// Create
export const createBatchModuleScheduleRequest = (
  newBatchModuleSchedule: any
) => ({
  type: types.CREATE_BATCH_MODULE_SCHEDULE_REQUEST,
  payload: newBatchModuleSchedule,
});

export const createBatchModuleScheduleSuccess = (batchModuleSchedule: any) => ({
  type: types.CREATE_BATCH_MODULE_SCHEDULE_SUCCESS,
  payload: batchModuleSchedule,
});

export const createBatchModuleScheduleFailure = (error: any) => ({
  type: types.CREATE_BATCH_MODULE_SCHEDULE_FAILURE,
  payload: error,
});

// Update
export const updateBatchModuleScheduleRequest = (
  id: number,
  updatedBatchModuleSchedule: any
) => ({
  type: types.UPDATE_BATCH_MODULE_SCHEDULE_REQUEST,
  payload: { id, updatedBatchModuleSchedule },
});

export const updateBatchModuleScheduleSuccess = (
  updatedBatchModuleSchedule: any
) => ({
  type: types.UPDATE_BATCH_MODULE_SCHEDULE_SUCCESS,
  payload: updatedBatchModuleSchedule,
});

export const updateBatchModuleScheduleFailure = (error: any) => ({
  type: types.UPDATE_BATCH_MODULE_SCHEDULE_FAILURE,
  payload: error,
});

// Delete
export const deleteBatchModuleScheduleRequest = (id: number) => ({
  type: types.DELETE_BATCH_MODULE_SCHEDULE_REQUEST,
  payload: id,
});

export const deleteBatchModuleScheduleSuccess = (id: number) => ({
  type: types.DELETE_BATCH_MODULE_SCHEDULE_SUCCESS,
  payload: id,
});

export const deleteBatchModuleScheduleFailure = (error: any) => ({
  type: types.DELETE_BATCH_MODULE_SCHEDULE_FAILURE,
  payload: error,
});
