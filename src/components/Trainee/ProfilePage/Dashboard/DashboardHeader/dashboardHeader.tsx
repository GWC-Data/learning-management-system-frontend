import React, { useState, useEffect } from "react";

import MissedModules from "@/images/problem-solving.png";
import Modules from "@/images/cubes.png";
import RemainingClasses from "@/images/hourglass.png";
import Attendance from "@/images/time-management.png";
import { getAttendanceByUserIdApi } from "@/helpers/api/attendance";

const DashboardHeader: React.FC = () => {
  const [name, setName] = useState<string | null>(
    localStorage.getItem("userName")
  );
  const [attendanceStatus, setAttendanceStatus] = useState<any[]>([]);

  const getUserId = () => localStorage.getItem("userId");

  useEffect(() => {
    const fetchAttendance = async () => {
      const userId = getUserId();
      if (userId) {
        try {
          const attendance = await getAttendanceByUserIdApi(userId);
          console.log("attendance", attendance);
          setAttendanceStatus(attendance);
        } catch (error) {
          console.error("Error fetching attendance:", error);
        }
      }
    };

    fetchAttendance();
  }, []);

  // Calculate class completion based on attendance data
  const calculateClassCompletion = () => {
    return attendanceStatus.length > 0
      ? `${attendanceStatus.length} Classes`
      : "Loading...";
  };

  // Calculate attendance percentage
  const calculateAttendancePercentage = () => {
    if (!attendanceStatus || attendanceStatus.length === 0) return "Loading...";

    const totalDays = attendanceStatus.length;
    const presentDays = attendanceStatus.reduce(
      (count, day) => count + (day.attendance ? 1 : 0),
      0
    );

    const percentage = ((presentDays / totalDays) * 100).toFixed(2);
    return `${percentage}%`;
  };

  // Calculate missed classes based on attendance data
  const calculateMissedClasses = () => {
    if (!attendanceStatus || attendanceStatus.length === 0) return "Loading...";

    const missedClasses = attendanceStatus.reduce(
      (count, day) => count + (!day.attendance ? 1 : 0),
      0
    );

    return `${missedClasses} Classes`;
  };

  return (
    <div className="grid grid-cols-1 mt-4 poppins-regular">
      <div className="bg-gray-700 p-6 text-white w-[1320px] h-[340px] rounded-lg ml-4 grid grid-cols-2 md:grid-cols-1">
        <div>
          <h1 className="text-4xl font-bold mb-5">Welcome back, {name}</h1>
          <p className="mb-4 text-xl">
            Track, manage, and forecast your platform performance
          </p>

          <div className="mt-10">
            <h2 className="text-lg font-semibold">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-4">
              <OverviewCard
                imgSrc={Modules}
                title="Class Completed"
                value={calculateClassCompletion()}
              />
              <OverviewCard
                imgSrc={Attendance}
                title="Attendance"
                value={calculateAttendancePercentage()}
              />
              {/* <OverviewCard
                imgSrc={RemainingClasses}
                title="Remaining Classes"
                value="30 Classes"
              /> */}
              <OverviewCard
                imgSrc={MissedModules}
                title="Missed Classes"
                value={calculateMissedClasses()}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OverviewCard: React.FC<{
  imgSrc: string;
  title: string;
  value: string;
}> = ({ imgSrc, title, value }) => (
  <div className="grid grid-cols-2 items-center border border-gray-300 bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
    <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full hover:bg-gray-200 hover:text-white transition-colors duration-300">
      <img src={imgSrc} alt={title} className="w-10 h-10" />
    </div>
    <div className="-ml-5">
      <h3 className="font-semibold text-gray-800">{title}</h3>
      <p className=" font-bold text-[#4d78b8]">{value}</p>
    </div>
  </div>
);

export default DashboardHeader;