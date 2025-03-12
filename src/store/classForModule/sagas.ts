// src/redux/sagas.ts

import { takeLatest, call, put, all } from "redux-saga/effects";
import * as actions from "./actions";
import * as api from "../../helpers/api/classForModuleApi";
import * as actionTypes from "./actionTypes";

// Worker Sagas
function* fetchClassSaga(): Generator<any, void, any> {
  try {
    const data = yield call(api.fetchClassForModuleApi);
    yield put(actions.fetchClassSuccess(data));
  } catch (error) {
    yield put(actions.fetchClassFailure(error));
  }
}

function* fetchClassByIdSaga(action: any): Generator<any, void, any> {
  try {
    const data = yield call(api.fetchClassForModuleByIdApi, action.payload);
    yield put(actions.fetchClassByIdSuccess(data));
  } catch (error) {
    yield put(actions.fetchClassByIdFailure(error));
  }
}

// Fetch multiple classes using module
export function* fetchClassByModuleSaga(action: {
  type: string;
  payload: number[];
}): Generator<any, void, any> {
  try {
    console.log("Saga Triggered - Batch IDs:", action.payload);
    const responses: any[] = yield all(
      action.payload.map((moduleId) =>
        call(api.fetchClassForModuleByModuleIdApi, moduleId)
      )
    );
    console.log("Fetched Batch Data:", responses);
    yield put(actions.fetchClassByModuleSuccess(responses));
  } catch (error: unknown) {
    console.error("Saga Error:", error);
    yield put(actions.fetchClassByModuleFailure("Failed to fetch batch data"));
  }
}

function* createClassSaga(action: any): Generator<any, void, any> {
  try {
    const data = yield call(api.createClassForModuleApi, action.payload);
    yield put(actions.createClassSuccess(data));
  } catch (error) {
    yield put(actions.createClassFailure(error));
  }
}

function* updateClassSaga(action: any): Generator<any, void, any> {
  try {
    const { classId, classData } = action.payload;
    const data = yield call(api.updateClassForModuleApi, classId, classData);
    yield put(actions.updateClassSuccess(data));
  } catch (error) {
    yield put(actions.updateClassFailure(error));
  }
}

function* deleteClassSaga(action: any): Generator<any, void, any> {
  try {
    yield call(api.deleteClassForModuleApi, action.payload);
    yield put(actions.deleteClassSuccess(action.payload));
  } catch (error) {
    yield put(actions.deleteClassFailure(error));
  }
}

// Watcher Sagas
export function* classForModuleSaga() {
  yield takeLatest(actionTypes.FETCH_CLASS_REQUEST, fetchClassSaga);
  yield takeLatest(actionTypes.FETCH_CLASS_BY_ID_REQUEST, fetchClassByIdSaga);
  yield takeLatest(
    actionTypes.FETCH_CLASS_BY_MODULE_REQUEST,
    fetchClassByModuleSaga
  );
  yield takeLatest(actionTypes.CREATE_CLASS_REQUEST, createClassSaga);
  yield takeLatest(actionTypes.UPDATE_CLASS_REQUEST, updateClassSaga);
  yield takeLatest(actionTypes.DELETE_CLASS_REQUEST, deleteClassSaga);
}
