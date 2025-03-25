import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaFileDownload } from "react-icons/fa";
import { useEffect, useState } from "react";
import { createAssignmentCompletionsApi } from "@/helpers/api/assignmentCompletionsApi";
import { useLocation } from "react-router-dom";
import { fetchClassForModuleByIdApi } from "@/helpers/api/classForModuleApi";

const Mainbar: React.FC<{ selectedClass: any }> = ({ selectedClass }) => {
  const [classData, setClassData] = useState<any>(null);
  const location = useLocation();

  // Extract classId from URL using regex
  const match = (location.pathname + location.hash).match(/classId=([\w-]+)/);
  const classId = match ? match[1] : null;

  // Fetch class data when classId changes
  useEffect(() => {
    console.log("useEffect triggered with classId:", classId);

    // Guard clause to prevent API calls with null classId
    if (!classId) {
      console.warn("No classId found in URL, skipping API call");
      return;
    }

    const fetchData = async () => {
      try {
        console.log("Starting to fetch class data for:", classId);
        const data = await fetchClassForModuleByIdApi(String(classId));
        console.log("Successfully fetched class data:", data);

        if (!data) {
          console.warn("API returned empty data for classId:", classId);
          return;
        }

        // Transform the data to match the expected format
        const transformedData = {
          classId: data.classId,
          classTitle: data.classTitle,
          classDescription: data.classDescription,
          classRecordedLink: data.classRecordedLink,
          materialForClass: data.materialForClass,
          courseAssignments: {
            assignmentId: data.assignmentId,
            assignStartDate:
              data.assignStartDate?.value || data.assignStartDate,
            assignEndDate: data.assignEndDate?.value || data.assignEndDate,
            courseAssignmentQuestionName: data.assignmentTitle,
            courseAssignmentQuestionFile: data.assignmentQuestionFile,
          },
        };
        console.log("transformedData", transformedData);

        setClassData(transformedData);
      } catch (error) {
        console.error("Error fetching class data:", error);
      }
    };

    fetchData();
  }, [classId, location]); // Added location to dependencies

  const userId = localStorage.getItem("userId");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [isUploadDisabled, setIsUploadDisabled] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPastDueDate, setIsPastDueDate] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Check if assignment is past due date
  useEffect(() => {
    if (classData && classData.courseAssignments) {
      const endDateStr = classData.courseAssignments.assignEndDate;
      if (!endDateStr) return;

      try {
        // Parse the end date string
        const endDate = new Date(endDateStr);
        const currentDate = new Date();

        console.log("Assignment End Date:", endDate);
        console.log("Current Date:", currentDate);

        // Check if the current date is after the end date
        if (currentDate > endDate) {
          console.log("Assignment is past due date. Upload disabled.");
          setIsUploadDisabled(true);
          setIsPastDueDate(true);
        } else {
          console.log("Assignment is still active. Upload enabled.");
          setIsUploadDisabled(false);
          setIsPastDueDate(false);
        }
      } catch (error) {
        console.error("Error parsing date:", error);
        // If there's an error parsing the date, don't disable upload
        setIsUploadDisabled(false);
        setIsPastDueDate(false);
      }
    }
  }, [classData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
      // Reset upload status when selecting a new file
      setUploadStatus(null);
    }
  };

  const handleUpload = async () => {
    // Reset upload status
    setUploadStatus(null);

    // Check if upload is disabled due to past due date
    if (isPastDueDate) {
      setUploadStatus({
        success: false,
        message: "Cannot upload assignment after the due date.",
      });
      return;
    }

    if (!selectedFile) {
      setUploadStatus({
        success: false,
        message: "Please select a file to upload.",
      });
      return;
    }

    if (!classData?.courseAssignments?.assignmentId) {
      setUploadStatus({
        success: false,
        message: "Assignment ID is missing. Cannot upload file.",
      });
      return;
    }

    try {
      setIsUploading(true);

      // Create a FormData object for multipart/form-data upload
      const formData = new FormData();

      // Add all required fields to the formData
      formData.append(
        "courseAssignId",
        classData.courseAssignments.assignmentId.toString()
      );
      formData.append("traineeId", userId || "");
      formData.append("obtainedMarks", "0");
      formData.append("obtainedPercentage", "0");
      formData.append("classId", classId || "");

      // Append the file with appropriate field name
      formData.append("courseAssignmentAnswerFile", selectedFile);

      console.log("Uploading assignment with FormData containing:", {
        courseAssignId: classData.courseAssignments.assignmentId,
        traineeId: userId,
        obtainedMarks: 0,
        obtainedPercentage: 0,
        classId: classId,
        courseAssignmentAnswerFile: selectedFile.name, // Log filename instead of file content
      });

      await createAssignmentCompletionsApi(formData);

      setUploadStatus({
        success: true,
        message: "File uploaded successfully!",
      });

      setSelectedFile(null);
      setFileName("");
    } catch (error: any) {
      console.error("Upload failed", error);

      // Check for specific error message about assignment already existing
      if (error) {
        setUploadStatus({
          success: true, // Using true to show green UI
          message:
            "You have already submitted this assignment. Your submission has been recorded. You cannot resubmit again.",
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Function to check if error is "already submitted" type
  const isAlreadySubmittedError = () => {
    return uploadStatus?.message?.includes("already submitted");
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
          <div className="flex flex-col items-center min-h-screen p-4 w-[800px]">
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
                {classData?.classRecordedLink ? (
                  <iframe
                    className="w-[640px] h-[400px] rounded-xl shadow-sm border-2 border-gray-200"
                    src={getEmbedUrl(classData.classRecordedLink)}
                    title="Recorded Lecture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-[640px] h-[400px] rounded-xl shadow-sm border-2 border-gray-200 flex items-center justify-center bg-gray-100">
                    <p className="text-gray-500">
                      No recorded lecture available
                    </p>
                  </div>
                )}
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

            {classData.courseAssignments && (
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
                  {classData.courseAssignments.courseAssignmentQuestionFile && (
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
                  )}

                  <div className="flex flex-col items-center space-y-4">
                    {isAlreadySubmittedError() ? (
                      <div className="w-full flex items-center justify-center h-32 border-2 border-solid border-green-500 rounded-lg bg-green-50">
                        <div className="text-green-700 font-medium text-center">
                          <p className="text-lg">
                            ✅ Assignment Already Submitted
                          </p>
                          <p className="text-sm mt-2">
                            Your submission has been recorded. You cannot
                            resubmit again.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <input
                          type="file"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                          disabled={
                            isPastDueDate ||
                            isUploading ||
                            isAlreadySubmittedError()
                          }
                        />
                        <label htmlFor="file-upload" className="w-full">
                          <div
                            className={`w-full flex items-center justify-center h-32 border-2 border-dashed border-[#6e2b8b] rounded-lg cursor-pointer bg-[#eadcf1] hover:bg-[#d5afe3] ${isPastDueDate || isUploading || isAlreadySubmittedError() ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <p className="text-gray-700 font-medium">
                              {isPastDueDate
                                ? "Assignment submission deadline has passed"
                                : isUploading
                                  ? "Uploading..."
                                  : "Drag & Drop or Click to Upload CSV"}
                            </p>
                          </div>
                        </label>
                      </>
                    )}

                    {fileName && !isAlreadySubmittedError() && (
                      <p className="text-gray-700 mt-2">
                        Selected File: {fileName}
                      </p>
                    )}

                    {!isAlreadySubmittedError() && (
                      <Button
                        onClick={handleUpload}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md mt-4"
                        disabled={!selectedFile || isPastDueDate || isUploading}
                      >
                        {isUploading ? "Uploading..." : "Upload Assignment"}
                      </Button>
                    )}

                    {uploadStatus && !isAlreadySubmittedError() && (
                      <p
                        className={`text-sm mt-2 ${uploadStatus.success ? "text-green-600" : "text-red-500"}`}
                      >
                        {uploadStatus.message}
                      </p>
                    )}

                    {isPastDueDate && !isAlreadySubmittedError() && (
                      <p className="text-red-500 text-sm mt-2">
                        The assignment submission deadline has passed. You can
                        no longer upload submissions.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      ) : (
        <div className="w-full p-8 bg-white rounded-2xl mt-[200px]">
          <p className="text-gray-600 text-center text-lg">
            {classId
              ? "Loading class content..."
              : "Select a class to view its content and assignments."}
          </p>
        </div>
      )}
    </>
  );
};

export default Mainbar;
