// src/store/companyInfo/reducer.ts
import * as types from "./actionTypes";

interface CompanyInfo {
  id: number;
  companyName: string;
  companyImage: string;
  [key: string]: any;
}

interface CompanyInfoState {
  companyInfos: CompanyInfo[];
  loading: boolean;
  error: string | null;
  submissionStatus: string | null;
  updateStatus: string | null;
  deleteStatus: string | null;
}

const initialState: CompanyInfoState = {
  companyInfos: [],
  loading: false,
  error: null,
  submissionStatus: null,
  updateStatus: null,
  deleteStatus: null,
};

//data, loading, error, 

const companyInfosReducer = (state = initialState, action: any): CompanyInfoState => {
  switch (action.type) {
    // GET All
    case types.FETCH_COMPANYINFOS_REQUEST:
      return { ...state, loading: true, error: null };
    case types.FETCH_COMPANYINFOS_SUCCESS:
      return { ...state, loading: false, companyInfos: action.payload, error: null };
    case types.FETCH_COMPANYINFOS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // GET By ID
    case types.FETCH_COMPANYINFOBYID_REQUEST:
      return { ...state, loading: true, error: null };
    case types.FETCH_COMPANYINFOBYID_SUCCESS:
      return { ...state, loading: false, companyInfos: [action.payload], error: null };
    case types.FETCH_COMPANYINFOBYID_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // POST (Add)
    case types.ADD_COMPANYINFO_REQUEST:
      return { ...state, loading: true, submissionStatus: null, error: null };
    case types.ADD_COMPANYINFO_SUCCESS:
      return {
        ...state,
        loading: false,
        submissionStatus: "success",
        companyInfos: [...state.companyInfos, action.payload],
        error: null,
      };
    case types.ADD_COMPANYINFO_FAILURE:
      return { ...state, loading: false, submissionStatus: "failure", error: action.payload };

    // PUT (Update)
    case types.UPDATE_COMPANYINFO_REQUEST:
      return { ...state, loading: true, updateStatus: null, error: null };
    case types.UPDATE_COMPANYINFO_SUCCESS:
      return {
        ...state,
        loading: false,
        updateStatus: "success",
        companyInfos: state.companyInfos.map((info) =>
          info.id === action.payload.id ? { ...info, ...action.payload } : info
        ),
        error: null,
      };
    case types.UPDATE_COMPANYINFO_FAILURE:
      return { ...state, loading: false, updateStatus: "failure", error: action.payload };

    // DELETE
    case types.DELETE_COMPANYINFO_REQUEST:
      return { ...state, loading: true, deleteStatus: null, error: null };
    case types.DELETE_COMPANYINFO_SUCCESS:
      return {
        ...state,
        loading: false,
        deleteStatus: "success",
        companyInfos: state.companyInfos.filter((info) => info.id !== action.payload),
        error: null,
      };
    case types.DELETE_COMPANYINFO_FAILURE:
      return { ...state, loading: false, deleteStatus: "failure", error: action.payload };

    default:
      return state;
  }
};

export default companyInfosReducer;
