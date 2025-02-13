// src/store/Course/reducer.ts
import * as types from "./actionTypes";

interface Course {
  id: number;
  [key: string]: any;
}

interface CourseState {
  courses: Course[];
  loading: boolean;
  error: string | null;
  submissionStatus: string | null;
  updateStatus: string | null;
  deleteStatus: string | null;
}

const initialState: CourseState = {
  courses: [],
  loading: false,
  error: null,
  submissionStatus: null,
  updateStatus: null,
  deleteStatus: null,
};

const coursesReducer = (state = initialState, action: any): CourseState => {
  switch (action.type) {
    // GET
    case types.FETCH_COURSES_REQUEST:
      return { ...state, loading: true, error: null };
    case types.FETCH_COURSES_SUCCESS:
      return { ...state, loading: false, courses: action.payload, error: null };
    case types.FETCH_COURSES_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // POST
    case types.ADD_COURSE_REQUEST:
      return { ...state, loading: true, submissionStatus: null, error: null };
    case types.ADD_COURSE_SUCCESS:
      return {
        ...state,
        loading: false,
        submissionStatus: "success",
        courses: [...state.courses, action.payload],
        error: null,
      };
    case types.ADD_COURSE_FAILURE:
      return {
        ...state,
        loading: false,
        submissionStatus: "failure",
        error: action.payload,
      };

    // PUT
    case types.UPDATE_COURSE_REQUEST:
      return { ...state, loading: true, updateStatus: null, error: null };
    case types.UPDATE_COURSE_SUCCESS:
      return {
        ...state,
        loading: false,
        updateStatus: "success",
        courses: state.courses.map((course) =>
          course.id === action.payload.id
            ? { ...course, ...action.payload }
            : course
        ),
        error: null,
      };
    case types.UPDATE_COURSE_FAILURE:
      return {
        ...state,
        loading: false,
        updateStatus: "failure",
        error: action.payload,
      };

    // DELETE
    case types.DELETE_COURSE_REQUEST:
      return { ...state, loading: true, deleteStatus: null, error: null };
    case types.DELETE_COURSE_SUCCESS:
      return {
        ...state,
        loading: false,
        deleteStatus: "success",
        courses: state.courses.filter((course) => course.id !== action.payload),
        error: null,
      };
    case types.DELETE_COURSE_FAILURE:
      return {
        ...state,
        loading: false,
        deleteStatus: "failure",
        error: action.payload,
      };

    default:
      return state;
  }
};

export default coursesReducer;
