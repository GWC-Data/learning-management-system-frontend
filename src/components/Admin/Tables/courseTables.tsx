import { Button } from "../../ui/button";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import { ColDef } from "ag-grid-community";
import Select from 'react-select';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../../../components/ui/tooltip";
import { useDropzone } from "react-dropzone";
import Batch from '../../../assets/Batch.png';
import Module from '../../../assets/Module.png';
import remove from '../../../assets/delete.png';
import { useNavigate } from "react-router-dom";
import Breadcrumb from "./breadcrumb";
import {
  createCourseApi,
  fetchCourseApi,
  updateCourseApi,
  deleteCourseApi,
} from "@/helpers/api/courseApi";
import { fetchCourseCategoryApi } from "@/helpers/api/courseCategoryApi";
import { fetchCourseModuleApi } from "@/helpers/api/courseModuleApi";

// TypeScript types for the component props
interface CourseTableProps {
  editable?: true;
}

// TypeScript types for course data
interface CourseData {
  id: string;
  courseName: string;
  courseDesc: string;
  courseCategoryId: string | string[];
  coursecategoryName: string | string[];
  courseImg: File | string;
  courseLink: string;
  createdByUserName: string;
  moduleCount: number;
}

interface courseCategoryOptions {
  id: any;
  coursecategoryName: string;
}

// Helper to get the token from local storage
const getToken = () => localStorage.getItem("authToken");

const CourseTable = ({ editable = true }: CourseTableProps) => {
  const [courseData, setCourseData] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [colDefs, setColDefs] = useState<ColDef[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [courseCategory, setCourseCategory] = useState<courseCategoryOptions[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [courseToDelete, setCourseToDelete] = useState<CourseData | null>(null);
  const [newCourse, setNewCourse] = useState<CourseData>({
    id: "",
    courseName: "",
    courseDesc: "",
    courseCategoryId: [],
    coursecategoryName: "",
    courseImg: "",
    courseLink: "",
    createdByUserName: "",
    moduleCount: 0,
  });

  const navigate = useNavigate();

  const viewBatch = (data: CourseData) => {
    navigate(`/admin/batch-management?courseId=${data.id}`);
  };

  //Image upload
  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setUploadedFile(file);
    setNewCourse({ ...newCourse, courseImg: file });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  {/* pagination */ }
  const recordsPerPage = 10;
  const totalPages = Math.ceil(courseData.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentData = courseData.slice(startIndex, startIndex + recordsPerPage);

  const handlePageChange = (newPage: SetStateAction<number>) => {
    setCurrentPage(newPage);
  };

  const fetchCourses = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to view courses.");
      return;
    }

    try {
      const response = await fetchCourseApi();
      const moduleResponse = await fetchCourseModuleApi();

      // Compute highest sequence for each courseId
      const moduleCountMap: Record<string, number> = {};

      moduleResponse.forEach((module: any) => {
        const { courseId, sequence } = module;

        // Ensure courseId and sequence exist
        if (!courseId || sequence === undefined) {
          console.warn("Skipping module due to missing courseId or sequence:", module);
          return;
        }

        // Parse the sequence to number (if string)
        const seqNum = parseInt(sequence, 10) || 0;

        // Check if the current sequence is higher than the stored one
        if (!moduleCountMap[courseId] || seqNum > moduleCountMap[courseId]) {
          moduleCountMap[courseId] = seqNum;
        }
      });

      // Map the highest sequence back to the response
      const modifiedResponse = moduleResponse.map((module: any) => ({
        ...module,
        highestSequence: moduleCountMap[module.courseId] || 0,
      }));

      console.log("Final Response with Highest Sequence:", modifiedResponse);


      const courses = response.map((course: any) => ({
        id: course.courseId || "",
        courseName: course.courseName,
        courseDesc: course.courseDesc,
        courseCategory: course.coursecategory?.coursecategoryName || "Unknown",
        courseCategoryId: course.courseCategoryId || "",
        courseImg: course.courseImg,
        courseLink: course.courseLink,
        createdByUserName: course.createdByUserName,
        moduleCount: moduleCountMap[course.courseId] || 0,
      }));

      console.log("finalized data", courses);

      const responseCategory = await fetchCourseCategoryApi();
      const courseCategory = responseCategory.map((category: any) => ({
        id: category.id,
        coursecategoryName: category.coursecategoryName
      }));
      setCourseCategory(courseCategory);
      console.log("coursecateogry", courseCategory);

      setCourseData(courses);
    } catch (error) {
      console.error("Failed to fetch courses", error);
      toast.error("Failed to fetch courses. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Open modal to add a new course
  const addNewRow = () => {
    setEditing(false);
    setNewCourse({
      id: "",
      courseName: "",
      courseDesc: "",
      courseCategoryId: [],
      coursecategoryName: "",
      courseImg: "",
      courseLink: "",
      createdByUserName: "",
      moduleCount: 0
    });
    setIsModalOpen(true);
  };

  const confirmDeleteCourse = (data: CourseData) => {
    const course = courseData.find((course) => course.id === data.id);
    if (course) {
      setCourseToDelete(course);
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) {
      toast.error("No course Selected for deletion")
      return;
    }

    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to delete a course.");
      return;
    }

    try {

      await deleteCourseApi(courseToDelete.id);
      setCourseData((prev) => prev.filter((course) => course.id !== courseToDelete.id));
      toast.success("Course deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete the course. Please try again later.");
    } finally {
      setIsDeleteModalOpen(false);
      setCourseToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setCourseToDelete(null);
  };

  // view a module
  const viewModule = (data: any) => {
    const viewModule = courseData.find((course) => course.id === data.data.id);
    if (viewModule) {
      // Navigate to the course module page with the courseId as a query parameter
      navigate(`/admin/course-module?courseId=${viewModule.id}`);
    }
  };

  // Close the modal
  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewCourse({
      id: "",
      courseName: "",
      courseDesc: "",
      courseCategoryId: [],
      coursecategoryName: "",
      courseImg: "",
      courseLink: "",
      createdByUserName: "",
      moduleCount: 0
    });
  };

  // Handle form submission (Create or Update)
  const handleFormSubmit = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to perform this action.");
      return;
    }

    try {

      if (editing) {

        await updateCourseApi(newCourse.id, {
          courseName: newCourse.courseName,
          courseDesc: newCourse.courseDesc,
          courseCategoryId: newCourse.courseCategoryId,
          courseImg: newCourse.courseImg,
          courseLink: newCourse.courseLink,
        });
        fetchCourses();
        toast.success("Course updated successfully!");

      } else {

        await createCourseApi({
          courseName: newCourse.courseName,
          courseDesc: newCourse.courseDesc,
          courseCategoryId: newCourse.courseCategoryId,
          courseImg: newCourse.courseImg,
          courseLink: newCourse.courseLink,
        });
        toast.success("Course added successfully!");
      }
      fetchCourses();
    } catch (error) {
      console.error("Failed to update course", error);
      toast.error("Failed to update the course. Please try again later.");
    }

    handleModalClose();
  };


  useEffect(() => {
    setColDefs([
      { headerName: "Course Name", field: "courseName", editable: false, width: 220, },
      { headerName: "Description", field: "courseDesc", editable: false, width: 470 },
      //       { headerName: "Course Category", field: "courseCategory", editable: false, width: 250 },
      // { headerName: "Course Image", field: "courseImg", editable: false, width: 200},
      { headerName: "Created By", field: "createdByUserName", editable: false, width: 140 },
      { headerName: "Module Count", field: "moduleCount", editable: false, width: 150 },
      {
        headerName: "Actions",
        field: "actions",
        width: 180,
        cellRenderer: (params: any) => (
          <div className="flex space-x-2">
            <TooltipProvider>
              <Button onClick={() => viewModule(params)} className="text-[#6E2B8B] bg-white hover:bg-white p-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <img src={Module} alt="Module Icon" className="h-6 w-6 filter fill-current text-[#6E2B8B]" />
                  </TooltipTrigger>
                  <TooltipContent>View Module</TooltipContent>
                </Tooltip>
              </Button>

              <Button onClick={() => viewBatch(params.data)} className="text-[#6E2B8B] bg-white hover:bg-white p-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <img src={Batch} alt="Batch Icon" className="h-6 w-6 filter fill-current text-[#6E2B8B]" />
                  </TooltipTrigger>
                  <TooltipContent>View Batch</TooltipContent>
                </Tooltip>
              </Button>

              <Button onClick={() => confirmDeleteCourse(params.data)} className="text-red-600 bg-white hover:bg-white p-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <img src={remove} alt="Remove Icon" className="h-6 w-6 filter fill-current text-[#6E2B8B]" />
                  </TooltipTrigger>
                  <TooltipContent>Delete Course</TooltipContent>
                </Tooltip>
              </Button>
            </TooltipProvider>
          </div>
        ),
        editable: false,
      },
    ]);
  }, [courseData])


  return (

    <div className="flex-1 p-4 mt-5 ml-20">
      <div className="text-gray-600 text-lg mb-4">
        <Breadcrumb />
      </div>
      <div className="flex items-center justify-between bg-[#6E2B8B] text-white px-6 py-4 rounded-lg shadow-lg mb-6 w-[1159px]">
        <div className="flex flex-col">
          <h2 className="text-2xl font-metropolis font-semibold tracking-wide">Course Management</h2>
          <p className="text-sm font-metropolis font-medium">Manage courses easily.</p>
        </div>
        <Button onClick={addNewRow}
          className="bg-yellow-400 text-gray-900 font-metropolis font-semibold px-5 py-2 rounded-md shadow-lg hover:bg-yellow-500 transition duration-300">
          + Add Course
        </Button>
      </div>


      {isDeleteModalOpen && courseToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-auto">
            <h2 className="text-xl font-metropolis font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-4 font-metropolis font-medium">
              Are you sure you want to delete the course {" "}
              <strong>
                {courseToDelete?.courseName?.charAt(0).toUpperCase() +
                  courseToDelete?.courseName?.slice(1).toLowerCase() || "this course"}
              </strong>
              ?
            </p>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                onClick={handleDeleteCourse}
                className="bg-[#6E2B8B] hover:bg-[#8536a7] text-white px-4 py-2 
                transition-all duration-500 ease-in-out 
               rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
              >
                Delete
              </Button>
              <Button
                onClick={handleCancelDelete}
                className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 transition-all duration-500 ease-in-out 
               rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="ag-theme-quartz font-poppins"
        style={{ height: "70vh", width: "91%" }}>
        <AgGridReact
          rowSelection="multiple"
          suppressRowClickSelection
          suppressMovableColumns
          loading={loading}
          columnDefs={colDefs}
          rowData={courseData}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[450px]">
            <h2 className="text-xl font-metropolis font-semibold">{editing ? "Edit Course" : "Add NewCourse"}</h2>
            <form>
              <div className="mb-4 mt-4">
                <label className="block font-metropolis font-medium">Course Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full border rounded font-metropolis mt-1 p-2 text-gray-400 font-semibold"
                  value={newCourse.courseName}
                  onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block font-metropolis font-medium">Description</label>
                <input
                  type="text"
                  className="w-full border rounded mt-1 p-2 font-metropolis text-gray-400 font-semibold"
                  value={newCourse.courseDesc}
                  onChange={(e) => setNewCourse({ ...newCourse, courseDesc: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block font-metropolis font-medium">
                  Category <span className="text-red-500">*</span>
                </label>
                <Select
                  isMulti
                  options={courseCategory.map((course) => ({
                    value: course.id,
                    label: course.coursecategoryName,
                  }))}
                  value={
                    newCourse.courseCategoryId
                      ? (Array.isArray(newCourse.courseCategoryId)
                        ? newCourse.courseCategoryId.map(categoryId => ({
                          value: categoryId,
                          label: courseCategory.find((course) => course.id === categoryId)?.coursecategoryName || "Unknown"
                        }))
                        : {
                          value: newCourse.courseCategoryId,
                          label: courseCategory.find((course) => course.id === newCourse.courseCategoryId)?.coursecategoryName || "Unknown"
                        }
                      )
                      : null
                  }
                  onChange={(selectedOptions) => {
                    setNewCourse({
                      ...newCourse,
                      courseCategoryId: selectedOptions
                        ? selectedOptions.map((option) => option.value) // Extract values correctly
                        : [],
                    });
                  }}
                  className="w-full rounded mt-1 font-metropolis text-gray-700"
                  placeholder="Select Categories"
                  isSearchable={true}
                />
              </div>

              <div className="mb-4 mt-4">
                <label className="block font-metropolis font-medium">Course Page</label>
                <input
                  type="text"
                  placeholder="paste page URL"
                  className="w-full border mt-1 rounded p-2 font-metropolis text-gray-700"
                  value={newCourse.courseLink}
                  onChange={(e) => setNewCourse({ ...newCourse, courseLink: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block font-metropolis font-medium">
                  Course Image <span className="text-red-500">*</span>
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded p-4 mt-1 h-30 text-center cursor-pointer 
    ${isDragActive ? "border-blue-500" : "border-gray-300"}`}
                >
                  <input {...getInputProps()} />

                  {/* ✅ Show Uploaded Image Preview (New File Upload) */}
                  {uploadedFile ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={URL.createObjectURL(uploadedFile)}
                        alt="Uploaded Course"
                        className="h-24 w-30 object-cover rounded border"
                      />
                      <p className="text-green-600 font-metropolis font-semibold mt-2">
                        {uploadedFile.name}
                      </p>
                    </div>
                  ) :
                    /* ✅ Show Existing Course Image from API (if available) */
                    newCourse.courseImg ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={typeof newCourse.courseImg === "string"
                            ? newCourse.courseImg
                            : URL.createObjectURL(newCourse.courseImg)}
                          alt="Course"
                          className="h-20 w-20 object-cover rounded border"
                        />
                        <p className="text-gray-500 font-metropolis font-semibold mt-4">
                          Existing Image
                        </p>
                      </div>
                    ) : (
                      /* ✅ Show Placeholder Text When No Image is Uploaded */
                      <p className="text-gray-400 font-semibold mt-3 p-4">
                        Drag & drop a file here, or click to select one
                      </p>
                    )}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  onClick={handleFormSubmit}
                  className="bg-[#6E2B8B] hover:bg-[#8536a7] text-white px-4 py-2 
                transition-all duration-500 ease-in-out 
               rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
                >
                  {editing ? "Update Course" : "Create Course"}
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
    </div>
  );
};

export default CourseTable;