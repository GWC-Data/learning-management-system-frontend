import { call, put, takeLatest, all } from "redux-saga/effects";
import * as types from "./actionTypes";
import * as actions from "./actions";
import {
  createBatchClassScheduleApi,
  fetchBatchClassScheduleApi,
  fetchBatchClassScheduleByBatchIdApi,
  fetchBatchClassScheduleByIdApi,
  updateBatchClassScheduleApi,
  deleteBatchClassScheduleApi,
} from "../../helpers/api/batchClassScheduleApi";

// ✅ GET ALL BATCH MODULE SCHEDULES
export function* fetchBatchModuleSchedulesSaga(): Generator<any, void, any> {
  try {
    const response: any = yield call(fetchBatchClassScheduleApi);
    console.log("Fetched Batch Module Schedules:", response);
    yield put(actions.fetchBatchClassScheduleSuccess(response));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.fetchBatchClassScheduleFailure(error.message));
    } else {
      yield put(actions.fetchBatchClassScheduleFailure("An unknown error occurred"));
    }
  }
}

// ✅ Saga to fetch batch module schedule by ID
export function* fetchBatchClassScheduleByIdSaga(action: {
    type: string;
    payload: number;
  }): Generator<any, void, any> {
    try {
      const response: any = yield call(fetchBatchClassScheduleByIdApi, action.payload);
      console.log("Fetched Batch Module Schedule by ID:", response);
      yield put(actions.fetchBatchClassScheduleByIdSuccess(response));
    } catch (error: unknown) {
      if (error instanceof Error) {
        yield put(actions.fetchBatchClassScheduleByIdFailure(error.message));
      } else {
        yield put(actions.fetchBatchClassScheduleByIdFailure("An unknown error occurred"));
      }
    }
  }

// ✅ GET BATCH MODULE SCHEDULES BY BATCH ID
export function* fetchBatchModuleScheduleByBatchIdSaga(action: {
  type: string;
  payload: string;
}): Generator<any, void, any> {
  try {
    console.log('batchId',action.payload);
    const response: any = yield call(fetchBatchClassScheduleByBatchIdApi, action.payload);
    console.log("Fetched Batch Module Schedule by Batch ID:", response);
    yield put({
      type: types.FETCH_BATCH_CLASS_SCHEDULE_BY_BATCH_ID_SUCCESS,
      payload: {
        batchId: action.payload, // ✅ Send batchId correctly
        batchModuleSchedules: response, // ✅ Send schedules using correct key
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.fetchBatchClassScheduleByBatchIdFailure(error.message));
    } else {
      yield put(actions.fetchBatchClassScheduleByBatchIdFailure("An unknown error occurred"));
    }
  }
}

// ✅ POST (ADD) BATCH MODULE SCHEDULE
export function* addBatchModuleScheduleSaga(action: {
  type: string;
  payload: any;
}): Generator<any, void, any> {
  try {
    const response: any = yield call(createBatchClassScheduleApi, action.payload);
    yield put(actions.createBatchClassScheduleSuccess(response));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.createBatchClassScheduleFailure(error.message));
    } else {
      yield put(actions.createBatchClassScheduleFailure("An unknown error occurred"));
    }
  }
}

// ✅ PUT (UPDATE) BATCH MODULE SCHEDULE
export function* updateBatchModuleScheduleSaga(action: {
  type: string;
  payload: any;
}): Generator<any, void, any> {
  try {
    const response: any = yield call(updateBatchClassScheduleApi, action.payload.id, action.payload);
    yield put(actions.updateBatchClassScheduleSuccess(response));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.updateBatchClassScheduleFailure(error.message));
    } else {
      yield put(actions.updateBatchClassScheduleFailure("An unknown error occurred"));
    }
  }
}

// ✅ DELETE BATCH MODULE SCHEDULE
export function* deleteBatchModuleScheduleSaga(action: {
  type: string;
  payload: string;
}): Generator<any, void, any> {
  try {
    yield call(deleteBatchClassScheduleApi, action.payload);
    yield put(actions.deleteBatchClassScheduleSuccess(action.payload));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.deleteBatchClassScheduleFailure(error.message));
    } else {
      yield put(actions.deleteBatchClassScheduleFailure("An unknown error occurred"));
    }
  }
}

// ✅ WATCHER SAGA
export function* batchModuleScheduleWatcherSaga(): Generator<any, void, any> {
  yield all([
    takeLatest(types.FETCH_BATCH_CLASS_SCHEDULE_REQUEST, fetchBatchModuleSchedulesSaga),
    takeLatest(types.FETCH_BATCH_CLASS_SCHEDULE_BY_ID_REQUEST, fetchBatchClassScheduleByIdSaga),
    takeLatest(types.FETCH_BATCH_CLASS_SCHEDULE_BY_BATCH_ID_REQUEST, fetchBatchModuleScheduleByBatchIdSaga),
    takeLatest(types.CREATE_BATCH_CLASS_SCHEDULE_REQUEST, addBatchModuleScheduleSaga),
    takeLatest(types.UPDATE_BATCH_CLASS_SCHEDULE_REQUEST, updateBatchModuleScheduleSaga),
    takeLatest(types.DELETE_BATCH_CLASS_SCHEDULE_REQUEST, deleteBatchModuleScheduleSaga),
  ]);
}
