import React from "react";

// Define the type for the course prop
interface CourseHeaderProps {
  course: {
    batchName: string;
    startDate: Date;
    endDate: Date;
    course: string;
    courseId: number;
    courseImg: string;
    courseLink: string;
  };
}

const CourseHeader: React.FC<CourseHeaderProps> = ({ course }) => {
  return (
    <>
      <div className="w-full bg-white p-4 h-40 rounded-lg">
        <div className="flex flex-row items-center space-x-4">
          {/* Course Image */}
          <img
            src={course.courseImg}
            alt="Course Image"
            className="w-20 h-20 rounded-lg object-cover"
          />

          {/* Batch Name */}
          <h1 className="text-2xl font-semibold text-gray-800">
            {course.batchName}
          </h1>

          {/* Course Info */}
          <div className="ml-5 border border-stone-300 rounded-2xl p-2 bg-gray-50">
            <p className="text-sm text-gray-600">{course.course}</p>
          </div>
        </div>

        <div className="ml-8 flex flex-row gap-2 mt-3">
          <div className="flex flex-row mr-4 gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#8ce1bc"
            >
              <path d="m380-300 280-180-280-180v360ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
            </svg>
            <p>38 Lessons</p>
          </div>

          <div className="flex flex-row gap-1 mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#8ce1bc"
            >
              <path d="m612-292 56-56-148-148v-184h-80v216l172 172ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Z" />
            </svg>
            <p>4h 30min</p>
          </div>

          <div className="flex flex-row gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#8ce1bc"
            >
              <path d="m354-287 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM233-120l65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-350Z" />
            </svg>
            <p>4.5(126 reviews)</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseHeader;
