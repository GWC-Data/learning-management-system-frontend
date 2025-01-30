import { all } from "redux-saga/effects";
import { courseSaga } from "./course/courseSaga";

export default function* rootSaga() {
  yield all([courseSaga()]);
}