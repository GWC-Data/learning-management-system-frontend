import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { AiFillCloseCircle } from "react-icons/ai";

import {
  createCourseAssignmentApi,
  fetchCourseAssignmentApi,
  updateCourseAssignmentApi,
  deleteCourseAssignmentApi,
} from "@/api/courseAssignmentApi";
import { fetchBatchApi } from "@/api/batchApi";
import { fetchUsersApi } from "@/api/userApi";
import { fetchCourseApi } from "@/api/courseApi";

interface CourseAssignment {
  id: number;
  batchId: number;
  courseId: number; // Ensure courseId exists here
  batchName: string;
  courseName: string;
  courseAssignmentQuestionName: string;
  courseAssignmentQuestionFile: string;
  trainerId: number;
  trainerName: string;
}

interface Option {
  id: any;
  batchName: any;
  courseName: any;
  trainerName: any;
}

const getToken = () => localStorage.getItem("authToken");

const CourseAssignmentsTable: React.FC = () => {
  const [courseAssignments, setCourseAssignments] = useState<
    CourseAssignment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [batch, setBatch] = useState<Option[]>([]);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false); // State for PDF modal
  const [pdfFileUrl, setPdfFileUrl] = useState<string | null>(null);
  const [course, setCourse] = useState<Option[]>([]);
  const [trainer, setTrainer] = useState<Option[]>([]);
  const [editingAssignment, setEditingAssignment] = useState(false);
  const [newAssignment, setNewAssignment] = useState<CourseAssignment>({
    id: 0,
    batchId: 0,
    batchName: "",
    courseId: 0,
    courseName: "",
    courseAssignmentQuestionName: "",
    courseAssignmentQuestionFile: "",
    trainerId: 0,
    trainerName: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleViewFile = (fileUrl: string) => {
    setPdfFileUrl(fileUrl);
    setIsPdfModalOpen(true); // Open PDF modal
  };

  const closePdfModal = () => {
    setPdfFileUrl(null);
    setIsPdfModalOpen(false); // Close PDF modal
  };

  const fetchCourseAssignments = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to view course assignments");
      return;
    }

    try {
      const data = await fetchCourseAssignmentApi();
      const assignment = data?.data.map((a: any) => ({
        id: a.id,
        batchId: a.batchId || 0,
        batchName: a.batch?.batchName,
        courseId: a.courseId || 0,
        courseName: a.course?.courseName,
        courseAssignmentQuestionName:
          a.courseAssignmentQuestionName || "Unknown",
        courseAssignmentQuestionFile: a.courseAssignmentQuestionFile || 0,
        trainerName: a.trainer
          ? `${a.trainer.firstName} ${a.trainer.lastName}`
          : "Unknown",
      }));
      console.log("fetchassignment", assignment);

      const batch = await fetchBatchApi();
      const batchMap = batch.map((batch: any) => ({
        id: batch.id,
        batchName: batch.batchName,
      }));
      setBatch(batchMap);
      console.log("batches", batchMap);

      const course = await fetchCourseApi();
      const courseMap = course?.map((c: any) => ({
        id: c.id,
        courseName: c.courseName,
      }));
      setCourse(courseMap);
      console.log("coursemap", courseMap);

      const responseUser = await fetchUsersApi();
      console.log("responseUser", responseUser);
      const trainer = responseUser.Users.filter(
        (user: any) => user.role.name === "trainer"
      ).map((trainer: any) => ({
        id: trainer.id,
        trainerName: `${trainer.firstName} ${trainer.lastName}`,
      }));
      setTrainer(trainer);
      setCourseAssignments(assignment);
    } catch (error) {
      toast.error("Failed to fetch course assignments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseAssignments();
  }, []);

  const addNewRow = () => {
    setIsModalOpen(false);
    setNewAssignment({
      id: 0,
      batchId: 0,
      batchName: "",
      courseId: 0,
      courseName: "",
      courseAssignmentQuestionName: "",
      courseAssignmentQuestionFile: "",
      trainerId: 0,
      trainerName: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (assignment: CourseAssignment) => {
    setEditingAssignment(true);
    setNewAssignment({
      id: assignment.id,
      batchId: assignment.batchId,
      batchName: assignment.batchName,
      courseId: assignment.courseId,
      courseName: assignment.courseName,
      courseAssignmentQuestionName: assignment.courseAssignmentQuestionName,
      courseAssignmentQuestionFile: assignment.courseAssignmentQuestionFile,
      trainerId: assignment.trainerId,
      trainerName: assignment.trainerName,
    });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewAssignment({
      id: 0,
      batchId: 0,
      batchName: "",
      courseId: 0,
      courseName: "",
      courseAssignmentQuestionName: "",
      courseAssignmentQuestionFile: "",
      trainerId: 0,
      trainerName: "",
    });
  };

  const handleFormSubmit = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to perform this action");
      return;
    }

    try {
      if (editingAssignment) {
        await updateCourseAssignmentApi(newAssignment.id, {
          batchId: newAssignment.batchId,
          courseId: newAssignment.courseId,
          courseAssignmentQuestionName:
            newAssignment.courseAssignmentQuestionName,
          courseAssignmentQuestionFile:
            newAssignment.courseAssignmentQuestionFile,
          trainerId: Number(newAssignment.trainerId),
        });
        toast.success("Course Assignment updated successfully");
      } else {
        await createCourseAssignmentApi({
          batchId: newAssignment.batchId,
          courseId: newAssignment.courseId,
          courseAssignmentQuestionName:
            newAssignment.courseAssignmentQuestionName,
          courseAssignmentQuestionFile:
            newAssignment.courseAssignmentQuestionFile,
          trainerId: Number(newAssignment.trainerId), // Ensure it's parsed as an integer
        });
        toast.success("Courseassignment created successfully");
      }
      fetchCourseAssignments();
    } catch (error) {
      toast.error("failed to save course assignment");
    } finally {
      handleModalClose();
    }
  };

  const handleDelete = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to delete a course.");
      return;
    }
    try {
      console.log("deletecourseassignemt", newAssignment.id);
      await deleteCourseAssignmentApi(newAssignment.id);
      toast.success("Assignment deleted successfully!");
      fetchCourseAssignments();
      setLoading(true);
      handleModalClose();
    } catch (error) {
      toast.error("Failed to delete assignment.");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setNewAssignment((prev) => ({
          ...prev,
          courseAssignmentQuestionFile: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Course Assignments</h2>

      <button
        onClick={() => {
          setEditingAssignment(true);
          addNewRow();
          setIsModalOpen(true);
        }}
        className="mb-4 px-4 py-2 bg-[#4e6db4] font-semibold text-white rounded-lg"
      >
        Add Assignment
      </button>

      <table className="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Batch Name</th>
            <th className="border px-4 py-2">CourseName</th>
            <th className="border px-4 py-2">Assignment Name</th>
            <th className="border px-4 py-2">File</th>
            <th className="border px-4 py-2">Trainer</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courseAssignments.map((assignment) => (
            <tr key={assignment.id}>
              <td className="border px-4 py-2">{assignment.batchName}</td>
              <td className="border px-4 py-2">{assignment.courseName}</td>
              <td className="border px-4 py-2">
                {assignment.courseAssignmentQuestionName}
              </td>
              <td className="border px-4 py-2">
                {assignment.courseAssignmentQuestionFile ? (
                  <button
                    onClick={() =>
                      handleViewFile(assignment.courseAssignmentQuestionFile)
                    }
                    className="text-blue-500 underline"
                  >
                    View File
                  </button>
                ) : (
                  "No File"
                )}
              </td>
              <td className="border px-4 py-2">{assignment.trainerName}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleEdit(assignment)}
                  className="px-2 py-1 bg-blue-400 text-white rounded mr-2"
                >
                  Edit
                </button>
                {/* <button
                  onClick={() => {
                    setNewAssignment(assignment); // Set the correct assignment to delete
                    handleDelete();
                  }}
                  className="px-2 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PDF Viewer Modal */}
      {isPdfModalOpen && pdfFileUrl && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-7 rounded shadow-lg w-[1300px] h-[700px] relative">
            <button
              onClick={closePdfModal}
              className="absolute top-1 right-1 px-2 py-2 bg-red-500 hover:bg-red-700 text-white rounded-full"
            >
              <AiFillCloseCircle />
            </button>
            <iframe
              src={pdfFileUrl}
              title="PDF Viewer"
              className="w-full h-full border rounded"
            ></iframe>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/4">
            <h3 className="text-lg font-semibold mb-4">
              {editingAssignment ? "Edit Assignment" : "Add Assignment"}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault(); // Prevent default form submission
                handleFormSubmit();
              }}
            >
              <div className="mb-4">
                <label className="block font-metropolis font-medium">
                  Batch Name
                </label>
                <select
                  value={newAssignment.batchId}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      batchId: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full border rounded p-2 font-metropolis text-gray-700"
                >
                  <option value="">Select Batch</option>
                  {batch.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batchName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-metropolis font-medium">
                  Course Name
                </label>
                <select
                  value={newAssignment.courseId || ""}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      courseId: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full border rounded p-2 font-metropolis text-gray-700"
                >
                  <option value="">Select Course</option>
                  {course.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.courseName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-metropolis font-medium">
                  Assignment Name
                </label>
                <input
                  type="text"
                  placeholder="Assignment Name"
                  value={newAssignment.courseAssignmentQuestionName}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      courseAssignmentQuestionName: e.target.value,
                    })
                  }
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block font-metropolis font-medium">
                  Assignment File
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full"
                />
              </div>

              <div className="mb-4">
                <label className="block font-metropolis font-medium">
                  Trainer
                </label>
                <select
                  value={newAssignment.trainerId || ""}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      trainerId: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full border rounded p-2 font-metropolis text-gray-700"
                >
                  <option value="">Select Trainer</option>
                  {trainer.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.trainerName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons inside the form */}
              <div className="mt-4 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={() => {
                    handleFormSubmit;
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && <p>Loading...</p>}
    </div>
  );
};

export default CourseAssignmentsTable;
