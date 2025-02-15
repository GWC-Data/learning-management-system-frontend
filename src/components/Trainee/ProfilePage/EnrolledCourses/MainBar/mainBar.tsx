import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaFileDownload } from "react-icons/fa";
import { useEffect, useState } from "react";
import { createAssignmentCompletionsApi } from "@/helpers/api/assignmentCompletionsApi";
import { useLocation } from 'react-router-dom';
import { fetchClassForModuleByIdApi } from "@/helpers/api/classForModuleApi";

const Mainbar: React.FC<{ selectedClass: any }> = ({ selectedClass }) => {
  const [classData, setClassData] = useState<any>(null);

  const location = useLocation();
  console.log('Current Route:', location.pathname + location.hash);
  const match = (location.pathname + location.hash).match(/classId=([0-9]+)/);
  console.log(match,'mathc')
  const classId = match ? match[1] : null;
  console.log('Class ID:', classId);

  useEffect(() => {
    const fetchData = async () => {
      if (classId) {
        try {
          const data = await fetchClassForModuleByIdApi(Number(classId));
          setClassData(data);
          console.log('Fetched Class Data:', data);
        } catch (error) {
          console.error('Error fetching class data:', error);
        }
      }
    };

    fetchData();
  }, [classId]);


  const userId = Number(localStorage.getItem("userId"));
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [isUploadDisabled, setIsUploadDisabled] = useState(false);

  console.log(selectedClass, "selectedClass");
  // console.log(selectedClass.materialForClass,'selectedClass')


  useEffect(() => {
    if (classData && classData.courseAssignments) {
      const endDate = new Date(classData.courseAssignments.assignEndDate);
      const currentDate = new Date();
      if (currentDate >= endDate) {
        setIsUploadDisabled(true);
      }
    }
  }, [classData]);

  const handleFileChange = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert("Please select a file to upload.");
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);

    reader.onloadend = async () => {
      const base64String = reader.result?.toString().split(",")[1];
      const payload = {
        traineeId: userId,
        courseAssignId: parseInt(
          selectedClass.courseAssignments.assignmentId,
          10
        ),
        courseAssignmentAnswerFile: base64String,
        obtainedMarks: 0,
      };
      try {
        await createAssignmentCompletionsApi(payload);
        alert("File uploaded successfully!");
        setSelectedFile(null);
        setFileName("");
      } catch (error) {
        console.error("Upload failed", error);
      }
    };
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    const youtubeRegex =
      /(?:youtube\.com\/(?:[^/]+\/[^/]+\/|(?:v|embed|e)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?/ ]{11})/;
    const match = url.match(youtubeRegex);
    return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : "";
  };

  return (
    <>
      {classData ? (
        <>
          <div className="flex flex-col items-center min-h-screen p-6">
            <div className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800">
                  {classData.classTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {classData.classDescription}
                </p>
                <iframe
                  className="w-[640px] h-[400px] rounded-xl shadow-sm border-2 border-gray-200"
                  src={getEmbedUrl(classData?.classRecordedLink)}
                  title="Recorded Lecture"
                  allowFullScreen
                />
              </CardContent>
            </div>

            {classData.materialForClass && (
              <Card className="w-full max-w-2xl shadow-sm mt-8 p-8 bg-white rounded-2xl border border-gray-200 flex items-center justify-center">
                <a
                  href={classData.materialForClass}
                  download="Resource.pdf"
                  className="text-blue-600 font-semibold hover:underline"
                >
                  📥 Download Resources
                </a>
              </Card>
            )}

            <Card className="w-full max-w-2xl shadow-lg mt-8 p-8 bg-white rounded-2xl border border-gray-200">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-900 mb-4">
                  Course Assignments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-md text-gray-700">
                  <strong>Start Date:</strong>{" "}
                  {classData.courseAssignments.assignStartDate}
                </p>
                <p className="text-md text-gray-700">
                  <strong>End Date:</strong>{" "}
                  {classData.courseAssignments.assignEndDate}
                </p>
                <h3 className="text-xl font-medium text-gray-800">
                  {classData.courseAssignments.courseAssignmentQuestionName}
                </h3>
                <Button
                  asChild
                  className="flex items-center gap-2 bg-[#6e2b8b] hover:bg-[#762d95] text-white px-4 py-2 rounded-lg shadow-md"
                >
                  <a
                    href={
                      classData.courseAssignments
                        .courseAssignmentQuestionFile
                    }
                    download
                  >
                    <FaFileDownload /> Download Assignment
                  </a>
                </Button>

                 <div className="flex flex-col items-center space-y-4">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    disabled={isUploadDisabled}
                  />
                  <label htmlFor="file-upload" className="w-full">
                    <div className={`w-full flex items-center justify-center h-32 border-2 border-dashed border-[#6e2b8b] rounded-lg cursor-pointer bg-[#eadcf1] hover:bg-[#d5afe3] ${isUploadDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <p className="text-gray-700 font-medium">
                        {isUploadDisabled ? "Upload disabled after assignment end date" : "Drag & Drop or Click to Upload CSV"}
                      </p>
                    </div>
                  </label>

                  {fileName && (
                    <p className="text-gray-700 mt-2">
                      Selected File: {fileName}
                    </p>
                  )}
                  <Button
                    onClick={handleUpload}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md mt-4"
                    disabled={isUploadDisabled}
                  >
                    Upload Assignment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="w-full p-8 bg-white rounded-2xl mt-[200px]">
          <p className="text-gray-600 text-center text-lg">
            Select a class to view its content and assignments.
          </p>
        </div>
      )}
    </>
  );
};

export default Mainbar;
