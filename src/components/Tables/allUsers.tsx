import React from "react";
import { UserCheck, Users, DollarSign, Shield, PlusCircle } from "lucide-react";
import { useNavigate, Outlet } from "react-router-dom";

type SidebarButtonProps = {
  icon: React.ReactNode;
  label: string;
  to: string;
  onClick: () => void;
  gradient: string;
};

const SidebarButton: React.FC<SidebarButtonProps> = ({
  icon,
  label,
  onClick,
  gradient,
}) => (
  <button
    onClick={onClick}
    className={`relative flex items-center w-[280px] h-[100px] px-4 py-2 text-white font-medium ${gradient} hover:opacity-90 rounded-lg shadow-md transition-transform duration-300 transform hover:scale-105 overflow-hidden group`}
  >
    {/* White Circle Animation */}
    <div className="absolute inset-0 flex justify-center items-center">
      <div className="w-0 h-0 bg-white rounded-full opacity-20 scale-0 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
    </div>
    {/* Content */}
    <div className="z-10 flex items-center mr-3">{icon}</div>
    <span className="z-10">{label}</span>
  </button>
);


const AllUsers: React.FC = () => {
  const navigate = useNavigate(); // Initialize navigate

  const handleButtonClick = (route: string) => {
    navigate(route); // Navigate to the specified route
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      {/* Header Section */}
      <div className="flex justify-between items-center w-full max-w-[1150px] mb-4">
        <h1 className="text-2xl font-bold text-gray-800">User Roles</h1>
        <button
          className="flex items-center px-4 py-2 bg-slate-500 text-white border-2 border-blue-900 hover:opacity-90 rounded-lg shadow-md transition duration-200"
          onClick={() => navigate("/allUsers/add-user")}
        >
          <PlusCircle className="mr-2" />
          <span>+ Add User</span>
        </button>
      </div>

      {/* User Role Buttons */}
      <div className="flex flex-col-4 p-2 gap-4">
        <SidebarButton
          icon={<Shield />}
          label="Admin"
          to="/allUsers/admin"
          gradient="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700"
          onClick={() => handleButtonClick("/allUsers/admin")}
        />
        <SidebarButton
          icon={<DollarSign />}
          label="Finance"
          to="/allUsers/finance"
          gradient="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"
          onClick={() => handleButtonClick("/allUsers/finance")}
        />
        <SidebarButton
          icon={<Users />}
          label="Trainers"
          to="/allUsers/trainers"
          gradient="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"
          onClick={() => handleButtonClick("/allUsers/trainers")}
        />
        <SidebarButton
          icon={<UserCheck />}
          label="Trainees"
          to="/allUsers/trainees"
          gradient="bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600"
          onClick={() => handleButtonClick("/allUsers/trainees")}
        />
      </div>

      {/* Nested Routes Render Here */}
      <div className="mt-6 w-full">
        <Outlet />
      </div>
    </div>
  );
};

export default AllUsers;
