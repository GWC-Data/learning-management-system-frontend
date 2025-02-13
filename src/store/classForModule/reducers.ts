// src/redux/reducers.ts
import * as types from "./actionTypes";

interface ClassInfo {
  id: number;
  className: string;
  moduleId: number;
  [key: string]: any;
}

interface ClassState {
  classes: ClassInfo[];
  classData: any | null;
  classById: ClassInfo | null;
  classByModule: ClassInfo[];
  loading: boolean;
  error: string | null;
  submissionStatus: string | null;
  updateStatus: string | null;
  deleteStatus: string | null;
}

const initialState: ClassState = {
  classes: [],
  classData: null,
  classById: null,
  classByModule: [],
  loading: false,
  error: null,
  submissionStatus: null,
  updateStatus: null,
  deleteStatus: null,
};

const classForModuleReducer = (state = initialState, action: any): ClassState => {
  switch (action.type) {
    // GET All Classes
    case types.FETCH_CLASS_REQUEST:
      return { ...state, loading: true, error: null };
    case types.FETCH_CLASS_SUCCESS:
      return { ...state, loading: false, classes: action.payload, error: null };
    case types.FETCH_CLASS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // GET Class By ID
    case types.FETCH_CLASS_BY_ID_REQUEST:
      return { ...state, loading: true, error: null };
    case types.FETCH_CLASS_BY_ID_SUCCESS:
      return { ...state, loading: false, classById: action.payload, error: null };
    case types.FETCH_CLASS_BY_ID_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // GET Classes By Module ID Multiple
    case types.FETCH_CLASS_BY_MODULE_REQUEST:
      return { ...state, loading: true, error: null };
    case types.FETCH_CLASS_BY_MODULE_SUCCESS:
      return { ...state, loading: false, classByModule: action.payload, error: null };
    case types.FETCH_CLASS_BY_MODULE_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // POST (Add Class)
    case types.CREATE_CLASS_REQUEST:
      return { ...state, loading: true, submissionStatus: null, error: null };
    case types.CREATE_CLASS_SUCCESS:
      return {
        ...state,
        loading: false,
        submissionStatus: "success",
        classes: [...state.classes, action.payload],
        error: null,
      };
    case types.CREATE_CLASS_FAILURE:
      return { ...state, loading: false, submissionStatus: "failure", error: action.payload };

    // PUT (Update Class)
    case types.UPDATE_CLASS_REQUEST:
      return { ...state, loading: true, updateStatus: null, error: null };
    case types.UPDATE_CLASS_SUCCESS:
      return {
        ...state,
        loading: false,
        updateStatus: "success",
        classes: state.classes.map((cls) =>
          cls.id === action.payload.id ? { ...cls, ...action.payload } : cls
        ),
        error: null,
      };
    case types.UPDATE_CLASS_FAILURE:
      return { ...state, loading: false, updateStatus: "failure", error: action.payload };

    // DELETE Class
    case types.DELETE_CLASS_REQUEST:
      return { ...state, loading: true, deleteStatus: null, error: null };
    case types.DELETE_CLASS_SUCCESS:
      return {
        ...state,
        loading: false,
        deleteStatus: "success",
        classes: state.classes.filter((cls) => cls.id !== action.payload),
        error: null,
      };
    case types.DELETE_CLASS_FAILURE:
      return { ...state, loading: false, deleteStatus: "failure", error: action.payload };

    default:
      return state;
  }
};

export default classForModuleReducer;
