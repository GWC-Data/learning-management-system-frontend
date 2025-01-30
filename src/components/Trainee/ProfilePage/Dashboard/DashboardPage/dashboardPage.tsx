import React, { useEffect, useState } from "react";
import {useAppSelector } from "@/hooks/useAppSelector"; // Custom hooks to access redux dispatch and state
import { useAppDispatch } from "@/hooks/useAppDispatch"; // Custom hooks to access redux dispatch and state
import { fetchCoursesRequest } from "@/store/course/courseSlice"; // Redux action to fetch courses

import DashboardHeader from "../DashboardHeader/dashboardHeader";
import MyCourses from "../MyCourses/myCourses";
import NewCourses from "../NewCourse/newCourse";



const DashboardPage: React.FC = () => {

  const dispatch = useAppDispatch(); // Access dispatch
  const { courses, loading, error } = useAppSelector((state) => state.course); // Access courses, loading, and error from Redux state
  const [newCourses, setNewCourses] = useState<any[]>([]); // State for new courses

   // Log the courses, loading, and error whenever they change
   useEffect(() => {
    console.log("Courses Data:", courses); // Log the courses data
    console.log("Loading State:", loading); // Log the loading state
    console.log("Error State:", error); // Log any error state
  }, [courses, loading, error]); // Dependency array ensures this runs when any of the states change

  useEffect(() => {
    // Dispatch the action to fetch courses when the component mounts
    dispatch(fetchCoursesRequest());
  }, [dispatch]);
  
  useEffect(() => {
    // Here you can filter or modify the courses if you want to pass only new courses
    if (courses.length > 0) {
      // Assuming you have a condition to determine new courses (e.g., filter by some property)
      const filteredNewCourses = courses.filter(course => course.isNew); // Example condition for new courses
      setNewCourses(filteredNewCourses);
      console.log("Filtered New Courses:", filteredNewCourses); 
    }
  }, [courses]);

  return (
    <>
      {/* Header Section */}
      <DashboardHeader />

      {/* Grid Layout */}
      <div className="mt-10">
        <div className="grid grid-cols-2 gap-5 p-4">
          <MyCourses />
           {/* Pass the filtered new courses data to the NewCourse component */}
          <NewCourses courses={courses} loading={loading} error={error}/>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
