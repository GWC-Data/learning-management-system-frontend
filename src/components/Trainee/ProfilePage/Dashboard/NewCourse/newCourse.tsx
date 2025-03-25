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
    <div className="bg-[#EADCF1] p-6 rounded-lg shadow-lg ml-40 max-w-5xl h-[610px] flex flex-col -mt-8">
      {/* Lavender Mist */}
      <h2 className="text-2xl font-bold mb-4 text-gray-800">New Courses</h2>
      <p className="mb-6 text-gray-600 text-lg">
        Learn our course from scratch and become a pro in just two months. No
        prior experience required!
      </p>
      <div
        className="bg-white p-4 rounded-xl shadow-lg flex flex-col overflow-y-auto h-[450px] space-y-4 
        [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 
        [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 
        dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
      >
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <img src={Animation} alt="Loading..." className="w-16 h-16" />
          </div>
        ) : allcourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
            <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="text-lg font-medium">No courses available</div>
            <p className="text-sm text-center">Check back soon for new course offerings!</p>
          </div>
        ) : (
          allcourses.map((course: Course) => (
            <div
              key={course.id}
              className="bg-gray-50 p-5 rounded-lg shadow-md flex items-center gap-4 hover:bg-gray-100 transition duration-300 border-l-4 border-[#9B6FC9]"
            >
              {/* Course Details */}
              <div className="flex-grow pr-2">
                <h2 className="text-lg font-bold text-gray-800 mb-2">
                  {course.courseName}
                </h2>
                <p className="text-sm text-gray-600 line-clamp-2">{course.courseDesc}</p>
              </div>

              {/* Explore Button */}
              <div className="flex-shrink-0">
                <button
                  className="bg-[#F7C910] rounded-full p-3 shadow-md hover:bg-[#F7C915] hover:shadow-lg transition-all flex items-center justify-center w-12 h-12"
                  onClick={() => {
                    if (course.courseLink) {
                      window.open(course.courseLink, "_blank");
                    } else {
                      toast.error("Course link is not available.");
                    }
                  }}
                  aria-label={`Explore ${course.courseName}`}
                >
                  <img
                    src={RightArrow}
                    alt="Explore"
                    className="w-5 h-5 object-contain"
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