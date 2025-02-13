// src/store/jobBoard/saga.ts
import { call, put, takeLatest, all } from "redux-saga/effects";
import * as types from "./actionTypes";
import * as actions from "./actions";
import {
  createJobBoardApi,
  fetchJobBoardsApi,
  fetchJobBoardByIdApi,
  updateJobBoardApi,
  deleteJobBoardApi,
} from "../../helpers/api/jobBoardApi";

// GET ALL
export function* fetchJobBoardsSaga(): Generator<any, void, any> {
  try {
    const response: any = yield call(fetchJobBoardsApi);
    console.log(response);
    yield put(actions.fetchJobBoardsSuccess(response));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.fetchJobBoardsFailure(error.message));
    } else {
      yield put(actions.fetchJobBoardsFailure("An unknown error occurred"));
    }
  }
}

// GET BY ID
export function* fetchJobBoardByIdSaga(action: {
  type: string;
  payload: number;
}): Generator<any, void, any> {
  try {
    const response: any = yield call(fetchJobBoardByIdApi, action.payload);
    console.log(response);
    yield put(actions.fetchJobBoardByIdSuccess(response));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.fetchJobBoardByIdFailure(error.message));
    } else {
      yield put(actions.fetchJobBoardByIdFailure("An unknown error occurred"));
    }
  }
}

// POST (ADD)
export function* addJobBoardSaga(action: {
  type: string;
  payload: any;
}): Generator<any, void, any> {
  try {
    const response: any = yield call(createJobBoardApi, action.payload);
    yield put(actions.addJobBoardSuccess(response));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.addJobBoardFailure(error.message));
    } else {
      yield put(actions.addJobBoardFailure("An unknown error occurred"));
    }
  }
}

// PUT (UPDATE)
export function* updateJobBoardSaga(action: {
  type: string;
  payload: any;
}): Generator<any, void, any> {
  try {
    const response: any = yield call(
      updateJobBoardApi,
      action.payload.id,
      action.payload
    );
    yield put(actions.updateJobBoardSuccess(response));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.updateJobBoardFailure(error.message));
    } else {
      yield put(actions.updateJobBoardFailure("An unknown error occurred"));
    }
  }
}

// DELETE
export function* deleteJobBoardSaga(action: {
  type: string;
  payload: number;
}): Generator<any, void, any> {
  try {
    yield call(deleteJobBoardApi, action.payload);
    yield put(actions.deleteJobBoardSuccess(action.payload));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.deleteJobBoardFailure(error.message));
    } else {
      yield put(actions.deleteJobBoardFailure("An unknown error occurred"));
    }
  }
}

export function* jobBoardWatcherSaga(): Generator<any, void, any> {
  yield all([
    takeLatest(types.FETCH_JOBBOARDS_REQUEST, fetchJobBoardsSaga),
    takeLatest(types.FETCH_JOBBOARDBYID_REQUEST, fetchJobBoardByIdSaga),
    takeLatest(types.ADD_JOBBOARD_REQUEST, addJobBoardSaga),
    takeLatest(types.UPDATE_JOBBOARD_REQUEST, updateJobBoardSaga),
    takeLatest(types.DELETE_JOBBOARD_REQUEST, deleteJobBoardSaga),
  ]);
}
