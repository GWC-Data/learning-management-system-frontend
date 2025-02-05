import React from "react";

const Dashboard: React.FC = () => {
  return (
    <>
      <div className="dashboard m-10">
        <h2 className="text-2xl font-bold mb-12">
          Welcome to the LMS Dashboard!
        </h2>

        {/* Grid of cards with hover effect */}
        <div className="grid grid-cols-3 gap-4">
          {/* Card 1: Total Courses */}
          <div className="bg-blue-100 p-4 rounded-lg shadow-md w-[400px] transform transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-xl hover:bg-blue-200 hover:translate-y-2">
            <h3 className="font-medium">Total Courses</h3>
            <p className="text-xl">50</p>
          </div>

          {/* Card 2: Total Trainers */}
          <div className="bg-green-100 p-4 rounded-lg shadow-md w-[400px] transform transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-xl hover:bg-green-200 hover:translate-y-2">
            <h3 className="font-medium">Total Trainers</h3>
            <p className="text-xl">25</p>
          </div>

          {/* Card 3: Total Trainees */}
          <div className="bg-yellow-100 p-4 rounded-lg shadow-md w-[400px] transform transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-xl hover:bg-yellow-200 hover:translate-y-2">
            <h3 className="font-medium">Total Trainees</h3>
            <p className="text-xl">200</p>
          </div>
        </div>
      </div>

      {/* <TreeChart data={data} /> */}
    </>
  );
};

export default Dashboard;
