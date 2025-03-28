import * as types from "./actionTypes";

interface BatchClassSchedule {
  id: string;
  batchId: string;
  moduleId: string;
  scheduleDate: string;
  startTime: string;
  endTime: string;
  [key: string]: any;
}

interface BatchClassScheduleState {
  batchClassSchedules: BatchClassSchedule[];
  batchClassSchedulesByBatchId: Record<string, BatchClassSchedule[]>;
  loading: boolean;
  error: string | null;
  submissionStatus: string | null;
  updateStatus: string | null;
  deleteStatus: string | null;
}

const initialState: BatchClassScheduleState = {
  batchClassSchedules: [],
  batchClassSchedulesByBatchId: {},
  loading: false,
  error: null,
  submissionStatus: null,
  updateStatus: null,
  deleteStatus: null,
};

const batchClassScheduleReducer = (
  state = initialState,
  action: any
): BatchClassScheduleState => {
  switch (action.type) {
    // ✅ GET All
    case types.FETCH_BATCH_CLASS_SCHEDULE_REQUEST:
      return { ...state, loading: true, error: null };
    case types.FETCH_BATCH_CLASS_SCHEDULE_SUCCESS:
      return {
        ...state,
        loading: false,
        batchClassSchedules: action.payload,
        error: null,
      };
    case types.FETCH_BATCH_CLASS_SCHEDULE_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ✅ FETCH BATCH MODULE SCHEDULE BY ID
    case types.FETCH_BATCH_CLASS_SCHEDULE_BY_ID_REQUEST:
      return { ...state, loading: true, error: null };
    case types.FETCH_BATCH_CLASS_SCHEDULE_BY_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        batchClassSchedulesByBatchId: action.payload,
        error: null,
      };
    case types.FETCH_BATCH_CLASS_SCHEDULE_BY_ID_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ✅ GET by Batch ID
    case types.FETCH_BATCH_CLASS_SCHEDULE_BY_BATCH_ID_REQUEST:
      console.log("haha", state);
      return { ...state, loading: true, error: null };

      case types.FETCH_BATCH_CLASS_SCHEDULE_BY_BATCH_ID_SUCCESS:
        console.log("Reducer - Before Update:", JSON.stringify(state, null, 2));
        console.log("Reducer - Action Payload:", JSON.stringify(action.payload, null, 2));
      
        return {
          ...state,
          loading: false,
          batchClassSchedulesByBatchId: {
            ...state.batchClassSchedulesByBatchId,
            [action.payload.batchId]: action.payload.batchClassSchedules || [], // ✅ Ensure it's stored as an array
          },
          error: null,
        };
      

    case types.FETCH_BATCH_CLASS_SCHEDULE_BY_BATCH_ID_FAILURE:
      console.log(state);
      return { ...state, loading: false, error: action.payload };

    // ✅ POST (Add)
    case types.CREATE_BATCH_CLASS_SCHEDULE_REQUEST:
      return { ...state, loading: true, submissionStatus: null, error: null };
    case types.CREATE_BATCH_CLASS_SCHEDULE_SUCCESS:
      return {
        ...state,
        loading: false,
        submissionStatus: "success",
        batchClassSchedules: [...state.batchClassSchedules, action.payload],
        error: null,
      };
    case types.CREATE_BATCH_CLASS_SCHEDULE_FAILURE:
      return {
        ...state,
        loading: false,
        submissionStatus: "failure",
        error: action.payload,
      };

    // ✅ PUT (Update)
    case types.UPDATE_BATCH_CLASS_SCHEDULE_REQUEST:
      return { ...state, loading: true, updateStatus: null, error: null };
    case types.UPDATE_BATCH_CLASS_SCHEDULE_SUCCESS:
      return {
        ...state,
        loading: false,
        updateStatus: "success",
        batchClassSchedules: state.batchClassSchedules.map((schedule) =>
          schedule.id === action.payload.id
            ? { ...schedule, ...action.payload }
            : schedule
        ),
        error: null,
      };
    case types.UPDATE_BATCH_CLASS_SCHEDULE_FAILURE:
      return {
        ...state,
        loading: false,
        updateStatus: "failure",
        error: action.payload,
      };

    // ✅ DELETE
    case types.DELETE_BATCH_CLASS_SCHEDULE_REQUEST:
      return { ...state, loading: true, deleteStatus: null, error: null };
    case types.DELETE_BATCH_CLASS_SCHEDULE_SUCCESS:
      return {
        ...state,
        loading: false,
        deleteStatus: "success",
        batchClassSchedules: state.batchClassSchedules.filter(
          (schedule) => schedule.id !== action.payload
        ),
        error: null,
      };
    case types.DELETE_BATCH_CLASS_SCHEDULE_FAILURE:
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

export default batchClassScheduleReducer;
