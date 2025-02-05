import { all, fork } from 'redux-saga/effects';
import { courseWatcherSaga } from './course/saga';
import { courseCategoryWatcherSaga } from './courseCategory/saga';
import { batchWatcherSaga } from './batch/saga';

export default function* rootSaga() {
    yield all([
        fork(courseWatcherSaga),
        fork(courseCategoryWatcherSaga),
        fork(batchWatcherSaga),
    ]);
}