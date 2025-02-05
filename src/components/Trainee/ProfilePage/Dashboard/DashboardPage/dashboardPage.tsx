// DashboardPage.tsx
import React, { useEffect } from "react";
import DashboardHeader from "../DashboardHeader/dashboardHeader";
import MyCourses from "../MyCourses/myCourses";
import NewCourses from "../NewCourse/newCourse";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { fetchCoursesRequest } from "@/store/actions";

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch();
  const updateStatus = useSelector((state: any) => state.course.courses);  // Select courses from state
  console.log("UpdateStatus :",updateStatus);

  useEffect(() => {
    if (!updateStatus.length) {
      dispatch(fetchCoursesRequest()); // Dispatch only if courses are missing
    }
  }, [dispatch, updateStatus.length]);
  

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
