import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./ProfilePage/SideBar/sideBar";

interface TraineeProb {
  isAuthenticated: boolean;
}

const TraineeHome: React.FC<TraineeProb> = () => {
  const location = useLocation();

  // Check if the current route is "settings"
  const isSettingsPage = location.pathname.includes("/settings");

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex flex-1">
        {/* Sidebar only if not on settings page */}
        {!isSettingsPage && (
          <aside className="w-[320px] bg-[#ffff] p-4 font-semibold shadow-2xl">
            <Sidebar />
          </aside>
        )}

        {/* Main Content Area */}
        <main
          className={`flex-1 ${isSettingsPage ? "p-8 bg-[#d5afe3]" : "p-4"}`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TraineeHome;
