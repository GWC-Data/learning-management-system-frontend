import * as types from "./actionTypes";

const initialState = {
  loading: false,
  error: null,
  modulesByCourseId: {}, // { courseId: { modules: [], lastUpdated: timestamp } }
  modulesById: {}, // Stores module details by moduleId
  selectedModuleId: null,
};

export const moduleReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case types.FETCH_MODULES_REQUEST:
      return { ...state, loading: true, error: null };

    case types.FETCH_MODULES_SUCCESS: {
      const { courseId, modules } = action.payload;
      return {
        ...state,
        loading: false,
        modulesByCourseId: {
          ...state.modulesByCourseId,
          [courseId]: {
            modules, // ✅ Store modules inside an object
            lastUpdated: Date.now(), // ✅ Track last update time
          },
        },
      };
    }

    case types.FETCH_MODULES_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case types.FETCH_MODULE_BY_ID_REQUEST:
      return { ...state, loading: true };

    case types.FETCH_MODULE_BY_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        modulesById: {
          ...state.modulesById,
          [action.payload.moduleId]: action.payload.moduleData,
        },
      };

    case types.FETCH_MODULE_BY_ID_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case types.SET_SELECTED_MODULE_ID:
      return { ...state, selectedModuleId: action.payload };

    case types.SET_MODULES_BY_COURSE_ID: {
      const { courseId, modules } = action.payload;
      return {
        ...state,
        modulesByCourseId: {
          ...state.modulesByCourseId,
          [courseId]: {
            modules,
            lastUpdated: Date.now(), // ✅ Store last updated time
          },
        },
      };
    }

    default:
      return state;
  }
};
