import React, { useEffect, useState } from "react";
import Animation from "../../../../../images/animated_8.gif";
import RightArrow from "../../../../../icons/right_arrow_2.png";
import { toast } from "react-toastify"; // Assuming you're using react-toastify for error handling
import { fetchCourseApi } from "@/api/courseApi";

const NewCourse: React.FC = () => {
  const [allcourses, setallCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const newCoursesData = async () => {
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    if (!token || userId === null) {
      toast.error("You must be logged in to view all courses.");
      return;
    }

    try {
      const allCourses = await fetchCourseApi();
      console.log("allCourses", allCourses);
      setallCourses(allCourses);
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("Error fetching courses.");
      setLoading(false);
    }
  };

  useEffect(() => {
    newCoursesData();
  }, []);

  return (
    <div className="bg-gradient-to-r from-green-200 to-blue-200 p-6 rounded-lg shadow-lg ml-40 max-w-5xl h-[500px] flex flex-col -mt-8">
      <h2 className="text-xl font-bold mb-4 text-gray-800">New Courses</h2>
      <p className="mb-6 text-gray-600">
        Learn our course from scratch and become a pro in just two months. No
        prior experience required!
      </p>
      <div
        className="bg-white p-4 rounded-xl shadow-lg flex flex-col overflow-y-auto h-[350px] space-y-4 
        [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 
        [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 
        dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
      >
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <img src={Animation} alt="Loading..." className="w-16 h-16" />
          </div>
        ) : allcourses.length === 0 ? (
          <div className="text-gray-500 text-center">No courses available.</div>
        ) : (
          allcourses.map((course) => (
            <div
              key={course.id}
              className="bg-gray-50 p-4 rounded-lg shadow-md flex items-center gap-4 hover:bg-gray-100 transition duration-300"
            >
              {/* Course Details */}
              <div className="flex-grow w-20">
                <img src={course.courseImg} alt="courseImg" className="w-8 h-8"/>
                <h2 className="text-lg font-bold text-gray-800 mb-1">
                  {course.courseName}
                </h2>
                <p className="text-sm text-gray-600">{course.courseDesc}</p>
              </div>

              {/* Explore Button */}
              <div>
                <button
                  className="bg-[#4d78b8] rounded-full p-3 shadow hover:bg-[#3b5e8f] transition-all"
                  onClick={() => {
                    if (course.courseLink) {
                      window.open(course.courseLink, "_blank"); // Open the link in a new tab
                    } else {
                      toast.error("Course link is not available."); // Show error if no link
                    }
                  }}
                >
                  <img
                    src={RightArrow}
                    alt="Explore Icon"
                    className="w-6 h-6"
                  />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NewCourse;
