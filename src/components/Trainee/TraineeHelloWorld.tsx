import React from "react";
import CourseList from "./CourseList/courseList";
import data from "./data.json";
import { Route, Routes} from "react-router-dom";
import Banner from "./Banner";

interface TraineeProbs {
  isAuthenticated: boolean;
}

const TraineeHelloWorld: React.FC<TraineeProbs> = () => {

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-200">

      {/* Banner Section */}
      <Banner />
      {/* Welcome Text */}
      <h1 className="text-5xl font-extrabold text-blue-600 mt-10 mb-4">
        Welcome to our LMS
      </h1>
      <p className="text-xl text-gray-700 mb-8">Use our course experience</p>
      
        {data.categories.map((category) => (
          <CourseList
            key={category.id}
            categoryName={category.name}
            courses={category.courses}
          />
        ))}
      
    </div>
  );
};

export default TraineeHelloWorld;
