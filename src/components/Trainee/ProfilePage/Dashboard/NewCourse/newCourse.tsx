import React from "react";
import Animation from "../../../../../images/animated_8.gif";
import RightArrow from "../../../../../icons/right_arrow_2.png";
import { useSelector } from "react-redux";
import { toast } from "sonner";

// Define Course Type
interface Course {
  id: number;
  courseName: string;
  courseDesc: string;
  courseLink: string;
}

const NewCourse: React.FC = () => {
  // Use Type in useSelector
  const allcourses = useSelector(
    (state: { course: { courses: Course[] } }) => state.course.courses
  );
  const loading = useSelector(
    (state: { course: { loading: boolean } }) => state.course.loading
  );

  return (
    <div className="bg-[#EADCF1] p-6 rounded-lg shadow-lg ml-40 max-w-5xl h-[500px] flex flex-col -mt-8">
      {/* Lavender Mist */}
      <h2 className="text-2xl font-bold mb-4 text-gray-800">New Courses</h2>
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
          // Use Type for `course` to fix error
          allcourses.map((course: Course) => (
            <div
              key={course.id}
              className="bg-gray-50 p-4 rounded-lg shadow-md flex items-center gap-4 hover:bg-gray-100 transition duration-300"
            >
              {/* Course Details */}
              <div className="flex-grow w-20">
                <h2 className="text-lg font-bold text-gray-800 mb-1">
                  {course.courseName}
                </h2>
                <p className="text-sm text-gray-600">{course.courseDesc}</p>
              </div>

              {/* Explore Button */}
              <div>
                <button
                  className="bg-[#F7C910] rounded-full p-3 shadow hover:bg-[#F7C915] transition-all"
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
