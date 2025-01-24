import React, { useEffect, useState } from "react";
import { UserCheck, Users, DollarSign, Shield, PlusCircle } from "lucide-react";
import { useNavigate, Outlet } from "react-router-dom";
import { fetchRolesApi } from "@/api/roleApi";

type Role = {
  name: string;
};

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
    className={`relative flex items-center w-[280px] h-[100px] px-4 py-2 text-slate-600 font-semibold ${gradient} hover:opacity-90 rounded-lg shadow-md transition-transform duration-300 transform hover:scale-105 overflow-hidden group`}
  >
    <div className="absolute inset-0 flex justify-center items-center">
      <div className="w-0 h-0 bg-white rounded-full opacity-20 scale-0 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
    </div>
    <div className="z-10 flex items-center mr-3">{icon}</div>
    <span className="z-10">{label}</span>
  </button>
);

const AllUsers: React.FC = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);

  const getToken = () => localStorage.getItem("authToken");

  const fetchRoles = async () => {
    const token = getToken();
    if (!token) {
      console.error("No token found. User must be logged in.");
      return;
    }

    try {
      const roleResponse = await fetchRolesApi();
      console.log("roleResp", roleResponse);

      if (Array.isArray(roleResponse)) {
        const roleNames = roleResponse.map((role: { name: string }) => ({
          name: role.name,
        }));
        setRoles(roleNames);
      } else {
        console.error("Unexpected response structure:", roleResponse);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const generateColorGradient = (index: number) => {
    const colors = [
      ["from-teal-200", "via-teal-300", "to-teal-400"], // Soft teal
      ["from-sky-200", "via-sky-300", "to-sky-400"], // Light blue
      ["from-purple-200", "via-purple-300", "to-purple-400"], // Soft purple
      ["from-amber-200", "via-amber-300", "to-amber-400"], // Light yellow-orange
      ["from-lime-200", "via-lime-300", "to-lime-400"], // Fresh lime green
      ["from-cyan-200", "via-cyan-300", "to-cyan-400"], // Bright cyan
      ["from-indigo-200", "via-indigo-300", "to-indigo-400"], // Light indigo
    ];
    const colorSet = colors[index % colors.length];
    return `bg-gradient-to-r ${colorSet.join(" ")}`;
  };
  

  const roleIcons: Record<string, JSX.Element> = {
    Admin: <Shield />,
    Sales: <DollarSign />,
    Trainer: <Users />,
    Trainee: <UserCheck />,
  };

  return (
    <div className="p-4 flex flex-col items-center">
      <div className="flex justify-between items-center w-full max-w-[1170px] mb-4 mt-10">
        <h1 className="text-2xl font-bold text-gray-600">User Roles</h1>
        <button
          className="flex items-center px-4 py-2 text-white border-2 font-metropolis font-semibold bg-[#4e6db4] hover:opacity-90 rounded-lg shadow-md transition duration-200"
          onClick={() => navigate("/admin/allUsers/add-user")}
        >
          <PlusCircle className="mr-2" />
          <span> Add User</span>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 font-metropolis font-semibold">
        {roles.map((role, index) => (
          <SidebarButton
            key={role.name}
            icon={roleIcons[role.name]}
            label={role.name}
            to={`/allUsers/${role.name.toLowerCase()}`}
            gradient={generateColorGradient(index)}
            onClick={() =>
              navigate(`/admin/allUsers/${role.name.toLowerCase()}`)
            }
          />
        ))}
      </div>

      <div className="mt-6 w-full">
        <Outlet />
      </div>
    </div>
  );
};

export default AllUsers;
