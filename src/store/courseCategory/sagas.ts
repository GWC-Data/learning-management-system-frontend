// src/store/Course/saga.ts
import { call, put, takeLatest, all } from "redux-saga/effects";
import * as types from "./actionTypes";
import * as actions from "./actions";
import {
  createCourseCategoryApi,
  fetchCourseCategoryApi,
  updateCourseCategoryApi,
  deleteCourseCategoryApi,
} from "../../helpers/api/courseCategoryApi";

// GET
export function* fetchCourseCategorySaga(): Generator<any, void, any> {
  try {
    const response: any = yield call(fetchCourseCategoryApi);
    console.log(response);
    yield put(actions.fetchCourseCategorySuccess(response));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.fetchCourseCategoryFailure(error.message));
    } else {
      yield put(
        actions.fetchCourseCategoryFailure("An unknown error occurred")
      );
    }
  }
}

// POST
export function* addCourseCategorySaga(action: {
  type: string;
  payload: any;
}): Generator<any, void, any> {
  try {
    const response: any = yield call(createCourseCategoryApi, action.payload);
    yield put(actions.addCourseCategorySuccess(response));
    // 🔄 Trigger refetch after successful update
    yield put(actions.fetchCourseCategoryRequest());
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.addCourseCategoryFailure(error.message));
    } else {
      yield put(actions.addCourseCategoryFailure("An unknown error occurred"));
    }
  }
}

// PUT
export function* updateCourseCategorySaga(action: {
  type: string;
  payload: any;
}): Generator<any, void, any> {
  try {
    const response: any = yield call(
      updateCourseCategoryApi,
      action.payload.id,
      action.payload
    );
    yield put(actions.updateCourseCategorySuccess(response));
    // 🔄 Trigger refetch after successful update
    yield put(actions.fetchCourseCategoryRequest());
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.updateCourseCategoryFailure(error.message));
    } else {
      yield put(
        actions.updateCourseCategoryFailure("An unknown error occurred")
      );
    }
  }
}

// DELETE
export function* deleteCourseCategorySaga(action: {
  type: string;
  payload: any;
}): Generator<any, void, any> {
  try {
    yield call(deleteCourseCategoryApi, action.payload);
    yield put(actions.deleteCourseCategorySuccess(action.payload));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.deleteCourseCategoryFailure(error.message));
    } else {
      yield put(
        actions.deleteCourseCategoryFailure("An unknown error occurred")
      );
    }
  }
}

export function* courseCategoryWatcherSaga(): Generator<any, void, any> {
  yield all([
    takeLatest(types.FETCH_COURSECATEGORY_REQUEST, fetchCourseCategorySaga),
    takeLatest(types.ADD_COURSECATEGORY_REQUEST, addCourseCategorySaga),
    takeLatest(types.UPDATE_COURSECATEGORY_REQUEST, updateCourseCategorySaga),
    takeLatest(types.DELETE_COURSECATEGORY_REQUEST, deleteCourseCategorySaga),
  ]);
}
