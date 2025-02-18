// src/store/Course/actions.ts
import * as types from "./actionTypes";

// GET: Fetch Courses
export const fetchCoursesRequest = () => ({
  type: types.FETCH_COURSES_REQUEST,
});

export const fetchCoursesSuccess = (data: any[]) => {
  console.log("FETCH_COURSES_SUCCESS Payload:", data); // Log the payload
  return {
    type: types.FETCH_COURSES_SUCCESS,
    payload: data,
  };
};

export const fetchCoursesFailure = (error: string) => ({
  type: types.FETCH_COURSES_FAILURE,
  payload: error,
});

// POST: Add Course
export const addCourseRequest = (courseData: any) => ({
  type: types.ADD_COURSE_REQUEST,
  payload: courseData,
});

export const addCourseSuccess = (response: any) => ({
  type: types.ADD_COURSE_SUCCESS,
  payload: response,
});

export const addCourseFailure = (error: string) => ({
  type: types.ADD_COURSE_FAILURE,
  payload: error,
});

// PUT: Update Course
export const updateCourseRequest = (courseData: any) => ({
  type: types.UPDATE_COURSE_REQUEST,
  payload: courseData,
});

export const updateCourseSuccess = (response: any) => ({
  type: types.UPDATE_COURSE_SUCCESS,
  payload: response,
});

export const updateCourseFailure = (error: string) => ({
  type: types.UPDATE_COURSE_FAILURE,
  payload: error,
});

// DELETE: Remove Course
export const deleteCourseRequest = (courseId: number) => ({
  type: types.DELETE_COURSE_REQUEST,
  payload: courseId,
});

export const deleteCourseSuccess = (response: any) => ({
  type: types.DELETE_COURSE_SUCCESS,
  payload: response,
});

export const deleteCourseFailure = (error: string) => ({
  type: types.DELETE_COURSE_FAILURE,
  payload: error,
});

