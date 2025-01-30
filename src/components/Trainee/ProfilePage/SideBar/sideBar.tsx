import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar: React.FC = () => {
  const location = useLocation();

  // Check if the current path matches the route
  const isActiveCourses = location.pathname.startsWith(
    "/trainee/enrolledCourses"
  );
  const isActiveDashboard = location.pathname === "/trainee/dashboard";

  const isActiveCalendarManagement =
    location.pathname === "/trainee/calendar-management";

  const isActiveJobBoards = location.pathname === "/trainee/job-boards";

  // const isActiveAssignmentManagement =
  //   location.pathname === "/trainee/course-assignments";

  // const isActiveCodeChallenge =
  //   location.pathname === "/trainee/code-challenges";

  return (
    <>
      <nav className="mt-3">
        <ul>
          <Link to="/trainee/dashboard">
            <div
              className={`flex flex-col-2 py-3 px-4 rounded-lg transition mb-5 gap-4 cursor-pointer ${
                isActiveDashboard
                  ? "bg-[#4e6db4] text-white"
                  : "bg-white hover:bg-[#4e6db497] hover:text-white text-slate-600"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill={isActiveDashboard ? "#fff" : "#B7B7B7"}
              >
                <path d="M520-600v-240h320v240H520ZM120-440v-400h320v400H120Zm400 320v-400h320v400H520Zm-400 0v-240h320v240H120Zm80-400h160v-240H200v240Zm400 320h160v-240H600v240Zm0-480h160v-80H600v80ZM200-200h160v-80H200v80Zm160-320Zm240-160Zm0 240ZM360-280Z" />
              </svg>
              <li>Dashboard</li>
            </div>
          </Link>

          <Link to="/trainee/enrolledCourses">
            <div
              className={`flex flex-col-2 py-3 px-4 rounded-lg transition mb-5 gap-4 cursor-pointer ${
                isActiveCourses
                  ? "bg-[#4d78b8] text-white"
                  : "bg-white hover:bg-[#7598D0] hover:text-white text-slate-600"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill={isActiveCourses ? "#fff" : "#B7B7B7"}
              >
                <path d="M640-400q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35ZM400-160v-76q0-21 10-40t28-30q45-27 95.5-40.5T640-360q56 0 106.5 13.5T842-306q18 11 28 30t10 40v76H400Zm86-80h308q-35-20-74-30t-80-10q-41 0-80 10t-74 30Zm154-240q17 0 28.5-11.5T680-520q0-17-11.5-28.5T640-560q-17 0-28.5 11.5T600-520q0 17 11.5 28.5T640-480Zm0-40Zm0 280ZM120-400v-80h320v80H120Zm0-320v-80h480v80H120Zm324 160H120v-80h360q-14 17-22.5 37T444-560Z" />
              </svg>
              <li>Enrolled Courses</li>
            </div>
          </Link>

          <Link to="/trainee/job-boards">
            <div
              className={`flex flex-col-2 py-3 px-4 rounded-lg transition mb-5 gap-4 cursor-pointer ${
                isActiveJobBoards
                  ? "bg-[#4d78b8] text-white"
                  : "bg-white hover:bg-[#7598D0] hover:text-white text-slate-600"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill={isActiveJobBoards ? "#fff" : "#B7B7B7"}
              >
                <path d="M160-120q-33 0-56.5-23.5T80-200v-440q0-33 23.5-56.5T160-720h160v-80q0-33 23.5-56.5T400-880h160q33 0 56.5 23.5T640-800v80h160q33 0 56.5 23.5T880-640v440q0 33-23.5 56.5T800-120H160Zm0-80h640v-440H160v440Zm240-520h160v-80H400v80ZM160-200v-440 440Z" />
              </svg>
              <li>Job Boards</li>
            </div>
          </Link>

          {/* <Link to="/trainee/code-challenges">
            <div
              className={`flex flex-col-2 py-3 px-4 rounded-lg transition mb-5 gap-4 cursor-pointer ${
                isActiveCodeChallenge
                  ? "bg-[#4d78b8] text-white"
                  : "bg-white hover:bg-[#7598D0] hover:text-white text-slate-600"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill={isActiveCodeChallenge ? "#fff" : "#B7B7B7"}
              >
                <path d="M280-120v-80h160v-124q-49-11-87.5-41.5T296-442q-75-9-125.5-65.5T120-640v-40q0-33 23.5-56.5T200-760h80v-80h400v80h80q33 0 56.5 23.5T840-680v40q0 76-50.5 132.5T664-442q-18 46-56.5 76.5T520-324v124h160v80H280Zm0-408v-152h-80v40q0 38 22 68.5t58 43.5Zm200 128q50 0 85-35t35-85v-240H360v240q0 50 35 85t85 35Zm200-128q36-13 58-43.5t22-68.5v-40h-80v152Zm-200-52Z" />
              </svg>
              <li>Code Challenges</li>
            </div>
          </Link> */}

          <Link to="/trainee/calendar-management">
            <div
              className={`flex flex-col-2 py-3 px-4 rounded-lg transition mb-5 gap-4 cursor-pointer ${
                isActiveCalendarManagement
                  ? "bg-[#4d78b8] text-white"
                  : "bg-white hover:bg-[#7598D0] hover:text-white text-slate-600"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill={isActiveCalendarManagement ? "#fff" : "#B7B7B7"}
              >
                <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-160 0q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm320 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-160 0q-17 0-28.5-11.5T280-280q0-17 11.5-28.5T320-320q17 0 28.5 11.5T360-280q0 17-11.5 28.5T320-240Zm320 0q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z" />
              </svg>

              <li>Calendar Management</li>
            </div>
          </Link>

          {/* <Link to="/trainee/course-assignments">
            <div
              className={`flex flex-col-2 py-3 px-4 rounded-lg transition mb-5 gap-4 cursor-pointer ${
                isActiveAssignmentManagement
                  ? "bg-[#4d78b8] text-white"
                  : "bg-white hover:bg-[#7598D0] hover:text-white text-slate-600"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill={isActiveAssignmentManagement ? "#fff" : "#B7B7B7"}
              >
                <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h168q13-36 43.5-58t68.5-22q38 0 68.5 22t43.5 58h168q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm80-80h280v-80H280v80Zm0-160h400v-80H280v80Zm0-160h400v-80H280v80Zm200-190q13 0 21.5-8.5T510-820q0-13-8.5-21.5T480-850q-13 0-21.5 8.5T450-820q0 13 8.5 21.5T480-790ZM200-200v-560 560Z" />
              </svg>
              <li>Course Assignments</li>
            </div>
          </Link> */}
        </ul>
      </nav>
    </>
  );
};

export default Sidebar;
