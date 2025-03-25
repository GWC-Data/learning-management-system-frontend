import React, { useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { batch, useDispatch, useSelector } from "react-redux";
import { fetchBatchIdByTraineeIdRequest } from "@/store/batchTrainee/actions";
import {
  fetchBatchesByIdRequest,
  setBatchDataById,
  setSelectedBatchId,
} from "@/store/batch/actions";

interface EnrolledCourses {
  id: number;
  batchName: string;
  startDate: Date;
  endDate: Date;
  course: string;
  courseId: number;
  courseImg: string;
  courseLink: string;
}

const EnrolledCourses: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation(); // ✅ Use location correctly

  // Fetch batch IDs and batch details from Redux store
  const fetchBatchId = useSelector(
    (state: any) => state.batchTrainee.batchTrainees
  );
  console.log('FetchBatchId',fetchBatchId)
  const fetchBatch = useSelector((state: any) => state.batch.batches);
  console.log('fetchBatch',fetchBatch)
  const loading = useSelector((state: any) => state.batch.loading);

  // Keep track of fetched batch IDs to prevent duplicate calls
  const fetchedBatchIdsRef = useRef(new Set<String>());

  // Dispatch action to fetch batch IDs on component mount
  useEffect(() => {
    const userId = localStorage.getItem("userId") ?? ""; // Provide a fallback empty string
  
    if (!userId) {
      console.error("User ID not found in localStorage");
      return; // Prevent dispatching an invalid request
    }
  
    console.log("Fetching Batch IDs for User:", userId);
    dispatch(fetchBatchIdByTraineeIdRequest(userId));
  }, [dispatch]);
  
  // Dispatch action to fetch batch details when batch IDs are available
  useEffect(() => {
    if (fetchBatchId?.length > 0) {
      console.log("Fetched Batch IDs:", fetchBatchId); // ✅ Debug
      const uniqueBatchIds = fetchBatchId.filter(
        (batchId: string) => !fetchedBatchIdsRef.current.has(batchId)
      );

      if (uniqueBatchIds.length > 0) {
        console.log("Fetching Batch Data for IDs:", uniqueBatchIds); // ✅ Debug
        dispatch(fetchBatchesByIdRequest(uniqueBatchIds));
        uniqueBatchIds.forEach((batchId: string) =>
          fetchedBatchIdsRef.current.add(batchId)
        );
      }
    }
  }, [fetchBatchId, dispatch]);

  // Transform Redux data into required format
  const enrolledCourses = fetchBatch.map((batch: any) => ({
    id: batch.id,
    batchName: batch.batchName,
    startDate: new Date(batch.startDate.value),
    endDate: new Date(batch.endDate.value),
    course: batch.course.courseName,
    courseId: batch.course.id,
    courseImg: batch.course.courseImg,
    courseLink: batch.course.courseLink,
  }));

  console.log("Mapped Enrolled Courses:", enrolledCourses);

  const isParentRoute = location.pathname === "/trainee/enrolledCourses";
  const isChildRoute = location.pathname.startsWith(
    "/trainee/enrolledCourses/"
  );

  return (
    <div className="p-6 max-w-7xl mx-auto overflow-x-hidden">
      {isParentRoute && (
        <>
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            Your Enrolled Courses
          </h1>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : enrolledCourses.length === 0 ? (
            <div className="text-center text-lg text-gray-500">
              No courses enrolled yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {enrolledCourses.map((course: any) => (
                <div
                  key={course.id}
                  className="relative bg-[#F5ECF9] border border-gray-300 rounded-xl hover:shadow-lg transition-shadow transform hover:scale-105 duration-300 ease-in-out p-6 cursor-pointer"
                  onClick={() => {
                    const batchData = fetchBatch.find(
                      (b: any) => b.id === course.id
                    );
                    console.log("batchData", batchData);
                    if (batchData) {
                      dispatch(setBatchDataById(course.id, batchData)); // ✅ Store batch data
                      dispatch(setSelectedBatchId(course.id)); // ✅ Set selected batch ID
                      navigate(
                        `/trainee/enrolledCourses/${course.batchName.toLowerCase()}`
                      );
                    } else {
                      console.error("Batch data not found for ID:", course.id);
                    }
                  }}
                >
                  <div className="text-2xl font-semibold text-gray-800 mb-4">
                    {course.batchName}
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Start:</span>{" "}
                    {course.startDate.toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">End:</span>{" "}
                    {course.endDate.toLocaleDateString()}
                  </div>
                  <div className="absolute bottom-4 right-4 bg-[#6e2b8b] text-white text-sm px-6 py-2 rounded-full">
                    {course.course}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {isChildRoute && (
        <div>
          {/* <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Course Details
          </h2> */}
          <Outlet />
        </div>
      )}
    </div>
  );
};

export default EnrolledCourses;
