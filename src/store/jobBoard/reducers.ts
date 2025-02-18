// src/store/jobBoard/reducer.ts
import * as types from "./actionTypes";

interface JobBoard {
  id: number;
  title: string;
  description: string;
  company: string;
  location: string;
  [key: string]: any;
}

interface JobBoardState {
  jobBoards: JobBoard[];
  loading: boolean;
  error: string | null;
  submissionStatus: string | null;
  updateStatus: string | null;
  deleteStatus: string | null;
}

const initialState: JobBoardState = {
  jobBoards: [],
  loading: false,
  error: null,
  submissionStatus: null,
  updateStatus: null,
  deleteStatus: null,
};

const jobBoardsReducer = (state = initialState, action: any): JobBoardState => {
  switch (action.type) {
    // GET All
    case types.FETCH_JOBBOARDS_REQUEST:
      return { ...state, loading: true, error: null };
    case types.FETCH_JOBBOARDS_SUCCESS:
      return { ...state, loading: false, jobBoards: action.payload, error: null };
    case types.FETCH_JOBBOARDS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // GET By ID
    case types.FETCH_JOBBOARDBYID_REQUEST:
      return { ...state, loading: true, error: null };
    case types.FETCH_JOBBOARDBYID_SUCCESS:
      return { ...state, loading: false, jobBoards: [action.payload], error: null };
    case types.FETCH_JOBBOARDBYID_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // POST (Add)
    case types.ADD_JOBBOARD_REQUEST:
      return { ...state, loading: true, submissionStatus: null, error: null };
    case types.ADD_JOBBOARD_SUCCESS:
      return {
        ...state,
        loading: false,
        submissionStatus: "success",
        jobBoards: [...state.jobBoards, action.payload],
        error: null,
      };
    case types.ADD_JOBBOARD_FAILURE:
      return { ...state, loading: false, submissionStatus: "failure", error: action.payload };

    // PUT (Update)
    case types.UPDATE_JOBBOARD_REQUEST:
      return { ...state, loading: true, updateStatus: null, error: null };
    case types.UPDATE_JOBBOARD_SUCCESS:
      return {
        ...state,
        loading: false,
        updateStatus: "success",
        jobBoards: state.jobBoards.map((board) =>
          board.id === action.payload.id ? { ...board, ...action.payload } : board
        ),
        error: null,
      };
    case types.UPDATE_JOBBOARD_FAILURE:
      return { ...state, loading: false, updateStatus: "failure", error: action.payload };

    // DELETE
    case types.DELETE_JOBBOARD_REQUEST:
      return { ...state, loading: true, deleteStatus: null, error: null };
    case types.DELETE_JOBBOARD_SUCCESS:
      return {
        ...state,
        loading: false,
        deleteStatus: "success",
        jobBoards: state.jobBoards.filter((board) => board.id !== action.payload),
        error: null,
      };
    case types.DELETE_JOBBOARD_FAILURE:
      return { ...state, loading: false, deleteStatus: "failure", error: action.payload };

    default:
      return state;
  }
};

export default jobBoardsReducer;
