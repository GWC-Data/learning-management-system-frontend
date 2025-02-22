import React, { useState } from "react";

import MissedModules from "@/images/problem-solving.png"; // Completed course image
import Modules from "@/images/cubes.png";

import RemainingClasses from "@/images/hourglass.png";
import Attendance from "@/images/time-management.png";
import UpcomingEvents from "../UpcomingEvents/upcomingEvents";

const DashboardHeader: React.FC = () => {
  const [name, setName] = useState<string | null>(
    localStorage.getItem("userName")
  );

  return (
    <div className="grid grid-cols-1 mt-4 poppins-regular">
      <div className="bg-gray-700 p-6 text-white w-[1320px] h-[340px] rounded-lg ml-4 grid grid-cols-2 md:grid-cols-1">
        <div>
          <h1 className="text-4xl font-bold mb-5">Welcome back, Mr. {name}</h1>
          <p className="mb-4 text-xl">
            Track, manage, and forecast your platform performance
          </p>

          <div className="mt-10">
            <h2 className="text-lg font-semibold">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mt-4">
              {/* Completed Courses Section */}
              <OverviewCard
                imgSrc={Modules}
                title="Module Completed"
                value="2"
              />

              {/* Attedance Section */}
              <OverviewCard
                imgSrc={Attendance}
                title="Attendance"
                value="10 Days"
              />

              {/* Missed Modules */}
              <OverviewCard
                imgSrc={RemainingClasses}
                title="Remaining Classes"
                value="30 Classes"
              />


              {/* Remaining Classes */}
              <OverviewCard
                imgSrc={MissedModules}
                title="Missed Modules"
                value="10 Classes"
              />
            </div>
          </div>

          
        </div>
      </div>
      {/* <div>
        <UpcomingEvents/>
      </div> */}
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
