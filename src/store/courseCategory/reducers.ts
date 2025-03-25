// src/store/CourseCategory/reducer.ts
import * as types from "./actionTypes";

interface CourseCategory {
  id: string;
  [key: string]: any;
}

interface CourseCategoryState {
  courseCategory: CourseCategory[];
  loading: boolean;
  error: string | null;
  submissionStatus: string | null;
  updateStatus: string | null;
  deleteStatus: string | null;
}

const initialState: CourseCategoryState = {
  courseCategory: [],
  loading: false,
  error: null,
  submissionStatus: null,
  updateStatus: null,
  deleteStatus: null,
};

const courseCategoryReducer = (state = initialState, action: any): CourseCategoryState => {
  switch (action.type) {
    // GET
    case types.FETCH_COURSECATEGORY_REQUEST:
      return { ...state, loading: true, error: null };
    case types.FETCH_COURSECATEGORY_SUCCESS:
      return { ...state, loading: false, courseCategory: action.payload, error: null };
    case types.FETCH_COURSECATEGORY_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // POST
    case types.ADD_COURSECATEGORY_REQUEST:
      return { ...state, loading: true, submissionStatus: null, error: null };
    case types.ADD_COURSECATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        submissionStatus: "success",
        courseCategory: [...state.courseCategory, action.payload],
        error: null,
      };
    case types.ADD_COURSECATEGORY_FAILURE:
      return {
        ...state,
        loading: false,
        submissionStatus: "failure",
        error: action.payload,
      };

    // PUT
    case types.UPDATE_COURSECATEGORY_REQUEST:
      return { ...state, loading: true, updateStatus: null, error: null };
    case types.UPDATE_COURSECATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        updateStatus: "success",
        courseCategory: state.courseCategory.map((category) =>
          category.id === action.payload.id ? { ...category, ...action.payload } : category
        ),
        error: null,
      };
    case types.UPDATE_COURSECATEGORY_FAILURE:
      return {
        ...state,
        loading: false,
        updateStatus: "failure",
        error: action.payload,
      };

    // DELETE
    case types.DELETE_COURSECATEGORY_REQUEST:
      return { ...state, loading: true, deleteStatus: null, error: null };
    case types.DELETE_COURSECATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        deleteStatus: "success",
        courseCategory: state.courseCategory.filter((category) => category.id !== action.payload),
        error: null,
      };
    case types.DELETE_COURSECATEGORY_FAILURE:
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

export default courseCategoryReducer;