// src/store/Course/saga.ts
import { call, put, takeLatest, all } from 'redux-saga/effects';
import * as types from './actionTypes';
import * as actions from './action';
import {
  createCourseApi,
  fetchCourseApi,
  updateCourseApi,
  deleteCourseApi,
} from '../../api/courseApi';


// GET
export function* fetchCoursesSaga(): Generator<any, void, any> {
  try {
    const response: any = yield call(fetchCourseApi);
    console.log(response);
    yield put(actions.fetchCoursesSuccess(response));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.fetchCoursesFailure(error.message));
    } else {
      yield put(actions.fetchCoursesFailure('An unknown error occurred'));
    }
  }
}

// POST
export function* addCourseSaga(action: { type: string; payload: any }): Generator<any, void, any> {
  try {
    const response: any = yield call(createCourseApi, action.payload);
    yield put(actions.addCourseSuccess(response));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.addCourseFailure(error.message));
    } else {
      yield put(actions.addCourseFailure('An unknown error occurred'));
    }
  }
}

// PUT
export function* updateCourseSaga(action: { type: string; payload: any }): Generator<any, void, any> {
  try {
    const response: any = yield call(updateCourseApi, action.payload.id, action.payload);
    yield put(actions.updateCourseSuccess(response));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.updateCourseFailure(error.message));
    } else {
      yield put(actions.updateCourseFailure('An unknown error occurred'));
    }
  }
}

// DELETE
export function* deleteCourseSaga(action: { type: string; payload: number }): Generator<any, void, any> {
  try {
    yield call(deleteCourseApi, action.payload);
    yield put(actions.deleteCourseSuccess(action.payload));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.deleteCourseFailure(error.message));
    } else {
      yield put(actions.deleteCourseFailure('An unknown error occurred'));
    }
  }
}

export function* courseWatcherSaga(): Generator<any, void, any> {
  yield all([
    takeLatest(types.FETCH_COURSES_REQUEST, fetchCoursesSaga),
    takeLatest(types.ADD_COURSE_REQUEST, addCourseSaga),
    takeLatest(types.UPDATE_COURSE_REQUEST, updateCourseSaga),
    takeLatest(types.DELETE_COURSE_REQUEST, deleteCourseSaga),
  ]);
}

