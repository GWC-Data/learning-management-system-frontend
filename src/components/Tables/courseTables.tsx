import { useState, useEffect, SetStateAction } from "react";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { ChevronDown, Pencil } from "lucide-react";

import {
  createCourseApi,
  fetchCourseApi,
  updateCourseApi,
  deleteCourseApi,
} from "@/api/courseApi";
import { fetchCourseCategoryApi } from "@/api/courseCategoryApi";

interface CourseTableProps {
  onCourseSelect: (courseName: string) => void;
}

interface CourseData {
  id: number;
  courseName: string;
  courseDesc: string;
  courseCategoryId: number;
  courseCategory: string;
  courseImg: string;
  courseLink: string;
}

interface courseCategoryOptions {
  id: any;
  courseCategory: any;
}

const getToken = () => localStorage.getItem("authToken");

const CourseTable = ({ onCourseSelect }: CourseTableProps) => {
  const [courseData, setCourseData] = useState<CourseData[]>([]);
  const [courseCategory, setCourseCategory] = useState<courseCategoryOptions[]>(
    []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [editing, setEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newCourse, setNewCourse] = useState<CourseData>({
    id: 0,
    courseName: "",
    courseDesc: "",
    courseCategoryId: 0,
    courseCategory: "",
    courseImg: "",
    courseLink: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  {
    /* pagination */
  }
  const recordsPerPage = 10;
  const totalPages = Math.ceil(courseData.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentData = courseData.slice(startIndex, startIndex + recordsPerPage);

  const handlePageChange = (newPage: SetStateAction<number>) => {
    setCurrentPage(newPage);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredCourse = courseData.filter((course) =>
    course.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
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

  // Fetch courses and categories
  const fetchCourses = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to view courses.");
      return;
    }

    try {
      const courseResponse = await fetchCourseApi();
      const courses = courseResponse.map((course: any) => ({
        id: course.id,
        courseName: course.courseName,
        courseDesc: course.courseDesc,
        courseCategory: course.category?.courseCategory || "Unknown",
        courseCategoryId: course.courseCategoryId || 0,
        courseImg: course.courseImg,
        courseLink: course.courseLink,
      }));

      const categoryResponse = await fetchCourseCategoryApi();
      const categories = categoryResponse.map((category: any) => ({
        id: category.id,
        courseCategory: category.courseCategory,
      }));

      setCourseData(courses);
      setCourseCategory(categories);
    } catch (error) {
      console.error("Failed to fetch courses or categories", error);
      toast.error(
        "Failed to fetch courses or categories. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

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
    });
    setIsModalOpen(true);
  };

  const editCourse = (course: CourseData) => {
    setEditing(true);
    setNewCourse(course);
    setIsModalOpen(true);
  };

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
    });
  };

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
        toast.success("Course updated successfully!");
      } else {
        await createCourseApi({
          courseName: newCourse.courseName,
          courseDesc: newCourse.courseDesc,
          courseCategoryId: newCourse.courseCategoryId,
          courseImg: newCourse.courseImg,
          courseLink: newCourse.courseLink,
        });
        toast.success("Course created successfully!");
      }
      fetchCourses();
    } catch (error) {
      console.error("Failed to save course", error);
      toast.error("Failed to save course. Please try again later.");
    } finally {
      handleModalClose();
    }
  };

  //Delete course
  const handleDeleteCourse = async () => {
    try {
      await deleteCourseApi(newCourse.id);
      toast.success("Course deleted successfully.");
      fetchCourses();
      setLoading(true);
      handleModalClose();
    } catch (error) {
      toast.error("Failed to delete the course.");
    }
  };

  return (
    <div className="flex-1 p-6 mt-10 ml-1">
      <div>
        {/* Dropdown Button */}
        <Button
          className="w-72 flex justify-between items-center px-4 py-2 border bg-custom-gradient"
          onClick={toggleDropdown}
        >
          {selectedCourse ? selectedCourse : "Courses"}
          <ChevronDown className="ml-2 h-5 w-5" />
        </Button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <ul className="absolute w-72 border bg-white z-10 mt-1 max-h-48 overflow-auto shadow-lg text-black">
            {/* Add New Course Option */}
            {/* Search Input */}
            <li className="px-4 py-2">
              <input
                type="text"
                className="w-full border p-2 rounded"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </li>
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                addNewRow();
                setIsDropdownOpen(false);
                setSelectedCourse("+ New Course");
              }}
            >
              + New Course
            </li>

            {/* Course List with Edit Icons */}
            {filteredCourse.map((course) => (
              <li
                key={course.id}
                className="flex justify-between items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                // onClick={() => {
                //   setSelectedCourse(course.courseName);
                //   setIsDropdownOpen(false);
                // }}
                onClick={() => {
                  onCourseSelect(course.courseName);
                  setSelectedCourse(course.courseName);
                  setIsDropdownOpen(false);
                }}
              >
                <span>{course.courseName}</span>
                <Pencil
                  className="h-5 w-5 text-blue-500 cursor-pointer rounded-sm"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the parent click event
                    editCourse(course);
                    setIsDropdownOpen(false);
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <table className="table-auto w-full mt-4 border-collapse border border-gray-300 shadow-lg">
        <thead>
          <tr className="bg-gray-200 text-left text-gray-800">
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Description</th>
            <th className="border border-gray-300 px-4 py-2">Category</th>
            <th className="border border-gray-300 px-4 py-2">CourseImage</th>
            <th className="border border-gray-300 px-4 py-2">CourseLink</th>
            {/* <th className="border border-gray-300 px-4 py-2">Actions</th> */}
          </tr>
        </thead>
        <tbody>
          {currentData.map((course) => (
            <tr key={course.id} className="hover:bg-gray-100">
              <td className="border border-gray-300 px-4 py-2">
                {course.courseName}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {course.courseDesc}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {course.courseCategory}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {course.courseImg ? (
                  <img
                    src={course.courseImg}
                    alt="course"
                    className="w-full h-16 object-cover rounded"
                  />
                ) : (
                  <span>No images</span>
                )}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {course.courseLink ? (
                  <a
                    href={course.courseLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    {course.courseName}
                  </a>
                ) : (
                  <span className="text-gray-400">No Link</span>
                )}
              </td>
              {/* <td className="border border-gray-300 px-4 py-2 flex space-x-2">
                <button
                  onClick={() => editCourse(course)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Edit className="inline-block w-5 h-5" />
                </button>
                <button
                  onClick={() => deleteCourse(course.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash className="inline-block w-5 h-5" />
                </button>
              </td>  */}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-4">
        <button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          className={`px-4 py-2 rounded-l-md border bg-gray-300 text-gray-700 hover:bg-gray-400 ${
            currentPage === 1 && "cursor-not-allowed opacity-50"
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
          className={`px-4 py-2 rounded-r-md border bg-gray-300 text-gray-700 hover:bg-gray-400 ${
            currentPage === totalPages && "cursor-not-allowed opacity-50"
          }`}
        >
          Next
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-metropolis font-semibold">
              {editing ? "Edit Course" : "Add New Course"}
            </h2>
            <form>
              <div className="mb-4 mt-4">
                <label className="block font-metropolis font-medium">
                  Course Name
                </label>
                <input
                  type="text"
                  className="w-full border rounded p-2 font-metropolis text-gray-700"
                  value={newCourse.courseName}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, courseName: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block font-metropolis font-medium">
                  Description
                </label>
                <input
                  type="text"
                  className="w-full border rounded p-2 font-metropolis text-gray-700"
                  value={newCourse.courseDesc}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, courseDesc: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block font-metropolis font-medium">
                  Category
                </label>
                <select
                  className="w-full border rounded p-2 font-metropolis text-gray-700"
                  value={newCourse.courseCategoryId}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      courseCategoryId: parseInt(e.target.value, 10),
                    })
                  }
                >
                  <option value="">Select Category</option>
                  {courseCategory.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.courseCategory}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block font-metropolis font-medium">
                  Course Image
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded p-4 mt-2 h-28 text-center cursor-pointer
                ${isDragActive ? "border-blue-500" : "border-gray-300"}`}
                >
                  <input {...getInputProps()} />
                  {uploadedFile ? (
                    <p className="text-green-600 font-metropolis font-semibold mt-6">
                      {uploadedFile.name}
                    </p>
                  ) : (
                    <p className="text-gray-400 font-semibold">
                      Drag & drop a file here, or click to select one
                    </p>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <label className="block font-metropolis font-medium">CourseLink</label>
                <input
                  type="text"
                  className="w-full border rounded p-2 font-metropolis text-gray-700"
                  value={newCourse.courseLink}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, courseLink: e.target.value })
                  }
                />

              </div>
              <div className="flex space-x-4">
                <Button
                  onClick={handleFormSubmit}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  {editing ? "Update Course" : "Create Course"}
                </Button>
                <Button
                  onClick={handleModalClose}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Cancel
                </Button>
                {editing && (
                  <Button onClick={handleDeleteCourse} className="bg-red-500">
                    Delete
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseTable;
