import {combineReducers} from 'redux';

import coursesReducer from './course/reducer';
import courseCategoryReducer from './courseCategory/reducer';
import batchesReducer from './batch/reducer';

const rootReducer = combineReducers({
  course:coursesReducer,
  courseCategory:courseCategoryReducer,
  batch:batchesReducer,
});

export default rootReducer;