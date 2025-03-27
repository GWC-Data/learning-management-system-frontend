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
    yield put(actions.fetchBatchModuleScheduleSuccess(response));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.fetchBatchModuleScheduleFailure(error.message));
    } else {
      yield put(actions.fetchBatchModuleScheduleFailure("An unknown error occurred"));
    }
  }
}

// ✅ Saga to fetch batch module schedule by ID
export function* fetchBatchModuleScheduleByIdSaga(action: {
    type: string;
    payload: string;
  }): Generator<any, void, any> {
    try {
      const response: any = yield call(fetchBatchClassScheduleByIdApi, action.payload);
      console.log("Fetched Batch Module Schedule by ID:", response);
      yield put(actions.fetchBatchModuleScheduleByIdSuccess(response));
    } catch (error: unknown) {
      if (error instanceof Error) {
        yield put(actions.fetchBatchModuleScheduleByIdFailure(error.message));
      } else {
        yield put(actions.fetchBatchModuleScheduleByIdFailure("An unknown error occurred"));
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
      type: types.FETCH_BATCH_MODULE_SCHEDULE_BY_BATCH_ID_SUCCESS,
      payload: {
        batchId: action.payload, // ✅ Send batchId correctly
        batchModuleSchedules: response, // ✅ Send schedules using correct key
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.fetchBatchModuleScheduleByBatchIdFailure(error.message));
    } else {
      yield put(actions.fetchBatchModuleScheduleByBatchIdFailure("An unknown error occurred"));
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
    yield put(actions.createBatchModuleScheduleSuccess(response));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.createBatchModuleScheduleFailure(error.message));
    } else {
      yield put(actions.createBatchModuleScheduleFailure("An unknown error occurred"));
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
    yield put(actions.updateBatchModuleScheduleSuccess(response));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.updateBatchModuleScheduleFailure(error.message));
    } else {
      yield put(actions.updateBatchModuleScheduleFailure("An unknown error occurred"));
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
    yield put(actions.deleteBatchModuleScheduleSuccess(action.payload));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.deleteBatchModuleScheduleFailure(error.message));
    } else {
      yield put(actions.deleteBatchModuleScheduleFailure("An unknown error occurred"));
    }
  }
}

// ✅ WATCHER SAGA
export function* batchModuleScheduleWatcherSaga(): Generator<any, void, any> {
  yield all([
    takeLatest(types.FETCH_BATCH_MODULE_SCHEDULE_REQUEST, fetchBatchModuleSchedulesSaga),
    takeLatest(types.FETCH_BATCH_MODULE_SCHEDULE_BY_ID_REQUEST, fetchBatchModuleScheduleByIdSaga),
    takeLatest(types.FETCH_BATCH_MODULE_SCHEDULE_BY_BATCH_ID_REQUEST, fetchBatchModuleScheduleByBatchIdSaga),
    takeLatest(types.CREATE_BATCH_MODULE_SCHEDULE_REQUEST, addBatchModuleScheduleSaga),
    takeLatest(types.UPDATE_BATCH_MODULE_SCHEDULE_REQUEST, updateBatchModuleScheduleSaga),
    takeLatest(types.DELETE_BATCH_MODULE_SCHEDULE_REQUEST, deleteBatchModuleScheduleSaga),
  ]);
}
