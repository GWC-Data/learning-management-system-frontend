import React, { useEffect, useState } from "react";
import { fetchCourseAssignmentbybatchIdApi } from "@/helpers/api/courseAssignmentApi";
import { useLocation } from "react-router-dom";
import { AiFillCloseCircle } from "react-icons/ai";
import { fetchUsersbyIdApi } from "@/helpers/api/userApi";
import { createAssignmentCompletionsApi } from "@/helpers/api/assignmentCompletionsApi";

interface Assignment {
  courseAssignmentQuestionFile: string;
  courseAssignmentQuestionName: string;
  trainerId: number;
  id: number; // Add id field to each assignment
}

const Assignments: React.FC = () => {
  const userId = Number(localStorage.getItem("userId"));
  const location = useLocation();
  const course = location.state;
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfFileUrl, setPdfFileUrl] = useState<string | null>(null);
  const [trainerNames, setTrainerNames] = useState<Record<number, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);

  // Fetch assignments on component mount
  const fetchCourseAssignments = async () => {
    try {
      const data = await fetchCourseAssignmentbybatchIdApi(course.id);
      console.log("course", course.id);
      console.log("data", data);
      setAssignments(data);

      // Fetch trainer names for each assignment
      const trainerIds = data.map(
        (assignment: Assignment) => assignment.trainerId
      );

      await fetchTrainerNames(trainerIds);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  // Fetch trainer names by IDs
  const fetchTrainerNames = async (trainerIds: number[]) => {
    try {
      const names: Record<number, string> = {};
      for (const id of trainerIds) {
        const trainer = await fetchUsersbyIdApi(id); // Assume this returns { id, name }
        console.log(trainer, "trai");
        names[id] = `${trainer.firstName} ${trainer.lastName}`;
      }
      setTrainerNames(names);
    } catch (error) {
      console.error("Error fetching trainer names:", error);
    }
  };

  // Handle PDF modal actions
  const handleViewFile = (fileUrl: string) => {
    setPdfFileUrl(fileUrl);
    setIsPdfModalOpen(true);
  };

  const closePdfModal = () => {
    setPdfFileUrl(null);
    setIsPdfModalOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        console.log("Base64 String:", base64String);
      };
      reader.onerror = (error) => {
        console.error("Error converting file to Base64:", error);
      };

      reader.readAsDataURL(file); // Converts the file to a Base64 string
    }
  };

  const handleUpload = async (assignmentId: number) => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    setSelectedAssignmentId(assignmentId); // Automatically select the assignment when upload is clicked

    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64String = reader.result as string;

      const payload = {
        traineeId: userId || "", // Send userId as string or empty string if null
        courseAssignId: Number(assignmentId), // Send as number
        courseAssignmentAnswerFile: base64String, // Send base64 string
        obtainedMarks: 0, // Default to 0
      };
      console.log("Payload:", payload);

      try {
        await createAssignmentCompletionsApi(payload); // Update the API to handle JSON payload
        alert("File uploaded successfully!");
        setSelectedFile(null);
        setSelectedAssignmentId(null);
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Failed to upload file. Please try again.");
      }
    };

    reader.onerror = (error) => {
      console.error("Error converting file to Base64:", error);
    };

    reader.readAsDataURL(selectedFile); // Converts the file to a Base64 string
  };

  useEffect(() => {
    fetchCourseAssignments();
  }, [course.id]);

  return (
    <div className="p-6 bg-[#eadcf1] max-w-[1550px] mx-auto mt-10 rounded-lg">
      {/* Header Section */}
      <div className="mb-6">
        <p className="text-gray-600">
          Enhance your knowledge on the modules! Download the assignment
          questions and upload your solutions to showcase your skills.
        </p>
      </div>

      {/* Assignments List */}
      <div className="space-y-6">
        {assignments.length > 0 ? (
          assignments.map((assignment) => (
            <div
              key={assignment.id} // Use the assignment ID as the key
              className="p-4 bg-white rounded-lg shadow-md flex justify-between items-center"
            >
              {/* Assignment Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700">
                  {assignment.courseAssignmentQuestionName}
                </h3>
                <p className="text-sm text-gray-600">
                  Trainer Name: {trainerNames[assignment.trainerId] || "Loading..."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 items-center">
                {/* Download Section */}
                <button
                  onClick={() => handleViewFile(assignment.courseAssignmentQuestionFile)}
                  className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-600 transition-all"
                >
                  View Questions
                </button>
                <a
                  href={assignment.courseAssignmentQuestionFile}
                  download
                  className="bg-gray-200 py-2 px-4 rounded-lg text-blue-500 hover:text-blue-700 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#3B82F6"
                  >
                    <path d="M440-800v487L216-537l-56 57 320 320 320-320-56-57-224 224v-487h-80Z" />
                  </svg>
                </a>
              </div>

              {/* Upload Section */}
              <div className="flex gap-2 items-center">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="mb-4"
                />
                <button
                  onClick={() => handleUpload(assignment.id)} // Automatically select assignment when clicked
                  className="bg-green-500 text-white py-2 px-4 rounded-lg shadow hover:bg-green-600 transition-all"
                >
                  Upload Answers
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No assignments available at the moment.</p>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {isPdfModalOpen && pdfFileUrl && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-7 rounded shadow-lg w-[90%] h-[90%] relative">
            <button
              onClick={closePdfModal}
              className="absolute top-3 right-3 px-2 py-2 bg-red-500 hover:bg-red-700 text-white rounded-full"
            >
              <AiFillCloseCircle size={24} />
            </button>
            <iframe
              src={pdfFileUrl}
              title="PDF Viewer"
              className="w-full h-full border rounded"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;
