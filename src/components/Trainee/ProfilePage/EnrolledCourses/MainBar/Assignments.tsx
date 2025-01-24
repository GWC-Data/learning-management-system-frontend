import React, { useEffect, useState } from "react";
import { fetchCourseAssignmentbybatchIdApi } from "@/api/courseAssignmentApi";
import { useLocation } from "react-router-dom";
import { AiFillCloseCircle } from "react-icons/ai";
import { fetchUsersbyIdApi } from "@/api/userApi";

interface Assignment {
  courseAssignmentQuestionFile: string;
  courseAssignmentQuestionName: string;
  trainerId: number;
}

const Assignments: React.FC = () => {
  const location = useLocation();
  const course = location.state;
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfFileUrl, setPdfFileUrl] = useState<string | null>(null);
  const [trainerNames, setTrainerNames] = useState<Record<number, string>>({});

  // Fetch assignments on component mount
  const fetchCourseAssignments = async () => {
    try {
      const data = await fetchCourseAssignmentbybatchIdApi(course.id);
      setAssignments(data);

      // Fetch trainer names for each assignment
      const trainerIds = data.map(
        (assignment: Assignment) => assignment.trainerId
      );
      console.log("trainerIds", trainerIds);
      await fetchTrainerNames(trainerIds);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  useEffect(() => {
    fetchCourseAssignments();
  }, [course.id]);

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

  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 max-w-[1550px] mx-auto mt-10">
      {/* Header Section */}
      <div className="mb-6">
        <p className="text-gray-600">
          Enhance your knowledge on Hooks! Download the assignment questions and
          upload your solutions to showcase your skills.
        </p>
      </div>

      {/* Assignments List */}
      <div className="space-y-6">
        {assignments.length > 0 ? (
          assignments.map((assignment, index) => (
            <div
              key={index}
              className="p-4 bg-white rounded-lg shadow-md flex justify-between items-center"
            >
              {/* Assignment Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700">
                  {assignment.courseAssignmentQuestionName}
                </h3>
                <p className="text-sm text-gray-600">
                  Trainer Name:{" "}
                  {trainerNames[assignment.trainerId] || "Loading..."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 items-center">
                {/* Download Section */}
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() =>
                      handleViewFile(assignment.courseAssignmentQuestionFile)
                    }
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
                  <button
                    onClick={() =>
                      console.log("Upload answers functionality goes here")
                    }
                    className="bg-green-500 text-white py-2 px-4 rounded-lg shadow hover:bg-green-600 transition-all"
                  >
                    Upload Answers
                  </button>
                  <button
                    onClick={() =>
                      console.log("View uploaded answers functionality")
                    }
                    className="bg-gray-200 py-2 px-4 rounded-lg text-green-500 hover:text-green-700 flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="#22c55e"
                    >
                      <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">
            No assignments available at the moment.
          </p>
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

      {/* Decorative Divider */}
      {/* <div className="mt-8 border-t border-gray-200">
        <p className="text-sm text-gray-500 text-center mt-4">
          For any issues, please contact your instructor or email us at{" "}
          <a
            href="mailto:support@teqcertify.com"
            className="text-blue-500 underline hover:text-blue-600"
          >
            support@teqcertify.com
          </a>
          .
        </p>
      </div> */}
    </div>
  );
};

export default Assignments;
