import { takeLatest, call, put, all } from "redux-saga/effects"; // ✅ Use 'all' instead of 'afterAll'
import * as types from "./actionTypes";
import { fetchCourseModulebyCourseIdApi, fetchCourseModulebyIdApi } from "@/helpers/api/courseModuleApi";
import { 
  fetchModulesSuccess, 
  fetchModulesFailure, 
  setModulesByCourseId 
} from "./actions";
import { 
  fetchModuleByIdFailure, 
  fetchModuleByIdSuccess 
} from "../actions";

// ✅ Fetch modules by courseId
function* fetchModulesSaga(action: { type: string; payload: number }): Generator<any, void, any> {
  try {
    const modules: any[] = yield call(fetchCourseModulebyCourseIdApi, action.payload);
    yield put(fetchModulesSuccess(action.payload, modules));
    yield put(setModulesByCourseId(action.payload, modules));
  } catch (error: any) {
    yield put(fetchModulesFailure(error.message));
  }
}

// ✅ Fetch module by moduleId
function* fetchModuleByIdSaga(action: { type: string; payload: number }): Generator<any, void, any> {
  try {
    const response = yield call(fetchCourseModulebyIdApi, action.payload);
    yield put(fetchModuleByIdSuccess(action.payload, response));
  } catch (error: any) {
    yield put(fetchModuleByIdFailure(error.message));
  }
}

// ✅ Corrected saga watcher function
export function* moduleSaga(): Generator<any, void, any> {
  yield all([
    takeLatest(types.FETCH_MODULES_REQUEST, fetchModulesSaga),
    takeLatest(types.FETCH_MODULE_BY_ID_REQUEST, fetchModuleByIdSaga),
  ]);
}
