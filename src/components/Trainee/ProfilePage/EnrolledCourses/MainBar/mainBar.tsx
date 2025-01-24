import React from "react";

// Define the type for the course prop
interface MainbarProps {
  course: {
    name: string;
    startDate: Date;
    endDate: Date;
    course: string;
  };
}

const Mainbar: React.FC<MainbarProps> = ({ course }) => {
  return (
    <>
      <div style={{ height: "200px" }}>
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
      </div>
    </>
  );
};

export default Mainbar;
