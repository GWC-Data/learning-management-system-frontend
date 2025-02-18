// src/store/Course/reducer.ts
import * as types from "./actionTypes";

interface Batch {
  id: number;
  [key: string]: any;
}

interface BatchState {
  batchDataById: any;
  batchDataByName: any;
  batches: Batch[];
  loading: boolean;
  error: string | null;
  submissionStatus: string | null;
  updateStatus: string | null;
  deleteStatus: string | null;
  selectedBatchId: null;
  batchesById: {}; // Store batch data in { batchId: batchData } format
}

const initialState: BatchState = {
  batches: [],
  batchDataByName: null,
  loading: false,
  error: null,
  submissionStatus: null,
  updateStatus: null,
  deleteStatus: null,
  selectedBatchId: null,
  batchesById: {},
  batchDataById: {},
};

const batchesReducer = (state = initialState, action: any): BatchState => {
  console.log("Reducer received action:", action.type, action.payload); // Debugging log
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
      console.log("FETCH_BATCHBYID_SUCCESS Payload:", action.payload);
      return {
        ...state,
        loading: false,
        batchDataById: {
          ...state.batchDataById,
          [action.payload.id]: action.payload, // ✅ Store by batch ID
        },
        error: null,
      };

    case types.FETCH_BATCHBYID_FAILURE:
      return { ...state, loading: false, error: action.payload };

    //Batch by name
    case types.FETCH_BATCH_BY_NAME_REQUEST:
      return { ...state, loading: true, error: null };

    case types.FETCH_BATCH_BY_NAME_SUCCESS:
      return {
        ...state,
        loading: false,
        batchDataByName: action.payload,
        error: null,
      };

    case types.FETCH_BATCH_BY_NAME_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // GET: BY ID MULTIPLE BATCHES
    case types.FETCH_BATCHES_BY_ID_REQUEST:
      console.log("state", state);
      return {
        ...state,
        loading: true,
        error: null,
      };

    case types.FETCH_BATCHES_BY_ID_SUCCESS:
      console.log("Updated State:", action.payload); // Debugging log
      return {
        ...state,
        loading: false,
        batches: action.payload, // Store all batch data
      };

    case types.FETCH_BATCHES_BY_ID_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case types.SET_SELECTED_BATCH_ID:
      return { ...state, selectedBatchId: action.payload };

    // ✅ Store batch data using batch ID
    case types.SET_BATCH_DATA_BY_ID:
      console.log("Updating batchDataById:", action.payload); // Debugging log
      return {
        ...state,
        batchDataById: {
          ...(state.batchDataById || {}), // ✅ Ensure it's always an object
          [action.payload.batchId]: action.payload.batchData, // ✅ Store batch data using ID
        },
      };

    // POST
    case types.ADD_BATCH_REQUEST:
      return { ...state, loading: true, submissionStatus: null, error: null };
    case types.ADD_BATCH_SUCCESS:
      return {
        ...state,
        loading: false,
        submissionStatus: "success",
        batches: [action.payload],
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
