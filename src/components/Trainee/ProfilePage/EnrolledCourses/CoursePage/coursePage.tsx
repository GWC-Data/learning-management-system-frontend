import React from "react";
import { useLocation } from "react-router-dom";
import CourseHeader from "../CourseHeader/courseHeader";
import Mainbar from "../MainBar/mainBar";
import CourseContent from "../CourseContent/courseContent";

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
      <CourseHeader course={course}  />
      <div className="flex flex-row w-[780px] h-[calc(100vh-7rem)] gap-4">
        <div className="flex-3 bg-white p-4">
          <Mainbar course={course} />
        </div>
        <div className="flex-1 bg-white p-4">
          <CourseContent course={course} />
        </div>
      </div>
    </>
  );
};

export default CoursePage;
