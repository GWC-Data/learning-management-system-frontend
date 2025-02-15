import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import CourseHeader from "../CourseHeader/courseHeader";
import Mainbar from "../MainBar/mainBar";
import CourseContent from "../CourseContent/courseContent";
import { fetchBatchByNameRequest } from "@/store/batch/actions";

const CoursePage: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [batchName, setBatchName] = useState("");
  const [selectedClass, setSelectedClass] = useState<any>(null); // ✅ Store selected class

  // ✅ Extract Batch Name from URL
  useEffect(() => {
    const extractPath = () => {
      const hash = window.location.hash.replace("#", ""); // Remove `#`
      const parts = hash.split("/"); // Split into segments
      let lastPart = parts.pop() || ""; // Get the last segment

      lastPart = decodeURIComponent(lastPart) // Convert `%20` to spaces
        .split(" ") // Split into words
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
        .join(" "); // Join back into a single string

      setBatchName(lastPart);
    };

    extractPath(); // Run on mount
    window.addEventListener("hashchange", extractPath); // Listen for hash changes

    return () => {
      window.removeEventListener("hashchange", extractPath); // Cleanup event listener
    };
  }, []);

  console.log("🔗 Extracted Batch Name:", batchName);

  // ✅ Fetch batch data when batchName is available
  useEffect(() => {
    if (batchName) {
      console.log("📡 Fetching batch data for:", batchName);
      dispatch(fetchBatchByNameRequest(batchName));
    }
  }, [batchName, dispatch]);

  // ✅ Get batch data from Redux
  const batch = useSelector(
    (state: any) => state.batch.batchDataByName || null
  );

  console.log("📝 Redux Batch Data:", batch);

  return (
    <div className=" bg-gray-100 -ml-10">
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
