// src/store/CompanyInfo/saga.ts
import { call, put, takeLatest, all } from "redux-saga/effects";
import * as types from "./actionTypes";
import * as actions from "./actions";
import {
  createCompanyInfoApi,
  fetchCompanyInfosApi,
  fetchCompanyInfoByIdApi,
  updateCompanyInfoApi,
  deleteCompanyInfoApi,
} from "../../helpers/api/companyInfoApi";

// GET ALL
export function* fetchCompanyInfosSaga(): Generator<any, void, any> {
  try {
    const response: any = yield call(fetchCompanyInfosApi);
    console.log(response);
    yield put(actions.fetchCompanyInfosSuccess(response));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.fetchCompanyInfosFailure(error.message));
    } else {
      yield put(actions.fetchCompanyInfosFailure("An unknown error occurred"));
    }
  }
}

// GET BY ID
export function* fetchCompanyInfoByIdSaga(action: {
  type: string;
  payload: number;
}): Generator<any, void, any> {
  try {
    const response: any = yield call(fetchCompanyInfoByIdApi, action.payload);
    console.log(response);
    yield put(actions.fetchCompanyInfoByIdSuccess(response));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.fetchCompanyInfoByIdFailure(error.message));
    } else {
      yield put(actions.fetchCompanyInfoByIdFailure("An unknown error occurred"));
    }
  }
}

// POST (ADD)
export function* addCompanyInfoSaga(action: {
  type: string;
  payload: any;
}): Generator<any, void, any> {
  try {
    const response: any = yield call(createCompanyInfoApi, action.payload);
    yield put(actions.addCompanyInfoSuccess(response));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.addCompanyInfoFailure(error.message));
    } else {
      yield put(actions.addCompanyInfoFailure("An unknown error occurred"));
    }
  }
}

// PUT (UPDATE)
export function* updateCompanyInfoSaga(action: {
  type: string;
  payload: any;
}): Generator<any, void, any> {
  try {
    const response: any = yield call(
      updateCompanyInfoApi,
      action.payload.id,
      action.payload
    );
    yield put(actions.updateCompanyInfoSuccess(response));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.updateCompanyInfoFailure(error.message));
    } else {
      yield put(actions.updateCompanyInfoFailure("An unknown error occurred"));
    }
  }
}

// DELETE
export function* deleteCompanyInfoSaga(action: {
  type: string;
  payload: number;
}): Generator<any, void, any> {
  try {
    yield call(deleteCompanyInfoApi, action.payload);
    yield put(actions.deleteCompanyInfoSuccess(action.payload));
  } catch (error: unknown) {
    if (error instanceof Error) {
      yield put(actions.deleteCompanyInfoFailure(error.message));
    } else {
      yield put(actions.deleteCompanyInfoFailure("An unknown error occurred"));
    }
  }
}

export function* companyInfoWatcherSaga(): Generator<any, void, any> {
  yield all([
    takeLatest(types.FETCH_COMPANYINFOS_REQUEST, fetchCompanyInfosSaga),
    takeLatest(types.FETCH_COMPANYINFOBYID_REQUEST, fetchCompanyInfoByIdSaga),
    takeLatest(types.ADD_COMPANYINFO_REQUEST, addCompanyInfoSaga),
    takeLatest(types.UPDATE_COMPANYINFO_REQUEST, updateCompanyInfoSaga),
    takeLatest(types.DELETE_COMPANYINFO_REQUEST, deleteCompanyInfoSaga),
  ]);
}
