import { call, put, takeLatest } from "redux-saga/effects";
import { fetchCourseApi } from "@/api/courseApi";
import {
  fetchCoursesRequest,
  fetchCoursesSuccess,
  fetchCoursesFailure,
} from "./courseSlice";
import { Course } from "@/api/types"; // Import the Course type

function* fetchCoursesSaga(): Generator<any, void, unknown> {
  try {
    // Fetch the courses with proper typing
    const courses: Course[] = (yield call(fetchCourseApi)) as Course[];
    yield put(fetchCoursesSuccess(courses));
  } catch (error: any) {
    yield put(fetchCoursesFailure(error.message));
  }
}

export function* courseSaga() {
  yield takeLatest(fetchCoursesRequest.type, fetchCoursesSaga);
}

