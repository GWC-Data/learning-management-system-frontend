import * as types from "./actionTypes";

// GET: Fetch BatchId By TraineeId
export const fetchBatchIdByTraineeIdRequest = (traineeId: number) => ({
  type: types.FETCH_BATCHIDBYTRAINEEID_REQUEST,
  payload: traineeId,
});

export const fetchBatchIdByTraineeIdSuccess = (data: any) => ({
  type: types.FETCH_BATCHIDBYTRAINEEID_SUCCESS,
  payload: data,
});

export const fetchBatchIdByTraineeIdFailure = (error: string) => ({
  type: types.FETCH_BATCHIDBYTRAINEEID_FAILURE,
  payload: error,
});
