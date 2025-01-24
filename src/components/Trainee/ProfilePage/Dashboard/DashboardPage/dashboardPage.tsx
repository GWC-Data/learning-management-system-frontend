// DashboardPage.tsx
import React from "react";
import DashboardHeader from "../DashboardHeader/dashboardHeader";
import MyCourses from "../MyCourses/myCourses";
import NewCourses from "../NewCourse/newCourse";

const DashboardPage: React.FC = () => {
  return (
    <>
      {/* Header Section */}
      <DashboardHeader />

      {/* Grid Layout */}
      <div className="mt-10">
        <div className="grid grid-cols-2 gap-5 p-4">
          <MyCourses />
          <NewCourses />
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
