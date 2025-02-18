import { Button } from "../../ui/button";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import { ColDef } from "ag-grid-community";
import Select from 'react-select';
import { useDropzone } from "react-dropzone";
import Batch from '../../../assets/Batch.png';
import Module from '../../../assets/Module.png';
import remove from '../../../assets/delete.png';
import { useNavigate, useLocation } from "react-router-dom";

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
  id: number;
  courseName: string;
  courseDesc: string;
  courseCategoryId: number;
  courseCategory: string;
  courseImg: string;
  courseLink: string;
  createdByUserName: string;
  moduleCount: number;
}

interface courseCategoryOptions {
  id: any;
  courseCategory: any;
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
  const [breadcrumbTrail, setBreadcrumbTrail] = useState<string[]>(["Courses"]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [courseToDelete, setCourseToDelete] = useState<CourseData | null>(null);
  const [newCourse, setNewCourse] = useState<CourseData>({
    id: 0,
    courseName: "",
    courseDesc: "",
    courseCategoryId: 0,
    courseCategory: "",
    courseImg: "",
    courseLink: "",
    createdByUserName: "",
    moduleCount: 10,
  });


  const navigate = useNavigate();
  const location = useLocation();

  const breadcrumbMap: { [key: string]: string } = {
    "/admin/course": "Courses",
    "/admin/batch-management": "Batch Management",
    "/admin/manage-batch-schedules": "Manage Batch Schedules",
  };

  const breadcrumbLabel = breadcrumbMap[location.pathname] || "Dashboard";

  const viewBatch = (data: CourseData) => {
    navigate(`/admin/batch-management?courseId=${data.id}`);
    setBreadcrumbTrail(["Courses", "Batch Management"]);
  };



  // Convert file to base64 with prefix
  const convertFileToBase64 = (file: File) => {
    const reader = new FileReader();
    return new Promise<string>((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file); // Convert file to base64 with prefix
    });
  };

  // When an image is dropped/uploaded
  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]; // Handle single file upload
    setUploadedFile(file);

    // Convert the file to base64
    convertFileToBase64(file).then((base64) => {
      setNewCourse({ ...newCourse, courseImg: base64 });
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false, // Single file upload
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
      const moduleCountMap: Record<number, number> = {};
      moduleResponse.forEach((module: any) => {
        const { courseId, sequence } = module;
        if (!moduleCountMap[courseId] || sequence > moduleCountMap[courseId]) {
          moduleCountMap[courseId] = sequence; // Store the highest sequence
        }
      });

      const courses = response.map((course: any) => ({
        id: course.id,
        courseName: course.courseName,
        courseDesc: course.courseDesc,
        courseCategory: course.category?.courseCategory || "Unknown",
        courseCategoryId: course.courseCategoryId || 0,
        courseImg: course.courseImg,
        courseLink: course.courseLink,
        createdByUserName: course.user
          ? `${course.user.firstName} ${course.user.lastName}`
          : "Unknown",
        moduleCount: moduleCountMap[course.id] || 0, // Assign computed module count
      }));

      const responseCategory = await fetchCourseCategoryApi();
      const courseCategory = responseCategory.map((category: any) => ({
        id: category.id,
        courseCategory: category.courseCategory
      }));
      setCourseCategory(courseCategory);

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
      id: 0,
      courseName: "",
      courseDesc: "",
      courseCategoryId: 0,
      courseCategory: "",
      courseImg: "",
      courseLink: "",
      createdByUserName: "",
      moduleCount: 10
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

  // Edit a course
  const editCourse = (data: any) => {
    const courseToEdit = courseData.find((course) => course.id === data.data.id);
    if (courseToEdit) {
      // Navigate to the course module page with the courseId as a query parameter
      navigate(`/admin/course-module?courseId=${courseToEdit.id}`);
    }
  };

  // Close the modal
  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewCourse({
      id: 0,
      courseName: "",
      courseDesc: "",
      courseCategoryId: 0,
      courseCategory: "",
      courseImg: "",
      courseLink: "",
      createdByUserName: "",
      moduleCount: 10
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

  // Define column definitions for the grid
  useEffect(() => {
    setColDefs([
      { headerName: "Course Name", field: "courseName", editable: false, width: 220 },
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
            <Button
              onClick={() => viewBatch(params.data)}
              className="text-[#6E2B8B] bg-white hover:bg-white p-2"
            >
              <img src={Batch} alt="Batch Icon" className="h-6 w-6 filter fill-current text-[#6E2B8B]" />
            </Button>

            <Button
              onClick={() => editCourse(params)}
              className="text-[#6E2B8B] bg-white hover:bg-white p-2"
            >
              <img src={Module} alt="Module Icon" className="h-6 w-6 filter fill-current text-[#6E2B8B]" />
            </Button>

            <Button
              onClick={() => confirmDeleteCourse(params.data)}
              className="text-red-600 bg-white hover:bg-white p-2"
            >
              <img src={remove} alt="remove Icon" className="h-6 w-6 filter fill-current text-[#6E2B8B]" />
            </Button>


          </div>
        ),
        editable: false,
      },
    ]);
  }, [courseData])


  return (

    <div className="flex-1 p-4 mt-5 ml-20">
      <div className="text-gray-600 text-lg mb-4">
        <span className="text-blue-600">{breadcrumbLabel}</span>
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
                onClick={handleCancelDelete}
                className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 transition-all duration-500 ease-in-out 
               rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteCourse}
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

      <div className="ag-theme-quartz" style={{ height: "70vh", width: "94%" }}>
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
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-metropolis font-semibold">{editing ? "Edit Course" : "Add New Course"}</h2>
            <form>
              <div className="mb-4 mt-4">
                <label className="block font-metropolis font-medium">Course Name</label>
                <input
                  type="text"
                  className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
                  value={newCourse.courseName}
                  onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block font-metropolis font-medium">Description</label>
                <input
                  type="text"
                  className="w-full border rounded p-2 font-metropolis text-gray-400 font-semibold"
                  value={newCourse.courseDesc}
                  onChange={(e) => setNewCourse({ ...newCourse, courseDesc: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block font-metropolis font-medium">Category</label>
                <Select
                  options={courseCategory.map((course) => ({
                    value: course.id,
                    label: course.courseCategory,
                  }))}
                  value={
                    newCourse.courseCategoryId
                      ? {
                        value: newCourse.courseCategoryId,
                        label: courseCategory.find((course) => course.id === newCourse.courseCategoryId)?.courseCategory || "Unknown",
                      }
                      : null
                  }
                  onChange={(selectedOption) => {
                    setNewCourse({
                      ...newCourse,
                      courseCategoryId: selectedOption ? selectedOption.value : 0, // Update `courseCategoryId` with the selected category's `id`
                    });
                  }}
                  className="w-full rounded mt-1 font-metropolis text-gray-700"
                  placeholder="Select Category"
                  isSearchable={true}
                />
              </div>
              {/* 
              <div className="mb-4 mt-4">
                 <label className="block font-metropolis font-medium">Course Page</label>
                 <input
                  type="text"
                  placeholder="paste page URL"
                  className="w-full border mt-1 rounded p-2 font-metropolis text-gray-700"
                  value={newCourse.courseLink}
                  onChange={(e) => setNewCourse({ ...newCourse, courseLink: e.target.value })}
                />
              </div> */}
              <div className="mb-4">
                <label className="block font-metropolis font-medium">
                  Course Image
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded p-4 mt-1 h-28 text-center cursor-pointer 
                ${isDragActive ? "border-blue-500" : "border-gray-300"}`}
                >
                  <input {...getInputProps()} />
                  {uploadedFile ? (
                    <p className="text-green-600 font-metropolis font-semibold mt-6">
                      {uploadedFile.name}
                    </p>
                  ) : newCourse.courseImg ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={newCourse.courseImg}
                        alt="Course"
                        className="h-20 w-20 object-cover rounded"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-400 font-semibold mt-3">
                      Drag & drop a file here, or click to select one
                    </p>
                  )}
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={handleFormSubmit}
                  className="bg-custom-gradient-btn text-white px-4 py-2 
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