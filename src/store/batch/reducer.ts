// src/store/Course/reducer.ts
import * as types from "./actionTypes";

interface Batch {
  id: number;
  [key: string]: any;
}

interface BatchState {
  batches: Batch[];
  loading: boolean;
  error: string | null;
  submissionStatus: string | null;
  updateStatus: string | null;
  deleteStatus: string | null;
}

const initialState: BatchState = {
  batches: [],
  loading: false,
  error: null,
  submissionStatus: null,
  updateStatus: null,
  deleteStatus: null,
};

const batchesReducer = (state = initialState, action: any): BatchState => {
  switch (action.type) {
    // GET
    case types.FETCH_BATCHES_REQUEST:
      return { ...state, loading: true, error: null };
    case types.FETCH_BATCHES_SUCCESS:
      return { ...state, loading: false, batches: action.payload, error: null };
    case types.FETCH_BATCHES_FAILURE:
      return { ...state, loading: false, error: action.payload };

    
    // GET BY ID
    case types.FETCH_BATCHBYID_REQUEST:
      return { ...state, loading: true, error: null };
    case types.FETCH_BATCHBYID_SUCCESS:
      return { ...state, loading: false, batches: action.payload, error: null };
    case types.FETCH_BATCHBYID_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // POST
    case types.ADD_BATCH_REQUEST:
      return { ...state, loading: true, submissionStatus: null, error: null };
    case types.ADD_BATCH_SUCCESS:
      return {
        ...state,
        loading: false,
        submissionStatus: "success",
        batches: [...state.batches, action.payload],
        error: null,
      };
    case types.ADD_BATCH_FAILURE:
      return {
        ...state,
        loading: false,
        submissionStatus: "failure",
        error: action.payload,
      };

    // PUT
    case types.UPDATE_BATCH_REQUEST:
      return { ...state, loading: true, updateStatus: null, error: null };
    case types.UPDATE_BATCH_SUCCESS:
      return {
        ...state,
        loading: false,
        updateStatus: "success",
        batches: state.batches.map((batch) =>
          batch.id === action.payload.id
            ? { ...batch, ...action.payload }
            : batch
        ),
        error: null,
      };
    case types.UPDATE_BATCH_FAILURE:
      return {
        ...state,
        loading: false,
        updateStatus: "failure",
        error: action.payload,
      };

    // DELETE
    case types.DELETE_BATCH_REQUEST:
      return { ...state, loading: true, deleteStatus: null, error: null };
    case types.DELETE_BATCH_SUCCESS:
      return {
        ...state,
        loading: false,
        deleteStatus: "success",
        batches: state.batches.filter((batch) => batch.id !== action.payload),
        error: null,
      };
    case types.DELETE_BATCH_FAILURE:
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

export default batchesReducer;
