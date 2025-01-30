import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import CourseHeader from "../CourseHeader/courseHeader";
import Mainbar from "../MainBar/mainBar";
import CourseContent from "../CourseContent/courseContent";
import CourseAssignments from "../MainBar/courseAssignments";

const CoursePage: React.FC = () => {
  const location = useLocation();
  const course = location.state; // Access the passed course data

  if (!course) {
    // Handle the case where course data is not available
    return <div>Error: Course data not found.</div>;
  }

  console.log("Course Data:", course);

  // State for the recorded video link
  const [recordedLink, setRecordedLink] = useState<string | null>(null);
  const [selectedModuleDetails, setSelectedModuleDetails] = useState<{
    name: string;
    description: string;
  } | null>(null);

  return (
    <>
      <CourseHeader course={course} />
      {/* Main Content Row */}
      <div className="flex flex-row w-[780px] h-[calc(80vh-8rem)]  gap-4">
        <div className="flex-3 bg-white p-4">
          <Mainbar course={course} recordedLink={recordedLink} selectedModuleDetails={selectedModuleDetails}/>{" "}
          {/* Pass recordedLink to Mainbar */}
        </div>
        <div className="flex-1 bg-white p-4">
          <CourseContent course={course} setRecordedLink={setRecordedLink} setSelectedModuleDetails={setSelectedModuleDetails} />{" "}
          {/* Pass setRecordedLink to CourseContent */}
        </div>
      </div>

      {/* Full-width CourseAssignments */}
      <div className="w-full px-6 mt-[100px]">
        <CourseAssignments />
      </div>
    </>
  );
};

export default CoursePage;
