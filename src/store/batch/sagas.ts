import { call, put, takeLatest, all } from "redux-saga/effects";
import * as actions from "./actions";
import {
  createBatchApi,
  fetchBatchApi,
  updateBatchApi,
  deleteBatchApi,
  fetchBatchByIdApi,
  fetchBatchByBatchNameApi,
} from "../../helpers/api/batchApi";
import * as types from "./actionTypes";

// GET
export function* fetchBatchesSaga(): Generator<any, void, any> {
  try {
    const response: any = yield call(fetchBatchApi);
    console.log(response);
    yield put(actions.fetchBatchesSuccess(response));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.fetchBatchesFailure(error.message));
    } else {
      yield put(actions.fetchBatchesFailure("An unknown error occurred"));
    }
  }
}

// GET BY ID
export function* fetchBatchByIdSaga(action: { type: string; payload: string }): Generator<any, void, any> {
  try {
    console.log("Fetching batch for batchId:", action.payload);
    const response: any = yield call(fetchBatchByIdApi, action.payload);
    console.log("fetchBatchByIdApi Response:", response);

    yield put(actions.fetchBatchByIdSuccess({ id: action.payload, ...response }));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.fetchBatchByIdFailure(error.message));
    } else {
      yield put(actions.fetchBatchByIdFailure("An unknown error occurred"));
    }
  }
}

// Fetch multiple batches by ID
export function* fetchBatchesByIdSaga(action: { type: string; payload: string[] }): Generator<any, void, any> {
  try {
    console.log("Saga Triggered - Batch IDs:", action.payload);
    const responses: any[] = yield all(action.payload.map((batchId) => call(fetchBatchByIdApi, batchId)));
    console.log("Fetched Batch Data:", responses);
    yield put(actions.fetchBatchesByIdSuccess(responses));
  } catch (error: unknown) {
    console.error("Saga Error:", error);
    yield put(actions.fetchBatchesByIdFailure("Failed to fetch batch data"));
  }
}

// Worker Saga: Fetch batch by batchName
function* fetchBatchByNameSaga(action: { type: string; payload: string }): Generator<any, void, any> {
  try {
    console.log("📡 Fetching batch for batchName:", action.payload);
    const response: any = yield call(fetchBatchByBatchNameApi, action.payload);
    console.log("✅ fetchBatchByBatchNameApi Response:", response);
    yield put(actions.fetchBatchByNameSuccess(response));
  } catch (error: unknown) {
    console.error("❌ Saga Error fetching batch by name:", error);
    yield put(actions.fetchBatchByNameFailure("Failed to fetch batch by name"));
  }
}

// POST
export function* addBatchSaga(action: { type: string; payload: any }): Generator<any, void, any> {
  try {
    const response: any = yield call(createBatchApi, action.payload);
    yield put(actions.addBatchSuccess(response));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.addBatchFailure(error.message));
    } else {
      yield put(actions.addBatchFailure("An unknown error occurred"));
    }
  }
}

// PUT
export function* updateBatchSaga(action: { type: string; payload: any }): Generator<any, void, any> {
  try {
    const response: any = yield call(updateBatchApi, action.payload.id, action.payload);
    yield put(actions.updateBatchSuccess(response));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.updateBatchFailure(error.message));
    } else {
      yield put(actions.updateBatchFailure("An unknown error occurred"));
    }
  }
}

// DELETE
export function* deleteBatchSaga(action: { type: string; payload: number }): Generator<any, void, any> {
  try {
    yield call(deleteBatchApi, action.payload);
    yield put(actions.deleteBatchSuccess(action.payload));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.deleteBatchFailure(error.message));
    } else {
      yield put(actions.deleteBatchFailure("An unknown error occurred"));
    }
  }
}

export function* batchWatcherSaga(): Generator<any, void, any> {
  yield all([
    takeLatest(types.FETCH_BATCHES_REQUEST, fetchBatchesSaga),
    takeLatest(types.FETCH_BATCHBYID_REQUEST, fetchBatchByIdSaga),
    takeLatest(types.FETCH_BATCH_BY_NAME_REQUEST, fetchBatchByNameSaga),
    takeLatest(types.FETCH_BATCHES_BY_ID_REQUEST, fetchBatchesByIdSaga),
    takeLatest(types.ADD_BATCH_REQUEST, addBatchSaga),
    takeLatest(types.UPDATE_BATCH_REQUEST, updateBatchSaga),
    takeLatest(types.DELETE_BATCH_REQUEST, deleteBatchSaga),
  ]);
}