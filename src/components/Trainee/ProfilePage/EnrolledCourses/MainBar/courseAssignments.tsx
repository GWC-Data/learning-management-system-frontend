import React, { useState } from "react";
import Assignments from "./Assignments";

const CourseAssignments: React.FC = () => {
  const [showAssignments, setShowAssignments] = useState<boolean>(false);

  const toggleAssignments = () => {
    setShowAssignments(!showAssignments);
  };

  return (
    <div className="w-full max-w-[1030px] bg-white rounded-lg">
  {/* Toggle Button */}
  <div
    className={`font-semibold p-3 rounded-2xl text-center text-slate-800 border-2 cursor-pointer transition-all duration-300 w-[300px] ${
      showAssignments
        ? "bg-[#4e6db4] text-white border-[#4e6db4]"
        : "hover:bg-[#4e6db4] hover:text-white border-gray-300"
    }`}
    onClick={toggleAssignments}
  >
    {/* {showAssignments ? "Hide Assignments" : "Show Course Assignments"} */}
    <h1>Show Course Assignments</h1>
  </div>

  {/* Assignments Section */}
  {showAssignments && (
    <div className="p-4">
      <Assignments />
    </div>
  )}
</div>

  );
};

export default CourseAssignments;
