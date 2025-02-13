import { useState, useEffect, SetStateAction } from "react";
import { Button } from "../../ui/button";
import "react-day-picker/dist/style.css";
import { toast } from "sonner";
import { format } from "date-fns";
import { ChevronDown, Pencil } from "lucide-react";

import {
  fetchBatchApi,
  createBatchApi,
  updateBatchApi,
  deleteBatchApi,
} from "@/helpers/api/batchApi";
import { fetchUsersApi } from "@/helpers/api/userApi";
import { fetchCourseApi } from "@/helpers/api/courseApi";

interface BatchTableProps {
  editable?: boolean;
}

// TypeScript types for batch data
interface BatchData {
  id: number;
  batchName: string;
  courseId: number;
  courseName: string;
  traineeId: number[]; // Changed to array
  traineeName: string[]; // Changed to array
  startDate: string;
  endDate: string;
}

interface batchOptions {
  id: any;
  courseName: any;
  traineeName: any;
}

// Helper to get token
const getToken = () => localStorage.getItem("authToken");

const ManageBatches = ({}: BatchTableProps) => {
  const [batches, setBatches] = useState<BatchData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // const [colDefs, setColDefs] = useState<ColDef[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [course, setCourse] = useState<batchOptions[]>([]);
  const [traineeName, setTraineeName] = useState<batchOptions[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newBatch, setNewBatch] = useState<BatchData>({
    id: 0,
    batchName: "",
    courseId: 0,
    courseName: "",
    traineeId: [],
    traineeName: [],
    startDate: "",
    endDate: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  {
    /* pagination */
  }
  const recordsPerPage = 15;
  const totalPages = Math.ceil(batches.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentData = batches.slice(startIndex, startIndex + recordsPerPage);

  const handlePageChange = (newPage: SetStateAction<number>) => {
    setCurrentPage(newPage);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredBatches = batches.filter((bat) =>
    bat.batchName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchBatchesData = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to view batches.");
      return;
    }

    try {
      const batchResponse = await fetchBatchApi();
      const batches = batchResponse.map((batch: any) => ({
        id: batch.id,
        batchName: batch.batchName,
        courseId: batch.course?.id || 0,
        courseName: batch.course?.courseName || "Unknown", // Course Name
        traineeName: batch.trainees
          ? batch.trainees
              .map((trainee: any) => `${trainee.firstName} ${trainee.lastName}`)
              .join(", ")
          : "Unknown",
        startDate: batch.startDate
          ? format(new Date(batch.startDate), "yyyy-MM-dd")
          : "",
        endDate: batch.endDate
          ? format(new Date(batch.endDate), "yyyy-MM-dd")
          : "",
      }));

      const responseCourse = await fetchCourseApi();
      const courses = responseCourse.map((course: any) => ({
        id: course.id,
        courseName: course.courseName,
      }));
      setCourse(courses);

      const responseUser = await fetchUsersApi();
      const trainees = responseUser.Users.filter(
        (user: any) => user.role.name === "trainee"
      ).map((trainee: any) => ({
        id: trainee.id,
        traineeName: `${trainee.firstName} ${trainee.lastName}`, // Full Name
      }));
      setTraineeName(trainees);
      setBatches(batches);
    } catch (error) {
      console.error("Error fetching or processing users:", error);
      toast.error("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatchesData();
  }, []);

  const addNewBatch = () => {
    setEditing(false);
    setNewBatch({
      id: 0,
      batchName: "",
      courseId: 0,
      courseName: "",
      traineeId: [],
      traineeName: [],
      startDate: "",
      endDate: "",
    });
    setIsModalOpen(true);
  };

  const editBatch = (batch: BatchData) => {
    setEditing(true);
    setNewBatch(batch);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewBatch({
      id: 0,
      batchName: "",
      courseId: 0,
      courseName: "",
      traineeId: [],
      traineeName: [],
      startDate: "",
      endDate: "",
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
        await updateBatchApi(newBatch.id, {
          batchName: newBatch.batchName,
          courseId: newBatch.courseId,
          traineeIds: newBatch.traineeId, // Send as an array
          startDate: newBatch.startDate
            ? format(new Date(newBatch.startDate), "yyyy-MM-dd")
            : "",
          endDate: newBatch.endDate
            ? format(new Date(newBatch.endDate), "yyyy-MM-dd")
            : "",
        });
        toast.success("Batch updated successfully!");
      } else {
        await createBatchApi({
          batchName: newBatch.batchName,
          courseId: newBatch.courseId,
          traineeIds: newBatch.traineeId, // Send as an array
          startDate: newBatch.startDate
            ? format(new Date(newBatch.startDate), "yyyy-MM-dd")
            : "",
          endDate: newBatch.endDate
            ? format(new Date(newBatch.endDate), "yyyy-MM-dd")
            : "",
        });
        toast.success("Batch created successfully!");
      }
      fetchBatchesData();
    } catch (error) {
      toast.error("Failed to add the batch. Please try again later.");
    } finally {
      handleModalClose();
    }
  };

  const handleDeleteBatch = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to delete a course.");
      return;
    }

    try {
      await deleteBatchApi(newBatch.id);
      toast.success("Batch deleted successfully!");
      fetchBatchesData();
      setLoading(true);
      handleModalClose();
    } catch (error) {
      toast.error("Failed to delete the batch. Please try again later.");
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
          {selectedBatch ? selectedBatch : "Batch"}
          <ChevronDown className="ml-2 h-5 w-5" />
        </Button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <ul className="absolute w-80 border bg-white z-10 mt-1 max-h-48 overflow-auto shadow-lg text-black">
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
                addNewBatch();
                setSelectedBatch("+New Batch");
                setIsDropdownOpen(false);
              }}
            >
              + New Batch
            </li>

            {/* Course List with Edit Icons */}
            {filteredBatches.map((batch) => (
              <li
                key={batch.id}
                className="flex justify-between items-center px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  setSelectedBatch(batch.batchName);
                  setIsDropdownOpen(false);
                }}
              >
                <span>{batch.batchName}</span>
                <Pencil
                  className="h-4 w-4 text-blue-500 cursor-pointer"
                  onClick={(e) => {
                    editBatch(batch);
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
            <th className="border border-gray-300 px-4 py-2">BatchName</th>
            <th className="border border-gray-300 px-4 py-2">CourseName</th>
            <th className="border border-gray-300 px-4 py-2">Trainees</th>
            <th className="border border-gray-300 px-4 py-2">StartDate</th>
            <th className="border border-gray-300 px-4 py-2">EndDate</th>
            {/* <th className="border border-gray-300 px-4 py-2">Actions</th> */}
          </tr>
        </thead>
        <tbody>
          {currentData.map((batch) => (
            <tr key={batch.id} className="hover:bg-gray-100">
              <td className="border border-gray-300 px-4 py-2">
                {batch.batchName}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {batch.courseName}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {batch.traineeName}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {batch.startDate}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {batch.endDate}
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
              <div className="mb-4 mt-4">
                <label className="block font-metropolis font-medium">
                  Batch Name
                </label>
                <input
                  type="text"
                  className="w-full border rounded p-2 font-metropolis text-gray-700"
                  value={newBatch.batchName}
                  onChange={(e) =>
                    setNewBatch({ ...newBatch, batchName: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block font-metropolis font-medium">
                  Courses
                </label>
                <select
                  className="w-full border rounded p-2 font-metropolis text-gray-700"
                  value={newBatch.courseId}
                  onChange={(e) =>
                    setNewBatch({
                      ...newBatch,
                      courseId: parseInt(e.target.value, 10),
                    })
                  }
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
                <label className="block font-metropolis font-medium mb-2">
                  Trainees
                </label>
                <select
                  multiple
                  className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
                  value={(newBatch.traineeId || []).map((id) => id.toString())} // Guard against undefined
                  onChange={(e) => {
                    const selectedOptions = Array.from(
                      e.target.selectedOptions
                    );
                    const ids = selectedOptions.map((option) =>
                      parseInt(option.value)
                    ); // Convert back to number[]
                    const names = selectedOptions.map((option) => option.text);
                    setNewBatch({
                      ...newBatch,
                      traineeId: ids,
                      traineeName: names,
                    });
                  }}
                >
                  <option value="">Select Trainees</option>
                  {(traineeName || []).map((trainee) => (
                    <option key={trainee.id} value={trainee.id.toString()}>
                      {trainee.traineeName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4 mt-4">
                <label className="block font-metropolis font-medium">
                  StartDate
                </label>
                <input
                  type="date"
                  className="w-full border rounded p-2 font-metropolis text-gray-700"
                  value={newBatch.startDate}
                  onChange={(e) =>
                    setNewBatch({ ...newBatch, startDate: e.target.value })
                  }
                />
              </div>
              <div className="mb-4 mt-4">
                <label className="block font-metropolis font-medium">
                  EndDate
                </label>
                <input
                  type="date"
                  className="w-full border rounded p-2 font-metropolis text-gray-700"
                  value={newBatch.endDate}
                  onChange={(e) =>
                    setNewBatch({ ...newBatch, endDate: e.target.value })
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
                  <Button onClick={handleDeleteBatch} className="bg-red-500">
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

export default ManageBatches;
