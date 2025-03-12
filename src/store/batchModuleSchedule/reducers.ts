import * as types from "./actionTypes";

interface BatchModuleSchedule {
  id: string;
  batchId: string;
  moduleId: string;
  scheduleDate: string;
  startTime: string;
  endTime: string;
  [key: string]: any;
}

interface BatchModuleScheduleState {
  batchModuleSchedules: BatchModuleSchedule[];
  batchModuleSchedulesByBatchId: Record<string, BatchModuleSchedule[]>;
  loading: boolean;
  error: string | null;
  submissionStatus: string | null;
  updateStatus: string | null;
  deleteStatus: string | null;
}

const initialState: BatchModuleScheduleState = {
  batchModuleSchedules: [],
  batchModuleSchedulesByBatchId: {},
  loading: false,
  error: null,
  submissionStatus: null,
  updateStatus: null,
  deleteStatus: null,
};

const batchModuleScheduleReducer = (
  state = initialState,
  action: any
): BatchModuleScheduleState => {
  switch (action.type) {
    // ✅ GET All
    case types.FETCH_BATCH_MODULE_SCHEDULE_REQUEST:
      return { ...state, loading: true, error: null };
    case types.FETCH_BATCH_MODULE_SCHEDULE_SUCCESS:
      return {
        ...state,
        loading: false,
        batchModuleSchedules: action.payload,
        error: null,
      };
    case types.FETCH_BATCH_MODULE_SCHEDULE_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ✅ FETCH BATCH MODULE SCHEDULE BY ID
    case types.FETCH_BATCH_MODULE_SCHEDULE_BY_ID_REQUEST:
      return { ...state, loading: true, error: null };
    case types.FETCH_BATCH_MODULE_SCHEDULE_BY_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        batchModuleSchedulesByBatchId: action.payload,
        error: null,
      };
    case types.FETCH_BATCH_MODULE_SCHEDULE_BY_ID_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ✅ GET by Batch ID
    case types.FETCH_BATCH_MODULE_SCHEDULE_BY_BATCH_ID_REQUEST:
      console.log("haha", state);
      return { ...state, loading: true, error: null };

      case types.FETCH_BATCH_MODULE_SCHEDULE_BY_BATCH_ID_SUCCESS:
        console.log("Reducer - Before Update:", JSON.stringify(state, null, 2));
        console.log("Reducer - Action Payload:", JSON.stringify(action.payload, null, 2));
      
        return {
          ...state,
          loading: false,
          batchModuleSchedulesByBatchId: {
            ...state.batchModuleSchedulesByBatchId,
            [action.payload.batchId]: action.payload.batchModuleSchedules || [], // ✅ Ensure it's stored as an array
          },
          error: null,
        };
      

    case types.FETCH_BATCH_MODULE_SCHEDULE_BY_BATCH_ID_FAILURE:
      console.log(state);
      return { ...state, loading: false, error: action.payload };

    // ✅ POST (Add)
    case types.CREATE_BATCH_MODULE_SCHEDULE_REQUEST:
      return { ...state, loading: true, submissionStatus: null, error: null };
    case types.CREATE_BATCH_MODULE_SCHEDULE_SUCCESS:
      return {
        ...state,
        loading: false,
        submissionStatus: "success",
        batchModuleSchedules: [...state.batchModuleSchedules, action.payload],
        error: null,
      };
    case types.CREATE_BATCH_MODULE_SCHEDULE_FAILURE:
      return {
        ...state,
        loading: false,
        submissionStatus: "failure",
        error: action.payload,
      };

    // ✅ PUT (Update)
    case types.UPDATE_BATCH_MODULE_SCHEDULE_REQUEST:
      return { ...state, loading: true, updateStatus: null, error: null };
    case types.UPDATE_BATCH_MODULE_SCHEDULE_SUCCESS:
      return {
        ...state,
        loading: false,
        updateStatus: "success",
        batchModuleSchedules: state.batchModuleSchedules.map((schedule) =>
          schedule.id === action.payload.id
            ? { ...schedule, ...action.payload }
            : schedule
        ),
        error: null,
      };
    case types.UPDATE_BATCH_MODULE_SCHEDULE_FAILURE:
      return {
        ...state,
        loading: false,
        updateStatus: "failure",
        error: action.payload,
      };

    // ✅ DELETE
    case types.DELETE_BATCH_MODULE_SCHEDULE_REQUEST:
      return { ...state, loading: true, deleteStatus: null, error: null };
    case types.DELETE_BATCH_MODULE_SCHEDULE_SUCCESS:
      return {
        ...state,
        loading: false,
        deleteStatus: "success",
        batchModuleSchedules: state.batchModuleSchedules.filter(
          (schedule) => schedule.id !== action.payload
        ),
        error: null,
      };
    case types.DELETE_BATCH_MODULE_SCHEDULE_FAILURE:
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

export default batchModuleScheduleReducer;
