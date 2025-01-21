import React, { useState } from "react";
import Overview from "./overView";

// Define the type for the course prop
interface MainbarProps {
  course: {
    name: string;
    startDate: Date;
    endDate: Date;
    course: string;
  };
}


const Mainbar: React.FC<MainbarProps>= ({ course  }) => {
  const [activeTab, setActiveTab] = useState<string>("");
  
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <Overview />;
    }
  };

  return (
    <>
      <div>
        <main className="w-[790px] pb-[56.25%] h-0 relative">
          <iframe
            className="absolute top-0 left-0 w-[790px] h-[400px]"
            src="https://www.youtube.com/embed/RYDiDpW2VkM"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </main>

        <div className="flex flex-col-5 gap-4 ml-2">
        <div
          className={`font-semibold p-3 rounded-2xl border cursor-pointer transition-all ${
            activeTab === "overview"
              ? "bg-[#4e6db4] text-white"
              : "hover:bg-[#4e6db4] hover:text-white"
          }`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </div>
          <div className="font-semibold gap-2 p-3 rounded-xl border hover:bg-[#4e6db4] hover:text-white transition-all cursor-pointer"><span>Author</span></div>
          <div className="font-semibold gap-2 p-3 rounded-xl border hover:bg-[#4e6db4] hover:text-white transition-all cursor-pointer"><span>FAQ</span></div>
          <div className="font-semibold gap-2 p-3 rounded-xl border hover:bg-[#4e6db4] hover:text-white transition-all cursor-pointer"><span>Announcements</span></div>
          <div className="font-semibold gap-2 p-3 rounded-xl border hover:bg-[#4e6db4] hover:text-white transition-all cursor-pointer"><span>Reviews</span></div>
        </div>

        {/* Dynamic Content */}
      <div className="mb-6">{renderContent()}</div>
      </div>
    </>
  );
};

export default Mainbar;
