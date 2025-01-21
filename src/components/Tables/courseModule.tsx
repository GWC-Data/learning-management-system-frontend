import { Button } from "../../components/ui/button";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Edit, Trash } from "lucide-react";
import { ColDef } from "ag-grid-community";
 
import {
  createCourseApi,
  fetchCourseApi,
  updateCourseApi,  
  deleteCourseApi,
} from "@/api/courseApi";
 
import { fetchCourseCategoryApi } from "@/api/courseCategoryApi";
// import { fetchUsersApi } from "@/api/userApi";
 
// TypeScript types for the component props
interface CourseTableProps {
  editable?: boolean;
}
 
// TypeScript types for course data
interface CourseData {
  id: number;
  courseName: string;
  courseDesc: string;
  courseCategoryId: number;
  courseCategory: string;
}
 
interface courseCategoryOptions {
  id: any;
  courseCategory: any;
}
 
// interface instructorOptions{
//   id: any;
//   fullName: any;
// }
 
// Helper to get the token from local storage
const getToken = () => localStorage.getItem("authToken");
 
const CourseTable = ({ editable = true }: CourseTableProps) => {
  const [courseData, setCourseData] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [colDefs, setColDefs] = useState<ColDef[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [courseCategory, setCourseCategory] = useState<courseCategoryOptions[]>([]);
  // const [instructor, setInstructor] = useState<instructorOptions[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [courseToDelete, setCourseToDelete] = useState< CourseData | null>(null);
  const [newCourse, setNewCourse] = useState<CourseData>({
    id: 0,
    courseName: "",
    courseDesc: "",
    courseCategoryId: 0,
    courseCategory: "",
  });
 
  const validateFields = () => {
    const newErrors: Record<string, string> = {};
   
    if (!newCourse.courseName) newErrors.courseName = 'courseName is required.';
    if (!newCourse.courseDesc) newErrors.courseDesc = 'courseDesc is required.';
    if (!newCourse.courseCategoryId) newErrors.courseCategoryId = 'courseCategory is required.';
 
    setErrors(newErrors);
 
    Object.entries(newErrors).forEach(([field, message]) => {
      toast.error(`${field}: ${message}`);
    });
 
    return newErrors;
  }
 
  // Fetch courses
  const fetchCourses = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to view courses.");
      return;
    }
 
    try {
 
      const reponse = await fetchCourseApi();
      const courses = reponse.map((course: any) => ({
        id: course.id,
        courseName: course.courseName,
        courseDesc: course.courseDesc,
        courseCategory: course.category?.courseCategory || "Unknown",
        courseCategoryId: course.courseCategoryId || 0,
      }));
 
      const responseCategory = await fetchCourseCategoryApi();
        const courseCategory = responseCategory.map((category: any)=>({
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
          console.error("Failed to delete course", error);
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
      setEditing(true);
      setNewCourse(courseToEdit);
      setIsModalOpen(true);
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
    });
  };
 
  // Handle form submission (Create or Update)
  const handleFormSubmit = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to perform this action.");
      return;
    }
 
    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      return; // Stop further execution if errors exist
    }
 
    const courseToSubmit = {
      courseName: newCourse.courseName,
      courseDesc: newCourse.courseDesc,
      courseCategoryId: newCourse.courseCategoryId
    };
 
    try {
      if (editing) {
 
        const updatedCourse = await updateCourseApi(newCourse.id, courseToSubmit);
 
        fetchCourses();
 
        setCourseData((prev) =>
          prev.map((course) =>
            course.id === newCourse.id ? { ...course, ...updatedCourse } : course
          )
        );
 
        toast.success("Course updated successfully!");
 
      } else {
 
        const newCourseData = await createCourseApi(courseToSubmit);
        fetchCourses();
        setCourseData((prev) => [...prev, newCourseData]);
 
        toast.success("Course added successfully!");
      }
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
      { headerName: "Description", field: "courseDesc", editable: false, width: 550 },
      { headerName: "Course Category", field: "courseCategory", editable: false, width: 250 },
      {
        headerName: "Actions",
        field: "actions",
        cellRenderer: (params: any) => (
          <div className="flex space-x-2">
            <Button onClick={() => editCourse(params)} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700">
              <Edit className="h-5 w-4" />
            </Button>
            <Button onClick={() => confirmDeleteCourse(params.data)} className="bg-red-500 p-2 rounded hover:bg-red-700 text-white">
              <Trash className="h-5 w-5" />
            </Button>
          </div>
        ),
        editable: false,
      },
    ]);
  }, [courseData]);
 
  // Unique categories and instructors
  const uniqueCategories = Array.from(
    new Map(courseData.map((course) => [course.courseCategory, course.courseCategoryId]))
  );
 
 
  return (
    <div className="flex-1 p-4 mt-10 ml-24">
      <div className="flex items-center justify-between bg-custom-gradient text-white px-6 py-4 rounded-lg shadow-lg mb-6 w-[1147px]">
      <div className="flex flex-col">
          <h2 className="text-2xl font-metropolis font-semibold tracking-wide">Courses</h2>
          <p className="text-sm font-metropolis font-medium">Manage course easily.</p>
        </div>
        <Button onClick={addNewRow} className="bg-yellow-400 text-gray-900 font-metropolis font-semibold ">
          + New Course
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
      <div className="ag-theme-quartz" style={{ height: "70vh", width: "88%" }}>
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
                <select
                  className="w-full border rounded p-2 font-metropolis text-gray-400 font-semibold"
                  value={newCourse.courseCategoryId}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      courseCategoryId: parseInt(e.target.value, 10),
                      courseCategory:
                        uniqueCategories.find(([_, id]) => id === parseInt(e.target.value, 10))?.[0] || "",
                    })
                  }
                >
                  <option value="">Select Category</option>
                  {courseCategory.map((category) => (
                    <option key={category.courseCategory} value={category.id}>
                      {category.courseCategory}
                    </option>
                  ))}
                </select>
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