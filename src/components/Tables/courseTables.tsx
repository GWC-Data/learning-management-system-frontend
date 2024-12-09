import { Button } from "../../components/ui/button";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Edit, Trash } from "lucide-react";
import axios from "axios";

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
  courseInstructorId: number;
}

// Column definitions type from AG-Grid
import { ColDef } from "ag-grid-community";

// Helper to get token
const getToken = () => localStorage.getItem("authToken");

const CourseTable = ({ editable = true }: CourseTableProps) => {
  const [courseData, setCourseData] = useState<CourseData[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [colDefs, setColDefs] = useState<ColDef[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newCourse, setNewCourse] = useState<CourseData>({
    id: 0,
    courseName: "",
    courseDesc: "",
    courseCategoryId: 0,
    courseInstructorId: 0,
  });

  // Fetch courses
  const fetchCourses = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to view courses.");
      return;
    }

    try {
      const response = await axios.get(`/course`);
      console.log("Fetched courses:", response.data);
      setCourseData(response.data.course || []);
    } catch (error) {
      console.error("Failed to fetch courses", error);
      toast.error("Failed to fetch courses. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get("/coursecategory");
      console.log('respp', response.data);
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories", error);
      toast.error("Failed to fetch categories. Please try again later.");
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, []);

  const addNewRow = () => {
    setEditing(false);
    setNewCourse({
      id: 0,
      courseName: "",
      courseDesc: "",
      courseCategoryId: 0,
      courseInstructorId: 0,
    });
    setIsModalOpen(true);
  };

  const deleteCourse = async (data: any) => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to delete a course.");
      return;
    }

    const courseId = data.data.id;
    try {
      await axios.delete(`/course/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCourseData((prev) => prev.filter((course) => course.id !== courseId));
      toast.success("Course deleted successfully!");
    } catch (error) {
      console.error("Failed to delete course", error);
      toast.error("Failed to delete the course. Please try again later.");
    }
  };

  const editCourse = (data: any) => {
    const courseToEdit = courseData.find((course) => course.id === data.data.id);
    console.log("Course to edit:", courseToEdit);
    if (courseToEdit) {
      setEditing(true);
      setNewCourse(courseToEdit);
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewCourse({
      id: 0,
      courseName: "",
      courseDesc: "",
      courseCategoryId: 0,
      courseInstructorId: 0,
    });
  };

  const handleFormSubmit = async () => {
    const token = getToken();
    console.log('token', token);
    
    if (!token) {
      toast.error("You must be logged in to perform this action.");
      return;
    }

    if (editing) {
      if (!newCourse.id) {
        console.error("Course ID is missing for update.");
        toast.error("Course ID is missing.");
        return;
      }

      try {
        const response = await axios.put(`/course/${newCourse.id}`, newCourse, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const updatedCourse = response.data;
        setCourseData((prev) =>
          prev.map((course) =>
            course.id === newCourse.id ? updatedCourse : course
          )
        );

        toast.success("Course updated successfully!");
      } catch (error) {
        console.error("Failed to update course", error);
        toast.error("Failed to update the course. Please try again later.");
      }
    } else {

      if (!newCourse.courseName || !newCourse.courseDesc || newCourse.courseCategoryId === 0 || newCourse.courseInstructorId === 0) {
        toast.error("Please fill in all the required fields.");
        return;
      }
      
      try {
        const response = await axios.post(`/course`, newCourse, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('response', response.data);
        const newCourseData = response.data;
        setCourseData((prev) => [...prev, newCourseData]);
        toast.success("Course added successfully!");
      } catch (error) {
        console.error("Failed to add course", error);
        toast.error("Failed to add the course. Please try again later.");
      }
    }

    await fetchCourses();
    handleModalClose();
  };

  useEffect(() => {
    setColDefs([
      { headerName: "Course Name", field: "courseName", editable: false },
      { headerName: "Description", field: "courseDesc", editable: false, width: 450 },
      { headerName: "Category ID", field: "courseCategoryId", editable: false, width: 180 },
      { headerName: "Instructor ID", field: "courseInstructorId", editable: false, width: 180 },
      {
        headerName: "Actions",
        field: "actions",
        cellRenderer: (params: any) => (
          <div className="flex space-x-2">
            <Button
              onClick={() => editCourse(params)}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
            >
              <Edit className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => deleteCourse(params)}
              className="bg-red-500 text-white p-2 rounded hover:bg-red-700"
            >
              <Trash className="h-5 w-5" />
            </Button>
          </div>
        ),
        editable: false,
      },
    ]);
  }, [courseData]);

  return (
    <div className="flex-1 p-4 mt-10 ml-10">
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 text-white px-6 py-4 rounded-lg shadow-lg mb-6 w-[1115px]">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold tracking-wide">Courses</h2>
          <p className="text-sm font-light">Manage courses easily.</p>
        </div>
        <Button
          onClick={addNewRow}
          className="bg-yellow-400 text-gray-900 font-semibold px-5 py-2 rounded-md shadow-lg hover:bg-yellow-500 transition duration-300"
        >
          + New Course
        </Button>
      </div>

      <div className="ag-theme-quartz text-left" style={{ height: "calc(100vh - 180px)", width: "89%" }}>
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
            <h2 className="text-xl font-bold mb-4">{editing ? "Edit Course" : "Add New Course"}</h2>
            <form>
              <div className="mb-4">
                <label className="block font-medium">Course Name</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={newCourse.courseName}
                  onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium">Description</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={newCourse.courseDesc}
                  onChange={(e) => setNewCourse({ ...newCourse, courseDesc: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium">Category</label>
                <select
                  className="w-full border rounded p-2"
                  value={newCourse.courseCategoryId}
                  onChange={(e) => setNewCourse({ ...newCourse, courseCategoryId: Number(e.target.value) })}
                >
                  <option value={0} className="text-black">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.id}
                    </option>
                  ))}

                </select>
              </div>
              <div className="mb-4">
                <label className="block font-medium">Instructor ID</label>
                <input
                  type="number"
                  className="w-full border rounded p-2"
                  value={newCourse.courseInstructorId}
                  onChange={(e) => setNewCourse({ ...newCourse, courseInstructorId: Number(e.target.value) })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={handleModalClose}
                  className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFormSubmit}
                  className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-700"
                >
                  {editing ? "Update" : "Create"}
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
