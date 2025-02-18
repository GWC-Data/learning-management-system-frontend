import React, { useEffect, useState } from "react";
import RightArrow from "../../../../../icons/right_arrow_2.png";

const animatePercentage = (target: number, duration: number) => {
  let start = 0;
  const step = (target - start) / (duration / 10);
  const interval = setInterval(() => {
    start += step;
    if (start >= target) {
      start = target;
      clearInterval(interval);
    }
    document.getElementById("percentage-value")!.innerText = `${Math.round(
      start
    )}%`;
  }, 10);
};

const Homework: React.FC = () => {
  const [percentage, setPercentage] = useState<number>(88);

  const assignments = [
    { id: 1, title: "Assignment 1", dueDate: "10th January 2025" },
    { id: 2, title: "Assignment 2", dueDate: "15th January 2025" },
  ];

  const classes = [
    { id: 1, subject: "React", time: "10:00 AM - 11:00 AM", trainer: "Siddarth" },
    { id: 2, subject: "Figma", time: "12:00 PM - 1:00 PM", trainer: "Siva" },
  ];

  useEffect(() => {
    animatePercentage(percentage, 1000);
  }, [percentage]);

  return (
    <div className="bg-gradient-to-r from-green-200 to-blue-200 p-6 rounded-lg shadow-lg max-w-[1300px] ml-3">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>

      {/* Homework Progress Section */}
      <div className="flex flex-col lg:flex-row items-center gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
          <div className="bg-[#4d78b8] rounded-full h-[120px] w-[120px] flex items-center justify-center">
            <p id="percentage-value" className="text-2xl font-bold text-white">
              0%
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold">Homework Progress</h3>
            <p>Track and complete your assignments on time.</p>
          </div>
        </div>

        {/* Assignment Section */}
        <div className="bg-white p-6 rounded-lg shadow-md flex-1">
          <h3 className="text-lg font-bold mb-4">Upcoming Assignments</h3>
          <ul className="space-y-3">
            {assignments.map((assignment) => (
              <li
                key={assignment.id}
                className="flex justify-between items-center bg-gray-100 p-3 rounded-lg shadow-sm"
              >
                <div>
                  <h4 className="text-md font-semibold">{assignment.title}</h4>
                  <p className="text-sm text-gray-600">
                    Due Date: {assignment.dueDate}
                  </p>
                </div>
                <button className="bg-[#4d78b8] rounded-full p-2">
                  <img src={RightArrow} alt="Explore Icon" className="w-6 h-6" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Upcoming Classes Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-4">Upcoming Classes</h3>
        <ul className="space-y-3">
          {classes.map((classItem) => (
            <li
              key={classItem.id}
              className="flex justify-between items-center bg-gray-100 p-3 rounded-lg shadow-sm"
            >
              <div>
                <h4 className="text-md font-semibold">{classItem.subject}</h4>
                <p className="text-sm text-gray-600">Time: {classItem.time}</p>
                <p className="text-sm text-gray-600">Trainer: {classItem.trainer}</p>
              </div>
              <button className="bg-[#4d78b8] rounded-full p-2">
                <img src={RightArrow} alt="Explore Icon" className="w-6 h-6" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Homework;
