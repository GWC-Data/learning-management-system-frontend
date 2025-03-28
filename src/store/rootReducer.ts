import {combineReducers} from 'redux';
import coursesReducer from './course/reducers';
import courseCategoryReducer from './courseCategory/reducers';
import batchesReducer from './batch/reducers';
import batchTraineeReducer from './batchTrainee/reducers';
import { moduleReducer } from "./module/reducers"; // ✅ Import moduleReducer
import batchClassScheduleReducer from './batchClassSchedule/reducers';
import classForModuleReducer from './classForModule/reducers';

const rootReducer = combineReducers({
  course:coursesReducer,
  courseCategory:courseCategoryReducer,
  batch:batchesReducer,
  batchTrainee:batchTraineeReducer,
  module: moduleReducer, // ✅ Add moduleReducer to store
  batchClassSchedule: batchClassScheduleReducer,
  classForModule: classForModuleReducer,
});

export default rootReducer;