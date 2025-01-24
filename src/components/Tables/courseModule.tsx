import { Button } from "../../components/ui/button";
import { SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, Pencil } from "lucide-react";

import {
  createCourseModuleApi,
  fetchCourseModuleApi,
  updateCourseModuleApi,
  deleteCourseModuleApi,
} from "@/api/courseModuleApi";
import { fetchCourseApi } from "@/api/courseApi";

interface CourseModuleTableProps {
  editable?: boolean;
}

interface CourseModuleData {
  id: number;
  courseId: number;
  moduleName: string;
  moduleDescription: string;
  courseName?: string; // Mapped course name from courseId
}

interface CourseOption {
  id: number;
  courseName: string;
}

const getToken = () => localStorage.getItem("authToken");

const CourseModuleTable = ({}: CourseModuleTableProps) => {
  const [courseModules, setCourseModules] = useState<CourseModuleData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // const [colDefs, setColDefs] = useState<ColDef[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editing, setEditing] = useState(false);
  const [selectedModule, setSelectedModule] = useState("");
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [newModule, setNewModule] = useState<CourseModuleData>({
    id: 0,
    courseId: 0,
    moduleName: "",
    moduleDescription: "",
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  {
    /* pagination */
  }
  const recordsPerPage = 15;
  const totalPages = Math.ceil(courseModules.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentData = courseModules.slice(
    startIndex,
    startIndex + recordsPerPage
  );

  const handlePageChange = (newPage: SetStateAction<number>) => {
    setCurrentPage(newPage);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredCourseModules = courseModules.filter((course) =>
    course.moduleName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchCourseModules = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to view course modules.");
      return;
    }

    try {
      const courses = await fetchCourseApi();
      const courseMap = courses.reduce(
        (map: Record<number, string>, course: any) => {
          map[course.id] = course.courseName;
          return map;
        },
        {}
      );

      setCourseOptions(
        courses.map((course: any) => ({
          id: course.id,
          courseName: course.courseName,
        }))
      );

      const modules = await fetchCourseModuleApi();
      const mappedModules = modules.map((module: any) => ({
        id: module.id,
        courseId: module.courseId,
        moduleName: module.moduleName,
        moduleDescription: module.moduleDescription,
        courseName: courseMap[module.courseId] || "Unknown Course",
      }));

      setCourseModules(mappedModules);
    } catch (error) {
      console.error("Failed to fetch course modules", error);
      toast.error("Failed to fetch course modules. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseModules();
  }, []);

  // Open modal to add a new course module
  const addNewRow = () => {
    setEditing(false);
    setNewModule({
      id: 0,
      courseId: 0,
      moduleName: "",
      moduleDescription: "",
    });
    setIsModalOpen(true);
  };

  const editCourseModule = (module: CourseModuleData) => {
    setEditing(true);
    setNewModule(module);
    setIsModalOpen(true);
  };

  // Close modal
  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewModule({
      id: 0,
      courseId: 0,
      moduleName: "",
      moduleDescription: "",
    });
  };

  // Handle form submission (Create or Update)
  const handleFormSubmit = async () => {
    // const validationErrors = validateFields();
    // if (Object.keys(validationErrors).length > 0) return;

    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to Perform this action");
      return;
    }

    try {
      if (editing) {
        await updateCourseModuleApi(newModule.id, {
          courseId: newModule.courseId,
          moduleName: newModule.moduleName,
          moduleDescription: newModule.moduleDescription,
        });
        toast.success("Course module updated successfully!");
      } else {
        await createCourseModuleApi({
          courseId: newModule.courseId,
          moduleName: newModule.moduleName,
          moduleDescription: newModule.moduleDescription,
        });
        toast.success("Course module added successfully!");
      }
      fetchCourseModules();
    } catch (error) {
      console.error("Failed to save course module", error);
      toast.error("Failed to save course module. Please try again later.");
    } finally {
      handleModalClose();
    }
  };
  const handleDeleteCourseModule = async () => {
    try {
      await deleteCourseModuleApi(newModule.id);
      toast.success("CourseModule deleted successfully!");
      fetchCourseModules();
      setLoading(true);
      handleModalClose();
    } catch (error) {
      toast.error("Failed to delete the batch");
    }
  };

  return (
    <div className="flex-1 p-6 mt-10 ml-16">
      <div className="relative bg-custom-gradient text-white px-6 py-4 rounded-lg shadow-lg mb-6 w-full">
        {/* Dropdown Button */}
        <Button
          className="w-80 flex justify-between items-center px-4 py-2 border bg-yellow-400"
          onClick={toggleDropdown}
        >
          {selectedModule ? selectedModule : "Module"}
          <ChevronDown className="ml-2 h-5 w-5" />
        </Button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <ul className="absolute w-80 border bg-white z-10 mt-1 max-h-48 overflow-auto shadow-lg text-black">
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

            {/* Add New Course Option */}
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                addNewRow();
                setSelectedModule("+New Module");
                setIsDropdownOpen(false);
              }}
            >
              + New CourseModule
            </li>

            {/* Filtered Course List with Edit Icons */}
            {filteredCourseModules.map((course) => (
              <li
                key={course.id}
                className="flex justify-between items-center px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  setSelectedModule(course.moduleName);
                  setIsDropdownOpen(false);
                }}
              >
                <span>{course.moduleName}</span>
                <Pencil
                  className="h-4 w-4 text-blue-500 cursor-pointer"
                  onClick={(e) => {
                    editCourseModule(course);
                    setIsDropdownOpen(false);
                    e.stopPropagation();
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
            <th className="border border-gray-300 px-4 py-2">CourseName</th>
            <th className="border border-gray-300 px-4 py-2">ModuleName</th>
            <th className="border border-gray-300 px-4 py-2">Description</th>
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
                {course.moduleName}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {course.moduleDescription}
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
        </td> */}
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
              {editing ? "Edit Batch" : "Add New Batch"}
            </h2>
            <form>
              <div className="mb-4 mt-3">
                <label className="block font-metropolis font-medium">
                  Courses
                </label>
                <select
                  className="w-full border rounded p-2 font-metropolis text-gray-700"
                  value={newModule.courseId}
                  onChange={(e) =>
                    setNewModule({
                      ...newModule,
                      courseId: parseInt(e.target.value, 10),
                    })
                  }
                >
                  <option value="">Select Course</option>
                  {courseOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.courseName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4 mt-4">
                <label className="block font-metropolis font-medium">
                  ModuleName
                </label>
                <input
                  type="text"
                  className="w-full border rounded p-2 font-metropolis text-gray-700"
                  value={newModule.moduleName}
                  onChange={(e) =>
                    setNewModule({ ...newModule, moduleName: e.target.value })
                  }
                />
              </div>
              <div className="mb-4 mt-4">
                <label className="block font-metropolis font-medium">
                  Description
                </label>
                <input
                  type="text"
                  className="w-full border rounded p-2 font-metropolis text-gray-700"
                  value={newModule.moduleDescription}
                  onChange={(e) =>
                    setNewModule({
                      ...newModule,
                      moduleDescription: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex space-x-4">
                <Button
                  onClick={handleFormSubmit}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  {editing ? "Update Batch" : "Create Batch"}
                </Button>
                <Button
                  onClick={handleModalClose}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Cancel
                </Button>
                {editing && (
                  <Button
                    onClick={handleDeleteCourseModule}
                    className="bg-red-500"
                  >
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

export default CourseModuleTable;
