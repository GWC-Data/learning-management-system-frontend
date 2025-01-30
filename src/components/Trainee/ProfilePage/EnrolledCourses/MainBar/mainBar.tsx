import React from "react";

// Define the type for the props
interface MainbarProps {
  course: {
    name: string;
    startDate: Date;
    endDate: Date;
    course: string;
  };
  recordedLink: string | null; // Received recordedLink from parent
  selectedModuleDetails: { name: string; description: string } | null; // New prop for selected module details
}

const Mainbar: React.FC<MainbarProps> = ({
  course,
  recordedLink,
  selectedModuleDetails,
}) => {
  // Ensure the recordedLink is in embed format
  const getEmbedUrl = (url: string) => {
    if (url.includes("youtu.be/")) {
      const videoId = url.split("/")[3].split("?")[0]; // Extract video ID from the shortened YouTube URL
      return `https://www.youtube.com/embed/${videoId}`; // Return embed URL
    }
    return url; // If not a YouTube link, return the URL as is
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Display selected module details */}
      {selectedModuleDetails && (
        <div className="p-4 w-[790px] bg-gray-200 rounded-sm shadow-md">
          <h4 className="text-2xl font-bold">{selectedModuleDetails.name}</h4>
          <p className="text-lg text-gray-700">{selectedModuleDetails.description}</p>
        </div>
      )}

      <main className="w-[790px] pb-[56.25%] h-0 relative">
        {/* Conditionally render the iframe based on recordedLink */}
        {recordedLink ? (
          <iframe
            className="absolute top-0 left-0 w-[790px] h-[400px]"
            src={getEmbedUrl(recordedLink)} // Use the embed URL for YouTube
            title="Video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <div className="flex items-center justify-center w-[790px] h-[400px] text-lg text-gray-500 border-2 border-dashed border-gray-300 rounded-lg mt-20">
            Select a module to play the video
          </div>
        )}
      </main>
    </div>
  );
};

export default Mainbar;
