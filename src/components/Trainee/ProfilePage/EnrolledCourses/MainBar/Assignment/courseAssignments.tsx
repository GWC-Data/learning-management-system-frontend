import React from "react";
import Assignments from "./Assignments";

const CourseAssignments: React.FC = () => {
  return (
    <div className="w-full max-w-[1030px]">
      <div className="font-semibold p-3 rounded-2xl text-center border-2  transition-all duration-300 w-[300px] bg-[#6e2b8b] text-white border-[#594e7a]">
        <h1>Show Course Assignments</h1>
      </div>
      <div>
        <Assignments />
      </div>
    </div>
  );
};

export default CourseAssignments;
