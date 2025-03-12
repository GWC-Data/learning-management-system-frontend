import React, { useState } from "react";
import {
  Users,
  Shield,
  ChevronDown,
  ChevronUp,
  Layers,
  Key,
  Book,
  MountainSnow,
  Sheet
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Sidebar: React.FC = () => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMasterDataOpen, setIsMasterDataOpen] = useState(false);
  const location = useLocation(); // To determine the current active route
  const isActiveUsers = location.pathname.startsWith(
    "/admin/allUsers"
  );
  // const isActiveCourse = location.pathname.startsWith(
  //   "/admin/course"
  // );

  return (
    <div className="flex h-full min-h-0 text-gray-700">
      <div className="flex flex-col w-80 bg-[#FFFF] shadow-lg overflow-y-auto">
        <nav className="flex-1 p-4 space-y-2">
          {/* Admin Section */}
          <div>
            <button
              onClick={() => setIsAdminOpen(!isAdminOpen)}
              className={`relative flex items-center w-full p-3 text-sm font-metropolis rounded-md transition-all duration-300 ${isAdminOpen
                ? "bg-gray-300 text-gray-800"
                : "bg-gray-100 text-gray-800"
                } hover:bg-gray-100 hover:shadow-md`}
            >
              <div
                className={`mr-3 text-[#6e2b8b] transition-transform duration-300 ${isAdminOpen ? "rotate-12 scale-110" : ""
                  }`}
              >
                <Shield />
              </div>
              <span className="flex-1 text-lg font-semibold">Admin</span>
              <div
                className={`ml-auto transform transition-transform duration-300 ${isAdminOpen ? "rotate-180 text-[#6e2b8b]" : ""
                  }`}
              >
                {isAdminOpen ? <ChevronUp /> : <ChevronDown />}
              </div>
            </button>

            {isAdminOpen && (
              <div className="space-y-2 mt-2 mr-7 ml-7">
                <SidebarButton
                  icon={<Users />}
                  label="Users"
                  to="/admin/allUsers"
                  isActive={isActiveUsers}
                />
                {/* <SidebarButton
                  icon={<Activity />}
                  label="Trainers Activity"
                  to="/admin/trainers-activity"
                  isActive={location.pathname === "/admin/trainers-activity"}
                />

                <SidebarButton
                  icon={<Activity />}
                  label="Trainees Activity"
                  to="/admin/trainees-activity"
                  isActive={location.pathname === "/admin/trainees-activity"}
                /> */}

                <SidebarButton
                  icon={<Key />}
                  label="Manage Roles & Permissions"
                  to="/admin/manage-roles-and-permissions"
                  isActive={
                    location.pathname === "/admin/manage-roles-and-permissions"
                  }
                />

                <SidebarButton
                  icon={<Book />}
                  label="Course"
                  to="/admin/courses"
                  isActive={
                    location.pathname === "/admin/courses"
                  }
                />

                {/* <SidebarButton
                  icon={<File />}
                  label="Course Assignment"
                  to="/admin/course-assignment"
                  isActive={
                    location.pathname === "/admin/course-assignment"
                  }
                /> */}
              </div>
            )}
          </div>

          {/* Master Data Section */}
          <div>
            <button
              onClick={() => setIsMasterDataOpen(!isMasterDataOpen)}
              className={`relative flex items-center w-full p-3 text-sm font-metropolis rounded-md transition-all duration-300 ${isMasterDataOpen
                ? "bg-gray-300 text-gray-800"
                : "bg-gray-100 text-gray-800"
                } hover:bg-gray-100 hover:shadow-md`}
            >
              <div
                className={`mr-3 text-[#6e2b8b] transition-transform duration-300 ${isMasterDataOpen ? "rotate-12 scale-110" : ""
                  }`}
              >
                <Layers />
              </div>
              <span className="flex-1 text-lg font-semibold">Master Data</span>
              <div
                className={`ml-auto transform transition-transform duration-300 ${isMasterDataOpen ? "rotate-180 text-[#6e2b8b]" : ""
                  }`}
              >
                {isMasterDataOpen ? <ChevronUp /> : <ChevronDown />}
              </div>
            </button>

            {isMasterDataOpen && (
              <div className="space-y-2 mt-2 mr-7 ml-7">
                <SidebarButton
                  icon={<Layers />}
                  label="Course Category"
                  to="/admin/course-category"
                  isActive={location.pathname === "/admin/course-category"}
                />

                {/* <SidebarButton
                  icon={<BookOpen />}
                  label="Course Module"
                  to="/admin/course-module"
                  isActive={location.pathname === "/admin/course-module"}
                /> */}

                <SidebarButton
                  icon={<MountainSnow />}
                  label="Permissions"
                  to="/admin/manage-permissions"
                  isActive={location.pathname === "/admin/manage-permissions"}
                />

                <SidebarButton
                  icon={<Sheet />}
                  label="Attendance"
                  to="/admin/attendance"
                  isActive={location.pathname === "/admin/attendance"}
                />
{/* 
                <SidebarButton
                  icon={<ClipboardList />}
                  label="Batch Management"
                  to="/admin/batch-management"
                  isActive={location.pathname === "/admin/batch-management"}
                /> */}

               {/* <SidebarButton
                  icon={<Calendar />} // You can replace this with a different icon
                  label="Batch Module Schedules"
                  to="/admin/manage-batch-schedules"
                  isActive={location.pathname === "/admin/manage-batch-schedules"}
                />  */}
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
};

type SidebarButtonProps = {
  icon: React.ReactNode;
  label: string;
  to: string;
  isActive?: boolean;
};

const SidebarButton: React.FC<SidebarButtonProps> = ({
  icon,
  label,
  to,
  isActive,
}) => (
  <Link
    to={to}
    className={`group flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${isActive
      ? "bg-[#6e2b8b] text-[#475569] shadow-md"
      : "hover:bg-[#d5afe3]"
      }`}
  >    
    <div
      className={`text-xl flex items-center justify-center rounded-md p-2 ${isActive
        ? "bg-[#6e2b8b] text-white"
        : "bg-[#eadcf1] text-[#6e2b8b]"
        }`}
    >
      {icon}
    </div>
    <span
      className={`text-sm font-medium transition-colors duration-300 ${isActive ? "text-white" : "text-gray-800 group-hover:text-black"
        }`}
    >
      {label}
    </span>
  </Link>
);

export default Sidebar;
