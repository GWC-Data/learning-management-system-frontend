import * as types from "./actionTypes";

interface BatchTraineeState {
  batchTrainees: number[]; // Assuming it's an array of batch IDs
  loading: boolean;
  error: string | null;
}

const initialState: BatchTraineeState = {
  batchTrainees: [],
  loading: false,
  error: null,
};

const batchTraineeReducer = (state = initialState, action: any): BatchTraineeState => {
  switch (action.type) {
    // GET Batch IDs by Trainee ID
    case types.FETCH_BATCHIDBYTRAINEEID_REQUEST:
      return { ...state, loading: true, error: null };
    case types.FETCH_BATCHIDBYTRAINEEID_SUCCESS:
      return { ...state, loading: false, batchTrainees: action.payload, error: null };
    case types.FETCH_BATCHIDBYTRAINEEID_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default batchTraineeReducer;
