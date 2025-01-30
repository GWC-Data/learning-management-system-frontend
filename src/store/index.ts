import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import courseReducer from "./course/courseSlice";
import rootSaga from "./rootSaga";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    course: courseReducer, // Adds the course reducer to the store
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
  devTools: true, // Enables Redux DevTools for debugging
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;