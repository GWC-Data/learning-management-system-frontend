import { useState, useEffect, SetStateAction } from "react";
import { Button } from "../../ui/button";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ColDef } from "ag-grid-community";
import { toast } from "sonner";
import { Edit, File, Trash } from "lucide-react";
import { AiFillCloseCircle } from "react-icons/ai";
import Select from 'react-select'

import {
  createCourseAssignmentApi,
  fetchCourseAssignmentApi,
  updateCourseAssignmentApi,
  deleteCourseAssignmentApi,
} from "@/helpers/api/courseAssignmentApi";
import { fetchBatchApi } from "@/helpers/api/batchApi";
import { fetchUsersApi } from "@/helpers/api/userApi";
import { fetchCourseApi } from "@/helpers/api/courseApi";

interface CourseAssignmentProps {
  editable?: true;
}

interface CourseAssignment {
  id: string;
  batchId: string;
  courseId: string; // Ensure courseId exists here
  batchName: string;
  courseName: string;
  courseAssignmentQuestionName: string;
  courseAssignmentQuestionFile: File | string;
  trainerId: string;
  trainerName: string;
  totalMarks: number;
  assignStartDate: string;
  assignEndDate: string;
}

interface Option {
  id: any;
  batchName: any;
  courseName: any;
  trainerName: any;
}

const getToken = () => localStorage.getItem("authToken");

const CourseAssignmentsTable = ({ editable = true }: CourseAssignmentProps) => {
  const [courseAssignments, setCourseAssignments] = useState<CourseAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [colDefs, setColDefs] = useState<ColDef[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [batch, setBatch] = useState<Option[]>([]);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false); // State for PDF modal
  const [pdfFileUrl, setPdfFileUrl] = useState<string | null>(null);
  const [course, setCourse] = useState<Option[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [assignemntsToDelete, setAssignemntsToDelete] = useState<CourseAssignment | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [trainer, setTrainer] = useState<Option[]>([]);
  const [editingAssignment, setEditingAssignment] = useState(false);
  const [newAssignment, setNewAssignment] = useState<CourseAssignment>({
    id: "",
    batchId: "",
    batchName: "",
    courseId: "",
    courseName: "",
    courseAssignmentQuestionName: "",
    courseAssignmentQuestionFile: "",
    trainerId: "",
    trainerName: "",
    totalMarks: 0,
    assignStartDate: "",
    assignEndDate: ""
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

    {/* pagination */ }
  const recordsPerPage = 10;
  const totalPages = Math.ceil(courseAssignments.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentData = courseAssignments.slice(startIndex, startIndex + recordsPerPage);

  const handlePageChange = (newPage: SetStateAction<number>) => {
    setCurrentPage(newPage);
  };

  const fetchCourseAssignments = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to view course assignments");
      return;
    }

    try {
      const data = await fetchCourseAssignmentApi();
      console.log("fetchcourseAssignemtnApi", data);

      const assignment = data?.courseAssignments?.courseAssignments.map((a: any) => ({
        id: a.id,
        batchId: a.batch?.id || 0,
        batchName: a.batch?.batchName || "Unknown",
        courseId: a.course?.id || 0,
        courseName: a.course?.courseName || "Unknown",
        courseAssignmentQuestionName: a.courseAssignmentQuestionName || "Unknown",
        courseAssignmentQuestionFile: a.courseAssignmentQuestionFile || "No file",
        trainerId: a.trainers?.[0]?.id || 0, // Use trainers array to get the first trainer's ID
        trainerName: a.trainers?.[0]
          ? `${a.trainers[0].firstName} ${a.trainers[0].lastName}`
          : "Unknown",
        totalMarks: a.totalMarks || 0,
        assignStartDate: a.assignStartDate?.value,
        assignEndDate: a.assignEndDate?.value,
      }));

      console.log('fetchassignment', assignment);

      const batch = await fetchBatchApi();
      console.log("fetchbatchApi", batch);
      const batchMap = batch.batch?.map((batch: any) => ({
        id: batch.id,
        batchName: batch.batchName
      }));
      setBatch(batchMap);
      console.log('batchMap', batchMap)

      const course = await fetchCourseApi();
      console.log("fetchCourseApi", course);
      const courseMap = course.map((c: any) => ({
        id: c.courseId,
        courseName: c.courseName
      }));
      setCourse(courseMap)
      console.log('coursemap', courseMap)

      const responseUser = await fetchUsersApi();
      console.log('responseUser', responseUser);
      const trainer = responseUser.users.filter(
        (user: any) => user.roleName === "trainer"
      ).map((trainer: any) => ({
        id: trainer.id,
        trainerName: `${trainer.firstName} ${trainer.lastName}`
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
    setIsModalOpen(false)
    setEditingAssignment(false)
    setNewAssignment({
      id: "",
      batchId: "",
      batchName: "",
      courseId: "",
      courseName: "",
      courseAssignmentQuestionName: "",
      courseAssignmentQuestionFile: "",
      trainerId: "",
      trainerName: "",
      totalMarks: 0,
      assignStartDate: "",
      assignEndDate: ""
    });
    setIsModalOpen(true);
  }

  const handleEdit = (data: any) => {
    const courseAssignmentEdit = courseAssignments.find((a) => a.id === data.id);
    if (courseAssignmentEdit) {
      console.log("courseAssignmentEdit", courseAssignmentEdit);
      setEditingAssignment(true);
  
      // ✅ Explicitly set values to avoid empty fields
      setNewAssignment({
        id: courseAssignmentEdit.id,
        batchId: courseAssignmentEdit.batchId,
        batchName: courseAssignmentEdit.batchName,
        courseId: courseAssignmentEdit.courseId,
        courseName: courseAssignmentEdit.courseName, 
        courseAssignmentQuestionName: courseAssignmentEdit.courseAssignmentQuestionName,
        courseAssignmentQuestionFile: courseAssignmentEdit.courseAssignmentQuestionFile,
        totalMarks: courseAssignmentEdit.totalMarks,
        trainerId: courseAssignmentEdit.trainerId,
        trainerName: courseAssignmentEdit.trainerName,
        assignStartDate: courseAssignmentEdit.assignStartDate,
        assignEndDate: courseAssignmentEdit.assignEndDate,
      });
  
      setIsModalOpen(true);
    }
  };
  
  
  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewAssignment({
      id: "",
      batchId: "",
      batchName: "",
      courseId: "",
      courseName: "",
      courseAssignmentQuestionName: "",
      courseAssignmentQuestionFile: "",
      trainerId: "",
      trainerName: "",
      totalMarks: 0,
      assignStartDate: "",
      assignEndDate: ""
    });
  };

  const confirmDeleteAssignment = (data: CourseAssignment) => {
    const assignment = courseAssignments.find((a) => a.id === data.id);
    if (assignment) {
      setAssignemntsToDelete(assignment);
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteAssignment = async () => {
    if (!assignemntsToDelete) {
      toast.error("No Assignments for deletion")
      return;
    }

    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to delete a course.");
      return;
    }

    try {
      await deleteCourseAssignmentApi(assignemntsToDelete.id);
      setCourseAssignments((prev) => prev.filter((a) => a.id !== assignemntsToDelete.id));
      toast.success("Assignment deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete assignment.");
    } finally {
      setIsDeleteModalOpen(false);
      setAssignemntsToDelete(null)
    }
  };
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setAssignemntsToDelete(null);
  }


  const handleFormSubmit = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to perform this action")
      return;
    }

    try {
      if (editingAssignment) {
        await updateCourseAssignmentApi(newAssignment.id, {
          batchId: newAssignment.batchId,
          courseId: newAssignment.courseId,
          courseAssignmentQuestionName: newAssignment.courseAssignmentQuestionName,
          courseAssignmentQuestionFile: newAssignment.courseAssignmentQuestionFile,
          trainerId: String(newAssignment.trainerId),
          totalMarks: newAssignment.totalMarks,
          assignStartDate: newAssignment.assignStartDate,
          assignEndDate: newAssignment.assignEndDate
        });
        toast.success("Course Assignment updated successfully");
      } else {
        await createCourseAssignmentApi({
          batchId: newAssignment.batchId,
          courseId: newAssignment.courseId,
          courseAssignmentQuestionName: newAssignment.courseAssignmentQuestionName,
          courseAssignmentQuestionFile: newAssignment.courseAssignmentQuestionFile,
          trainerId: String(newAssignment.trainerId),
          totalMarks: newAssignment.totalMarks,
          assignStartDate: newAssignment.assignStartDate,
          assignEndDate: newAssignment.assignEndDate
        });
        toast.success('Courseassignment created successfully')
      }
      fetchCourseAssignments();
    } catch (error) {
      toast.error("failed to save course assignment")
    } finally {
      handleModalClose();
    }
  };


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  
    if (file) {
      setNewAssignment((prev) => ({
        ...prev,
        courseAssignmentQuestionFile: file, // Direct file upload without Base64
      }));
    }
  };


  useEffect(() => {
    setColDefs([
      { headerName: "BatchName", field: "batchName", editable: false, width: 140 },
      { headerName: "CourseName", field: "courseName", editable: false, width: 170 },
      { headerName: "Assignment Name", field: "courseAssignmentQuestionName", editable: false, width: 180 },
      {
        headerName: "File",
        field: "courseAssignmentQuestionFile",
        editable: false,
        width: 120,
        cellRenderer: (params: any) => {
          if (!params.value) return "No File"; // Handle empty values
          return (
            <button
              onClick={() => handleViewFile(params.value)}
              className="text-blue-500 underline"
            >
              <File/>
            </button>
          );
        },
      },
      { headerName: "Total Marks", field: "totalMarks", editable: false, width: 130 },
      { headerName: "Trainer", field: "trainerName", editable: false, width: 150 },
      { headerName: "Assignment Uploaded", field: "assignStartDate", editable: false, width: 200 },
      { headerName: "Final Submission", field: "assignEndDate", editable: false, width: 170 },
      {
        headerName: "Actions",
        field: "actions",
        width: 150,
        cellRenderer: (params: any) => (
          <div className="flex space-x-2">
            {/* <Button
              onClick={() => handleViewBatches(params.data)}
              className="bg-green-500 text-white p-2 rounded hover:bg-green-700"
            >
              <Eye className="h-5 w-5" />
            </Button> */}
            <Button onClick={() => handleEdit(params.data)} className="bg-white text-[#6E2B8B] p-2 rounded hover:bg-white">
              <Edit className="h-5 w-4" />
            </Button>
            <Button onClick={() => confirmDeleteAssignment(params.data)} className="text-red-600 bg-white hover:bg-white p-2">
              <Trash className="h-5 w-5" />
            </Button>
          </div>
        ),
        editable: false,
      },
    ]);
  }, [courseAssignments])

  return (
    <div className="flex-1 p-4 mt-10 ml-20">
      <div className="flex items-center justify-between bg-[#6E2B8B] text-white px-6 py-4 rounded-lg shadow-lg mb-6 w-[1178px]">
        <div className="flex flex-col">
          <h2 className="text-2xl font-metropolis font-semibold tracking-wide">Assignment Management</h2>
          <p className="text-sm font-metropolis font-medium">Manage assignments easily.</p>
        </div>
        <Button onClick={addNewRow}
          className="bg-yellow-400 text-gray-900 font-metropolis font-semibold px-5 py-2 rounded-md shadow-lg hover:bg-yellow-500 transition duration-300">
          + Add Assignments
        </Button>
      </div>

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

      {/* Buttons inside the form */}
      {isDeleteModalOpen && assignemntsToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-auto">
            <h2 className="text-xl font-metropolis font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-4 font-metropolis font-medium">
              Are you sure you want to delete the Assignment {" "}
              <strong>
                {assignemntsToDelete?.courseAssignmentQuestionName?.charAt(0).toUpperCase() +
                  assignemntsToDelete?.courseAssignmentQuestionName?.slice(1).toLowerCase() || "this course"}
              </strong>
              ?
            </p>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                onClick={handleCancelDelete}
                className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 transition-all duration-500 ease-in-out 
               rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAssignment}
                className="bg-custom-gradient-btn text-white px-4 py-2 
                transition-all duration-500 ease-in-out 
               rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="ag-theme-quartz font-poppins" 
      style={{ height: "70vh", width: "94%" }}>
        <AgGridReact
          rowSelection="multiple"
          suppressRowClickSelection
          suppressMovableColumns
          loading={loading}
          columnDefs={colDefs}
          rowData={courseAssignments}
          defaultColDef={{ editable, sortable: true, filter: true, resizable: true }}
          animateRows
        />
      </div>

        {/* Pagination Controls */}
             <div className="flex justify-center items-center mt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className={`px-4 py-2 rounded-l-md border bg-gray-300 text-gray-700 hover:bg-gray-400 ${currentPage === 1 && "cursor-not-allowed opacity-50"
                  }`}
              >
                Previous
              </button>
              <span className="px-4 py-2 border-t border-b text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className={`px-4 py-2 rounded-r-md border bg-gray-300 text-gray-700 hover:bg-gray-400 ${currentPage === totalPages && "cursor-not-allowed opacity-50"
                  }`}
              >
                Next
              </button>
            </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[#800px]">
            <h2 className="text-lg font-semibold mb-4">
              {editingAssignment ? "Edit Assignment" : "Add Assignment"}
            </h2>
            <form>
              <div className="mb-4">
                <label className="block font-metropolis font-medium">Batch Name <span className="text-red-500">*</span></label>
                <Select
                  options={batch.map((b) => ({
                    value: b.id,
                    label: b.batchName,
                  }))}
                  value={newAssignment.batchId ? {
                    value: newAssignment.batchId,
                    label: batch.find((b) => b.id === newAssignment.batchId)?.batchName,
                  } : null
                  }
                  onChange={(selectedOption) => {
                    setNewAssignment({
                      ...newAssignment,
                      batchId: selectedOption ? selectedOption.value : "",
                    });
                  }}
                  className="w-full rounded font-metropolis text-gray-700"
                  placeholder="Select Batch"
                  isSearchable={true}
                />
              </div>

              <div className="mb-4">
                <label className="block font-metropolis font-medium">Course Name <span className="text-red-500">*</span></label>
                <Select
                  options={course.map((c) => ({
                    value: c.id,
                    label: c.courseName,
                  }))}
                  value={
                    newAssignment.courseId
                      ? {
                        value: newAssignment.courseId,
                        label: course.find((c) => c.id === newAssignment.courseId)?.courseName,
                      }
                      : null
                  }
                  onChange={(selectedOption) => {
                    setNewAssignment({
                      ...newAssignment,
                      courseId: selectedOption ? selectedOption.value : "",
                    });
                  }}
                  className="w-full rounded font-metropolis text-gray-700"
                  placeholder="Select Course"
                  isSearchable={true}
                />
              </div>

              <div className="mb-4">
                <label className="block font-metropolis font-medium">Assignment Name <span className="text-red-500">*</span></label>
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
                <label className="block font-metropolis font-medium">Assignment File <span className="text-red-500">*</span></label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full"
                />
              </div>

              <div className="mb-4">
                <label className="block font-metropolis font-medium">Total Marks <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  placeholder="Total Marks"
                  value={newAssignment.totalMarks}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      totalMarks: parseInt(e.target.value),
                    })
                  }
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block font-metropolis font-medium mb-2">Trainer <span className="text-red-500">*</span></label>
                <Select
                  options={trainer.map((t) => ({
                    value: t.id, // Trainer ID
                    label: t.trainerName, // Trainer Name
                  }))}
                  value={
                    newAssignment.trainerId
                      ? {
                        value: newAssignment.trainerId,
                        label: trainer.find((t) => t.id === newAssignment.trainerId)?.trainerName,
                      }
                      : null
                  }
                  onChange={(selectedOption) => {
                    setNewAssignment({
                      ...newAssignment,
                      trainerId: selectedOption ? selectedOption.value : "", // Handle null when deselected
                    });
                  }}
                  className="w-full rounded font-metropolis text-gray-700"
                  placeholder="Select Trainer"
                  isSearchable={true} // Enables search functionality
                />
              </div>
              <div className="flex gap-12 mb-4">
                <div className="mb-4">
                  <label className="block font-metropolis font-medium">Assignment Uploaded <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    placeholder="Assignment Uploaded"
                    value={newAssignment.assignStartDate}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        assignStartDate: e.target.value,
                      })
                    }
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>

                <div className="mb-4">
                  <label className="block font-metropolis font-medium">Final Submission <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    placeholder="Final Submission"
                    value={newAssignment.assignEndDate}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        assignEndDate: e.target.value,
                      })
                    }
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <Button
                  onClick={handleFormSubmit}
                  className="bg-custom-gradient-btn text-white px-4 py-2 
                transition-all duration-500 ease-in-out 
               rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
                >
                  {editingAssignment ? "Update Course" : "Create Course"}
                </Button>
                <Button
                  onClick={handleModalClose}
                  className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 transition-all duration-500 ease-in-out 
               rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
                >
                  Cancel
                </Button>
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

