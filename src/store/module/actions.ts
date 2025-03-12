import * as types from "./actionTypes";

// Fetch modules for a given courseId
export const fetchModulesRequest = (courseId: number) => ({
  type: types.FETCH_MODULES_REQUEST,
  payload: courseId,
});

export const fetchModulesSuccess = (courseId: number, modules: any[]) => ({
  type: types.FETCH_MODULES_SUCCESS,
  payload: { courseId, modules },
});

export const fetchModulesFailure = (error: string) => ({
  type: types.FETCH_MODULES_FAILURE,
  payload: error,
});

// Set the selected module ID
export const setSelectedModuleId = (moduleId: number | null) => ({
  type: types.SET_SELECTED_MODULE_ID,
  payload: moduleId,
});

// ✅ Store modules by course ID (used for caching in Redux)
export const setModulesByCourseId = (courseId: number, modules: any[]) => ({
  type: types.SET_MODULES_BY_COURSE_ID,
  payload: { courseId, modules },
});

// Fetch module by moduleId
export const fetchModuleByIdRequest = (moduleId: number) => ({
  type: types.FETCH_MODULE_BY_ID_REQUEST,
  payload: moduleId,
});

export const fetchModuleByIdSuccess = (moduleId: number, moduleData: any) => ({
  type: types.FETCH_MODULE_BY_ID_SUCCESS,
  payload: { moduleId, moduleData },
});

export const fetchModuleByIdFailure = (error: string) => ({
  type: types.FETCH_MODULE_BY_ID_FAILURE,
  payload: error,
});
