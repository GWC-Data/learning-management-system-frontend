import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CourseState {
    courses: any[]; // List of courses
    loading: boolean; // Loading state for API calls
    error: string | null; // Stores error messages
}
  
//Initial Redux State
const initialState: CourseState = {
  courses: [],
  loading: false,
  error: null,
};

//Reducers
const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    fetchCoursesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCoursesSuccess: (state, action: PayloadAction<any[]>) => {
      state.loading = false;
      state.courses = action.payload;
    },
    fetchCoursesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchCoursesRequest, fetchCoursesSuccess, fetchCoursesFailure } = courseSlice.actions;
export default courseSlice.reducer;