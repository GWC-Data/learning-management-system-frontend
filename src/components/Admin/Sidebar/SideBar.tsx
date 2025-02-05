import React, { useState } from "react";
import {
  Users,
  Grid,
  Shield,
  ChevronDown,
  ChevronUp,
  Layers,
  Key,
  MountainSnow,
  ClipboardList,
  BookOpen,
  Calendar,
  File,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Sidebar: React.FC = () => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMasterDataOpen, setIsMasterDataOpen] = useState(false);
  const location = useLocation(); // To determine the current active route
  const isActiveUsers = location.pathname.startsWith("/admin/allUsers");

  return (
    <div className="flex h-full min-h-0 text-gray-700">
      <div className="flex flex-col w-80 bg-green-200 shadow-lg overflow-y-auto">
        <nav className="flex-1 p-4 space-y-2">
          {/* Admin Section */}
          <div>
            <button
              onClick={() => setIsAdminOpen(!isAdminOpen)}
              className={`relative flex items-center w-full p-3 text-sm font-metropolis rounded-md transition-all duration-300 border-b-2 border-gray-200 ${
                isAdminOpen
                  ? "bg-gray-300 text-gray-800"
                  : "bg-gray-100 text-gray-800"
              } hover:bg-gray-100 hover:shadow-md`}
            >
              <div
                className={`mr-3 text-blue-500 transition-transform duration-300 ${
                  isAdminOpen ? "rotate-12 scale-110" : ""
                }`}
              >
                <Shield />
              </div>
              <span className="flex-1 text-lg font-semibold">Admin</span>
              <div
                className={`ml-auto transform transition-transform duration-300 ${
                  isAdminOpen ? "rotate-180 text-blue-400" : "text-gray-500"
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

                <SidebarButton
                  icon={<Grid />}
                  label="Courses"
                  to="/admin/courses"
                  isActive={location.pathname === "/admin/courses"}
                />

                <SidebarButton
                  icon={<Key />}
                  label="Manage Roles & Permissions"
                  to="/admin/manage-roles-and-permissions"
                  isActive={
                    location.pathname === "/admin/manage-roles-and-permissions"
                  }
                />
                <SidebarButton
                  icon={<File />}
                  label="Course Assignment"
                  to="/admin/file-uploader"
                  isActive={location.pathname === "/admin/file-uploader"}
                />

                <SidebarButton
                  icon={<File />}
                  label="Excel File Uploader"
                  to="/admin/excel-file-uploader"
                  isActive={location.pathname === "/admin/excel-file-uploader"}
                />
              </div>
            )}
          </div>

          {/* Master Data Section */}
          <div>
            <button
              onClick={() => setIsMasterDataOpen(!isMasterDataOpen)}
              className={`relative flex items-center w-full p-3 text-sm font-metropolis rounded-md transition-all duration-300 border-b-2 border-gray-200 ${
                isMasterDataOpen
                  ? "bg-gray-300 text-gray-800"
                  : "bg-gray-100 text-gray-800"
              } hover:bg-gray-100 hover:shadow-md`}
            >
              <div
                className={`mr-3 text-blue-500 transition-transform duration-300 ${
                  isMasterDataOpen ? "rotate-12 scale-110" : ""
                }`}
              >
                <Layers />
              </div>
              <span className="flex-1 text-lg font-semibold">Master Data</span>
              <div
                className={`ml-auto transform transition-transform duration-300 ${
                  isMasterDataOpen
                    ? "rotate-180 text-blue-400"
                    : "text-gray-500"
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

                <SidebarButton
                  icon={<BookOpen />}
                  label="Course Module"
                  to="/admin/course-module"
                  isActive={location.pathname === "/admin/course-module"}
                />

                <SidebarButton
                  icon={<MountainSnow />}
                  label="Permissions"
                  to="/admin/manage-permissions"
                  isActive={location.pathname === "/admin/manage-permissions"}
                />

                <SidebarButton
                  icon={<ClipboardList />}
                  label="Batch Management"
                  to="/admin/batch-management"
                  isActive={location.pathname === "/admin/batch-management"}
                />

                <SidebarButton
                  icon={<Calendar />} // You can replace this with a different icon
                  label="Batch Module Schedules"
                  to="/admin/manage-batch-schedules"
                  isActive={
                    location.pathname === "/admin/manage-batch-schedules"
                  }
                />
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
    className={`group flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
      isActive
        ? "bg-custom-gradient text-white shadow-md"
        : "bg-white hover:bg-gray-100 border border-gray-200"
    }`}
  >
    <div
      className={`text-xl flex items-center justify-center rounded-md p-2 ${
        isActive
          ? "bg-white text-blue-500"
          : "bg-blue-100 text-blue-400 group-hover:bg-blue-200"
      }`}
    >
      {icon}
    </div>
    <span
      className={`text-sm font-medium transition-colors duration-300 ${
        isActive ? "text-white" : "text-gray-800 group-hover:text-blue-500"
      }`}
    >
      {label}
    </span>
  </Link>
);

export default Sidebar;
