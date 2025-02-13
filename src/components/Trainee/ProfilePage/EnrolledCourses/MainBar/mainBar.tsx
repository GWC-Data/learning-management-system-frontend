const Mainbar: React.FC<{ selectedClass: any }> = ({ selectedClass }) => {

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
  
    let videoId = "";
    const youtubeRegex =
      /(?:youtube\.com\/(?:[^/]+\/[^/]+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?/ ]{11})/;
  
    const match = url.match(youtubeRegex);
    if (match && match[1]) {
      videoId = match[1];
    }
  
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  };
  

  
  return (
    <div className="flex flex-col items-center gap-6">
      {selectedClass ? (
        <div className="p-4 w-[790px] bg-gray-200 rounded-sm shadow-md">
          <h4 className="text-2xl font-bold">{selectedClass.classTitle}</h4>
          <p className="text-lg text-gray-700">{selectedClass.classDescription}</p>
        </div>
      ) : (
        <div className="p-4 w-[790px] bg-gray-200 rounded-sm shadow-md">
          <p className="text-lg text-gray-500">Select a class to play the video</p>
        </div>
      )}

      <main className="w-[790px] pb-[56.25%] h-0 relative">
        {selectedClass?.classRecordedLink ? (
          <iframe
            className="absolute top-0 left-0 w-[790px] h-[400px]"
            src={getEmbedUrl(selectedClass?.classRecordedLink)} 
    
            title="Recorded Lecture"
            allowFullScreen
          />
        ) : (
          <div className="flex items-center justify-center w-[790px] h-[400px] text-lg text-gray-500">
            Select a class to play the video
          </div>
        )}
      </main>
    </div>
  );
};

export default Mainbar;
