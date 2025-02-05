// src/store/Course/saga.ts
import { call, put, takeLatest, all } from "redux-saga/effects";
import * as types from "./actionTypes";
import * as actions from "./action";
import {
  createBatchApi,
  fetchBatchApi,
  updateBatchApi,
  deleteBatchApi,
  fetchBatchByIdApi,
} from "../../api/batchApi";

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
export function* fetchBatchByIdSaga(action: {
  type: string;
  payload: number;
}): Generator<any, void, any> {
  try {
    const response: any = yield call(fetchBatchByIdApi, action.payload);
    console.log(response);
    yield put(actions.fetchBatchByIdSuccess(response));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.fetchBatchByIdFailure(error.message));
    } else {
      yield put(actions.fetchBatchByIdFailure("An unknown error occurred"));
    }
  }
}

// POST
export function* addBatchSaga(action: {
  type: string;
  payload: any;
}): Generator<any, void, any> {
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
export function* updateBatchSaga(action: {
  type: string;
  payload: any;
}): Generator<any, void, any> {
  try {
    const response: any = yield call(
      updateBatchApi,
      action.payload.id,
      action.payload
    );
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
export function* deleteBatchSaga(action: {
  type: string;
  payload: number;
}): Generator<any, void, any> {
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
    takeLatest(types.ADD_BATCH_REQUEST, addBatchSaga),
    takeLatest(types.UPDATE_BATCH_REQUEST, updateBatchSaga),
    takeLatest(types.DELETE_BATCH_REQUEST, deleteBatchSaga),
  ]);
}
