import React from "react";
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

  return (
    <>
      <CourseHeader course={course} />
      {/* Main Content Row */}
      <div className="flex flex-row w-[780px] h-[calc(80vh-8rem)]  gap-4">
        <div className="flex-3 bg-white p-4">
          <Mainbar course={course} />
        </div>
        <div className="flex-1 bg-white p-4">
          <CourseContent course={course} />
        </div>
      </div>

      {/* Full-width CourseAssignments */}
      <div className="w-full px-6">
        <CourseAssignments />
      </div>
    </>
  );
};

export default CoursePage;
