import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import CourseHeader from "../CourseHeader/courseHeader";
import Mainbar from "../MainBar/mainBar";
import CourseContent from "../CourseContent/courseContent";
import { fetchBatchByNameRequest } from "@/store/batch/actions";

const CoursePage: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [selectedClass, setSelectedClass] = useState<any>(null);

  // ✅ Extract batch name from URL using `useLocation`
  const batchName = decodeURIComponent(location.pathname.split("/")[3]);

  // Capitalize the batch name
  const capitalizedBatchName = batchName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // ✅ Fetch batch data when the component mounts
  useEffect(() => {
    if (capitalizedBatchName) {
      console.log("📡 Fetching batch data for:", capitalizedBatchName);
      dispatch(fetchBatchByNameRequest(capitalizedBatchName));
    }
  }, [capitalizedBatchName, dispatch]);

  // ✅ Get batch data from Redux
  const batch = useSelector((state: any) => state.batch.batchDataByName);

  console.log("📝 Redux Batch Data:", batch);

  return (
    <div className="bg-gray-100 -ml-10">
      {/* Course Header */}
      <CourseHeader />

      {/* Main Content */}
      <div className="flex flex-row flex-grow gap-8 p-4 max-w-7xl mx-auto mt-4">
        {/* Left Section - Mainbar */}
        <div className="flex-[3] bg-white rounded-xl shadow-md border border-gray-300">
          <Mainbar selectedClass={selectedClass} />
        </div>

        {/* Right Section - Course Content */}
        <div className="flex-[1] bg-white p-5 rounded-xl shadow-md border border-gray-300 h-[600px] w-[500px]">
          <CourseContent setSelectedClass={setSelectedClass} />
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
