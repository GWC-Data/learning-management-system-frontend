import React from 'react';
import { Link } from 'react-router-dom';
import { Course } from '../types';

interface CourseListProps {
  categoryName: string;
  courses: Course[];
}

const CourseList: React.FC<CourseListProps> = ({ categoryName, courses }) => (

  <div className="px-6 py-8">
    <div className="bg-gradient-to-r from-rose-200 to-pink-300 p-4 w-72 text-center mb-10 rounded-lg shadow-lg mx-auto border-t-4 border-rose-400 hover:border-rose-800">
        <h2 className="text-xl font-extrabold text-gray-900 tracking-wide uppercase">{categoryName}</h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <div
          key={course.id}
          className="relative bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer w-96"
        >
          <Link to={`/trainee/course/${course.id}`} className="w-full h-full">
            {/* Image Container */}
            <div className="flex items-center justify-center mt-10">
              <img
                src={course.image}
                alt={course.name}
                className="object-cover w-48 h-48"  // Ensure the image covers the entire space
              />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800">{course.name}</h3>
              <p className="text-gray-600 mt-2 text-sm line-clamp-3">{course.details}</p>
            </div>
          </Link>
          <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold rounded-full px-3 py-1">
            {course.name}
          </div>
        </div>
      ))}

    
    </div>
  </div>
);

export default CourseList;
