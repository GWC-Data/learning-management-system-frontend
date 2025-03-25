import { call, put, takeLatest } from "redux-saga/effects";
import { fetchBatchIdByTraineeIdApi } from "@/helpers/api/batchTrainee"; // Replace with your actual API function
import {
  fetchBatchIdByTraineeIdRequest,
  fetchBatchIdByTraineeIdSuccess,
  fetchBatchIdByTraineeIdFailure,
} from "./actions"; // Replace with your actual action creators
import * as types from "./actionTypes";

// Saga to fetch Batch IDs by Trainee ID
// Saga to fetch Batch IDs by Trainee ID
function* fetchBatchIdByTraineeIdSaga(
  action: ReturnType<typeof fetchBatchIdByTraineeIdRequest>
): Generator<any, void, any> {
  try {
    // Correct usage of call with API function and payload
    const batchIds = yield call(fetchBatchIdByTraineeIdApi, action.payload);

    // Dispatch success action with the fetched data
    yield put(fetchBatchIdByTraineeIdSuccess(batchIds));
  } catch (error: any) {
    // Dispatch failure action in case of an error
    yield put(fetchBatchIdByTraineeIdFailure(error.message));
  }
}

// Watcher saga: watches for FETCH_BATCHIDBYTRAINEEID_REQUEST action
export function* batchTraineeWatcherSaga() {
  yield takeLatest(
    types.FETCH_BATCHIDBYTRAINEEID_REQUEST,
    fetchBatchIdByTraineeIdSaga
  );
}
