import { all, fork } from "redux-saga/effects";
import { courseWatcherSaga } from "./course/sagas";
import { courseCategoryWatcherSaga } from "./courseCategory/sagas";
import { batchWatcherSaga } from "./batch/sagas";
import { companyInfoWatcherSaga } from "./companyInfo/sagas";
import { jobBoardWatcherSaga } from "./jobBoard/saga";
import { batchTraineeWatcherSaga } from "./batchTrainee/sagas";
import { moduleSaga } from "./module/saga"; 
import { batchClassScheduleWatcherSaga } from "./batchClassSchedule/sagas";
import { classForModuleSaga } from "./classForModule/sagas";

export default function* rootSaga() {
  yield all([
    fork(courseWatcherSaga),
    fork(courseCategoryWatcherSaga),
    fork(batchWatcherSaga),
    fork(companyInfoWatcherSaga),
    fork(jobBoardWatcherSaga),
    fork(batchTraineeWatcherSaga),
    fork(moduleSaga),
    fork(batchClassScheduleWatcherSaga),
    fork(classForModuleSaga),
  ]);
}
