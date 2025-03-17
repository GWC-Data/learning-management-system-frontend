import { useState, useEffect, SetStateAction } from "react";
import { Button } from "../../ui/button";
import "react-day-picker/dist/style.css";
import { toast } from "sonner";
import { Edit, Calendar } from "lucide-react";
import { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { format } from "date-fns";
import Select from 'react-select';
import remove from '../../../assets/delete.png';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../../../components/ui/tooltip";
import Breadcrumb from "./breadcrumb";
import {
  fetchBatchApi,
  createBatchApi,
  updateBatchApi,
  deleteBatchApi,
} from "@/helpers/api/batchApi";
import { fetchUsersApi } from "@/helpers/api/userApi";
import { fetchCourseApi } from "@/helpers/api/courseApi";
import { useNavigate, useSearchParams } from "react-router-dom";

interface BatchTableProps {
  editable?: boolean;
}

interface BatchData {
  id: string;
  batchName: string;
  courseId: string;
  courseName: string;
  traineeId: string[];
  traineeName: string[];
  startDate: string;
  endDate: string;
}

interface batchOptions {
  id: any;
  courseName: any;
  traineeName: any;
  email: any;
  phoneNumber: any;
  dateOfJoining: any
}


// Helper to get token
const getToken = () => localStorage.getItem("authToken");

const ManageBatches = ({ editable = true }: BatchTableProps) => {
  const [batches, setBatches] = useState<BatchData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [colDefs, setColDefs] = useState<ColDef[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [course, setCourse] = useState<{ id: string; courseName: string }[]>([]);
  const [trainees, setTrainees] = useState<batchOptions[]>([])
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<BatchData | null>(null);
  const [newBatch, setNewBatch] = useState<BatchData>({
    id: "",
    batchName: "",
    courseId: "",
    courseName: "",
    traineeId: [],
    traineeName: [],
    startDate: "",
    endDate: "",
  });

  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams] = useSearchParams();
  const courseId = String(searchParams.get("courseId"));

  // const courseId = location.state?.courseId;
  // const courseName = location.state?.courseName;

  const ScheduleBatches = (data: BatchData) => {
    navigate(`/admin/manage-batch-schedules?batchId=${data.id}`);
  };


  {/* pagination */ }
  const recordsPerPage = 10;
  const totalPages = Math.ceil(batches.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentData = batches.slice(startIndex, startIndex + recordsPerPage);

  const handlePageChange = (newPage: SetStateAction<number>) => {
    setCurrentPage(newPage);
  };

  // const ScheduleBatches = (data: BatchData) => {
  //   navigate(`/admin/manage-batch-schedules?batchId=${data.id}`, {
  //     state: {
  //       courseId: data.courseId,
  //       courseName: data.courseName,
  //       batchId: data.id,
  //       batchName: data.batchName,
  //     },
  //   });
  // };

  const fetchBatchesData = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to view batches.");
      return;
    }

    setLoading(true); // ✅ Set loading state before fetching

    try {
      // ✅ Fetch batches
      const batchResponse = await fetchBatchApi();
      console.log("Batch API Response:", batchResponse);

      if (!batchResponse || !Array.isArray(batchResponse.batch)) {
        console.error("Invalid batch response format:", batchResponse);
        toast.error("Failed to load batches.");
        return;
      }

      const batches = batchResponse.batch.map((batch: any) => ({
        id: batch.id,
        batchName: batch.batchName,
        courseId: batch.course?.id || "",
        courseName: batch.course?.courseName || "Unknown",
        traineeId: batch.trainees?.map((trainee: any) => trainee.id) || [],
        traineeName: batch.trainees
          ? batch.trainees.map((trainee: any) => `${trainee.firstName} ${trainee.lastName}`).join(", ")
          : "Unknown",
        startDate: batch.startDate?.value || "",
        endDate: batch.endDate?.value || ""
      }));

      console.log("Processed Batches:", batches);

      const filteredBatches = batches.filter((b: any) => b.courseId === courseId);
      console.log("Filtered Batches:", filteredBatches);
      setBatches(filteredBatches);

      // ✅ Fetch courses
      const responseCourse = await fetchCourseApi();
      console.log("Courses API Response:", responseCourse);

      if (!Array.isArray(responseCourse)) {
        console.error("Invalid courses response format:", responseCourse);
        toast.error("Failed to load courses.");
        return;
      }

      const courses = responseCourse.map((course: any) => ({
        id: course.courseId,
        courseName: course.courseName,
      }));

      setCourse(courses);

      // Fetch users
      const responseUser = await fetchUsersApi();
      console.log("Users API Response:", responseUser);

      if (!responseUser || !Array.isArray(responseUser.users)) {
        console.error("Invalid users response format:", responseUser);
        toast.error("Failed to load users.");
        return;
      }

      const trainees = responseUser.users.filter((user: any) => user.roleName === "trainee").map((trainee: any) => ({
        id: trainee.id,
        traineeName: `${trainee.firstName} ${trainee.lastName}`,
        email: trainee.email,
        phoneNumber: trainee.phoneNumber,
        dateOfJoining: trainee.dateOfJoining
      }));

      setTrainees(trainees);
      console.log("Trainees:", trainees);

    } catch (error) {
      console.error("Error fetching or processing data:", error);
      toast.error("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatchesData();
  }, [courseId]);

  const addNewBatch = () => {
    setEditing(false);
    setNewBatch({
      id: "",
      batchName: "",
      courseId: "",
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
      id: "",
      batchName: "",
      courseId: "",
      courseName: "",
      traineeId: [],
      traineeName: [],
      startDate: "",
      endDate: "",
    });
  };


  const confirmDeleteBatch = (data: BatchData) => {
    const batch = batches.find((batch) => batch.id === data.id);
    if (batch) {
      setBatchToDelete(batch);
      setIsDeleteModalOpen(true);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setBatchToDelete(null);
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
          endDate: newBatch.endDate ? format(new Date(newBatch.endDate), "yyyy-MM-dd")
            : ""
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
          endDate: newBatch.endDate ? format(new Date(newBatch.endDate), "yyyy-MM-dd")
            : ""
        });
        toast.success("Batch created successfully!")
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
      toast.success('Batch deleted successfully!');
      fetchBatchesData();
      setLoading(true)
      handleModalClose();
    } catch (error) {
      toast.error('Failed to delete the batch. Please try again later.');
    }
  }

  useEffect(() => {
    setColDefs([
      {
        headerName: "Batch Name",
        field: "batchName",
        editable: false,
        width: 200,
      },
      {
        headerName: "CourseName",
        field: "courseName",
        editable: false,
        width: 200,
      },
      {
        headerName: "Trainees",
        field: "traineeName",
        editable: false,
        width: 200,
      },

      {
        headerName: "Start Date",
        field: "startDate",
        editable: false,
        valueFormatter: (params) =>
          params.value
            ? format(new Date(params.value), "dd-MM-yyyy")
            : "N/A",
        width: 200,
      },
      {
        headerName: "End Date",
        field: "endDate",
        editable: false,
        valueFormatter: (params) =>
          params.value
            ? format(new Date(params.value), "dd-MM-yyyy")
            : "N/A",
      },
      {
        headerName: "Actions",
        field: "actions",
        width: 180,
        cellRenderer: (params: any) => {
          return (
            <div className="flex space-x-2">
              <TooltipProvider>
                {/* Edit Batch Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => editBatch(params.data)}
                      className="bg-white text-[#6E2B8B] p-2 rounded hover:bg-white"
                    >
                      <Edit className="h-6 w-6" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit Batch</TooltipContent>
                </Tooltip>

                {/* Schedule Batch Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => ScheduleBatches(params.data)}
                      className="text-green-600 bg-white p-2 rounded hover:bg-white"
                    >
                      <Calendar className="h-6 w-6" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Schedule Batch</TooltipContent>
                </Tooltip>

                {/* Delete Batch Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => confirmDeleteBatch(params.data)}
                      className="text-red-600 bg-white hover:bg-white p-2"
                    >
                      <img src={remove} alt="Remove Icon" className="h-6 w-6 filter fill-current text-[#6E2B8B]" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete Batch</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        },
        editable: false,
      },
    ]);
  }, [batches]);


  return (
    <div className="flex-1 p-4 mt-10 ml-16">
      <div className="text-gray-600 text-lg mb-4">
        <Breadcrumb /></div>
      <div className="flex items-center justify-between bg-[#6E2B8B] text-white px-6 py-4 rounded-lg shadow-lg mb-6 w-[1185px]">
        <div className="flex flex-col">
          <h2 className="text-2xl font-metropolis font-semibold tracking-wide">
            Batches
          </h2>
          <p className="text-sm font-metropolis font-medium">
            Manage Batches easily.
          </p>
        </div>
        <Button
          onClick={addNewBatch}
          className="bg-yellow-400 text-gray-900 font-metropolis font-semibold px-5 py-2 rounded-md shadow-lg hover:bg-yellow-500 transition duration-300"
        >
          + Add Batch
        </Button>
      </div>

      {isDeleteModalOpen && batchToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-auto">
            <h2 className="text-xl font-metropolis font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-4 font-metropolis font-medium">
              Are you sure you want to delete the Batch {" "}
              <strong>
                {batchToDelete?.batchName?.charAt(0).toUpperCase() +
                  batchToDelete?.batchName?.slice(1).toLowerCase() || "this batchname"}
              </strong>
              ?
            </p>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                onClick={handleDeleteBatch}
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
      <div
        className="ag-theme-quartz text-left font-poppins"
        style={{ height: "calc(100vh - 180px)", width: "91.5%" }}
      >
        <AgGridReact
          rowSelection="multiple"
          suppressRowClickSelection
          suppressMovableColumns
          loading={loading}
          columnDefs={colDefs}
          rowData={batches}
          defaultColDef={{
            editable,
            sortable: true,
            filter: true,
            resizable: true,
          }}
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
          <div className="bg-white p-6 rounded-lg shadow-lg w-[850px]">
            <h2 className="text-xl font-metropolis font-semibold">
              {editing ? "Edit Batch" : "Add New Batch"}
            </h2>
            <form>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {/* Batch Name */}
                <div className="mb-4 mt-2">
                  <label className="block font-metropolis font-medium mb-2">Batch Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className="w-full border rounded p-2 h-9 font-metropolis text-gray-700"
                    value={newBatch.batchName}
                    onChange={(e) =>
                      setNewBatch({ ...newBatch, batchName: e.target.value })
                    }
                  />
                </div>

                {/* Conditionally Render Course Selection */}
                {!editing && (
                  <div className="mb-4 mt-2">
                    <label className="block font-metropolis font-medium mb-2">Courses <span className="text-red-500">*</span></label>
                    <Select
                      options={course.map((c) => ({
                        value: c.id,
                        label: c.courseName,
                      }))}
                      value={
                        newBatch.courseId
                          ? {
                            value: newBatch.courseId,
                            label: course.find((c) => c.id === newBatch.courseId)
                              ?.courseName,
                          }
                          : null
                      }
                      onChange={(selectedOption) => {
                        setNewBatch({
                          ...newBatch,
                          courseId: selectedOption ? selectedOption.value : "",
                        });
                      }}
                      className="w-full rounded font-metropolis text-gray-700"
                      placeholder="Select Course"
                      isSearchable={true}
                    />
                  </div>
                )}
              </div>


              <div className="mb-4">
                <label className="block font-metropolis font-medium mb-2">Trainees <span className="text-red-500">*</span></label>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border rounded">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 border">Select</th>
                        <th className="px-4 py-2 border">Name</th>
                        <th className="px-4 py-2 border">Email</th>
                        <th className="px-4 py-2 border">Phone Number</th>
                        <th className="px-4 py-2 border">Date of Joining</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trainees.map((trainee) => (
                        <tr key={trainee.id}>
                          <td className="px-4 py-2 border">
                            <input
                              type="checkbox"
                              checked={newBatch.traineeId.includes(trainee.id)}
                              onChange={(e) => {
                                const selectedIds = e.target.checked
                                  ? [...newBatch.traineeId, trainee.id]
                                  : newBatch.traineeId.filter((id) => id !== trainee.id);
                                const selectedNames = e.target.checked
                                  ? [...newBatch.traineeName, trainee.traineeName]
                                  : newBatch.traineeName.filter((name) => name !== trainee.traineeName);
                                setNewBatch({
                                  ...newBatch,
                                  traineeId: selectedIds,
                                  traineeName: selectedNames,
                                });
                              }}
                            />
                          </td>
                          <td className="px-4 py-2 border">{trainee.traineeName}</td>
                          <td className="px-4 py-2 border">{trainee.email}</td>
                          <td className="px-4 py-2 border">{trainee.phoneNumber}</td>
                          <td className="px-4 py-2 border">
                            {trainee.dateOfJoining?.value && !isNaN(new Date(trainee.dateOfJoining.value).getTime())
                              ? format(new Date(trainee.dateOfJoining.value), "dd-MM-yyyy")
                              : "N/A"}
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                {/* Start Date */}
                <div className="mb-4">
                  <label className="block font-metropolis font-medium">Start Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    className="w-full border rounded mt-1 p-2 font-metropolis text-gray-700"
                    value={newBatch.startDate}
                    onChange={(e) => setNewBatch({ ...newBatch, startDate: e.target.value })}
                  />
                </div>

                {/* End Date */}
                <div className="mb-4">
                  <label className="block font-metropolis font-medium">End Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    className="w-full border rounded mt-1 p-2 font-metropolis text-gray-700"
                    value={newBatch.endDate}
                    onChange={(e) => setNewBatch({ ...newBatch, endDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mt-3">
                <Button
                  onClick={handleFormSubmit}
                  className="bg-[#6E2B8B] hover:bg-[#8536a7] text-white px-4 py-2 
    transition-all duration-500 ease-in-out 
    rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
                >
                  {editing ? "Update Batch" : "Create NewBatch"}
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
export default ManageBatches;

//         {/* Dropdown Button */}
//         <Button
//           className="w-80 flex justify-between items-center px-4 py-2 border bg-yellow-400"
//           onClick={toggleDropdown}
//         >
//           {selectedBatch ? selectedBatch: "Batch"}
//           <ChevronDown className="ml-2 h-5 w-5" />
//         </Button>

//         {/* Dropdown Menu */}
//         {isDropdownOpen && (
//           <ul className="absolute w-80 border bg-white z-10 mt-1 max-h-48 overflow-auto shadow-lg text-black">
//             {/* Add New Course Option */}
//             <li
//               className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//               onClick={() => {
//                 addNewBatch()
//                 setSelectedBatch("+New Batch")
//                 setIsDropdownOpen(false);
//               }}
//             >
//               + New Batch
//             </li>

//             {/* Course List with Edit Icons */}
//             {batches.map((batch) => (
//               <li
//                 key={batch.id}
//                 className="flex justify-between items-center px-4 py-2 hover:bg-gray-100"
//                 onClick={() => {
//                   setSelectedBatch(batch.batchName);
//                   setIsDropdownOpen(false);
//                 }}
//               >
//                 <span>{batch.batchName}</span>
//                 <Pencil
//                   className="h-4 w-4 text-blue-500 cursor-pointer"
//                   onClick={(e) => {
//                     editBatch(batch);
//                     setIsDropdownOpen(false)
//                     e.stopPropagation();
//                   }}
//                 />
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//       <table className="table-auto w-full mt-4 border-collapse border border-gray-300 shadow-lg">
//         <thead>
//           <tr className="bg-gray-200 text-left text-gray-800">
//             <th className="border border-gray-300 px-4 py-2">BatchName</th>
//             <th className="border border-gray-300 px-4 py-2">CourseName</th>
//             <th className="border border-gray-300 px-4 py-2">Trainees</th>
//             <th className="border border-gray-300 px-4 py-2">StartDate</th>
//             <th className="border border-gray-300 px-4 py-2">EndDate</th>
//             {/* <th className="border border-gray-300 px-4 py-2">Actions</th> */}
//           </tr>
//         </thead>
//         <tbody>
//           {currentData.map((batch) => (
//             <tr key={batch.id} className="hover:bg-gray-100">
//               <td className="border border-gray-300 px-4 py-2">{batch.batchName}</td>
//               <td className="border border-gray-300 px-4 py-2">{batch.courseName}</td>
//               <td className="border border-gray-300 px-4 py-2">{batch.traineeName}</td>
//               <td className="border border-gray-300 px-4 py-2">{batch.startDate}</td>
//               <td className="border border-gray-300 px-4 py-2">{batch.endDate}</td>
//               {/* <td className="border border-gray-300 px-4 py-2 flex space-x-2">
//                 <button
//                   onClick={() => editCourse(course)}
//                   className="text-blue-500 hover:text-blue-700"
//                 >
//                   <Edit className="inline-block w-5 h-5" />
//                 </button>
//                 <button
//                   onClick={() => deleteCourse(course.id)}
//                   className="text-red-500 hover:text-red-700"
//                 >
//                   <Trash className="inline-block w-5 h-5" />
//                 </button>
//               </td> */}
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Pagination Controls */}
//       <div className="flex justify-center items-center mt-4">
//         <button
//           disabled={currentPage === 1}
//           onClick={() => handlePageChange(currentPage - 1)}
//           className={`px-4 py-2 rounded-l-md border bg-gray-300 text-gray-700 hover:bg-gray-400 ${currentPage === 1 && "cursor-not-allowed opacity-50"
//             }`}
//         >
//           Previous
//         </button>
//         <span className="px-4 py-2 border-t border-b text-gray-700">
//           Page {currentPage} of {totalPages}
//         </span>
//         <button
//           disabled={currentPage === totalPages}
//           onClick={() => handlePageChange(currentPage + 1)}
//           className={`px-4 py-2 rounded-r-md border bg-gray-300 text-gray-700 hover:bg-gray-400 ${currentPage === totalPages && "cursor-not-allowed opacity-50"
//             }`}
//         >
//           Next
//         </button>
//       </div>

//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-96">
//             <h2 className="text-xl font-metropolis font-semibold">{editing ? "Edit Batch" : "Add New Batch"}</h2>
//             <form>
//               <div className="mb-4 mt-4">
//                 <label className="block font-metropolis font-medium">Batch Name</label>
//                 <input
//                   type="text"
//                   className="w-full border rounded p-2 font-metropolis text-gray-700"
//                   value={newBatch.batchName}
//                   onChange={(e) => setNewBatch({ ...newBatch, batchName: e.target.value })}
//                 />
//               </div>
//               <div className="mb-4">
//                 <label className="block font-metropolis font-medium">Courses</label>
//                 <select
//                   className="w-full border rounded p-2 font-metropolis text-gray-700"
//                   value={newBatch.courseId}
//                   onChange={(e) =>
//                     setNewBatch({
//                       ...newBatch,
//                       courseId: parseInt(e.target.value, 10),
//                     })
//                   }
//                 >
//                   <option value="">Select Course</option>
//                   {course.map((c) => (
//                     <option key={c.id} value={c.id}>
//                       {c.courseName}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="mb-4">
//                 <label className="block font-metropolis font-medium mb-2">
//                   Trainees
//                 </label>
//                 <select
//                   multiple
//                   className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
//                   value={(newBatch.traineeId || []).map((id) => id.toString())} // Guard against undefined
//                   onChange={(e) => {
//                     const selectedOptions = Array.from(e.target.selectedOptions);
//                     const ids = selectedOptions.map((option) => parseInt(option.value)); // Convert back to number[]
//                     const names = selectedOptions.map((option) => option.text);
//                     setNewBatch({ ...newBatch, traineeId: ids, traineeName: names });
//                   }}
//                 >
//                   <option value="">Select Trainees</option>
//                   {(traineeName || []).map((trainee) => (
//                     <option key={trainee.id} value={trainee.id.toString()}>
//                       {trainee.traineeName}
//                     </option>
//                   ))}
//                 </select>

//               </div>
//               <div className="mb-4 mt-4">
//                 <label className="block font-metropolis font-medium">StartDate</label>
//                 <input
//                   type="date"
//                   className="w-full border rounded p-2 font-metropolis text-gray-700"
//                   value={newBatch.startDate}
//                   onChange={(e) => setNewBatch({ ...newBatch, startDate: e.target.value })}
//                 />
//               </div>
//               <div className="mb-4 mt-4">
//                 <label className="block font-metropolis font-medium">EndDate</label>
//                 <input
//                   type="date"
//                   className="w-full border rounded p-2 font-metropolis text-gray-700"
//                   value={newBatch.endDate}
//                   onChange={(e) => setNewBatch({ ...newBatch, endDate: e.target.value })}
//                 />
//               </div>
//               <div className="flex space-x-4">
//                 <Button
//                   onClick={handleFormSubmit}
//                   className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//                 >
//                   {editing ? "Update Batch" : "Create Batch"}
//                 </Button>
//                 <Button
//                   onClick={handleModalClose}
//                   className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//                 >
//                   Cancel
//                 </Button>
//                 {editing && (
//                   <Button onClick={handleDeleteBatch} className="bg-red-500">
//                     Delete
//                   </Button>
//                 )}
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ManageBatches;



// import { useState, useEffect, SetStateAction } from "react";
// import { Button } from "../../components/ui/button";
// import "react-day-picker/dist/style.css";
// import { toast } from "sonner";
// import { format } from "date-fns";
// import { ChevronDown, Pencil } from "lucide-react";
// import Select from 'react-select';

// import {
//   fetchBatchApi,
//   createBatchApi,
//   updateBatchApi,
//   deleteBatchApi,
// } from "@/api/batchApi";
// import { fetchUsersApi } from "@/api/userApi";
// import { fetchCourseApi } from "@/api/courseApi";


// interface BatchTableProps {
//   selectedCourse: string | null;
//   onBatchesSelect: (batchName: string) => void;
// }

// // TypeScript types for batch data
// interface BatchData {
//   id: number;
//   batchName: string;
//   courseId: number;
//   courseName: string;
//   traineeId: number[]; // Changed to array
//   traineeName: string[]; // Changed to array
//   startDate: string;
//   endDate: string;
// }

// interface batchOptions {
//   id: any;
//   courseName: any;
//   traineeName: any;
// }


// // Helper to get token
// const getToken = () => localStorage.getItem("authToken");

// const ManageBatches = ({ selectedCourse, onBatchesSelect }: BatchTableProps) => {
//   const [batches, setBatches] = useState<BatchData[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   // const [colDefs, setColDefs] = useState<ColDef[]>([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editing, setEditing] = useState(false);
//   const [searchTerm, setSearchTerm] = useState<string>("");
//   const [selectedBatch, setSelectedBatch] = useState("");
//   const [course, setCourse] = useState<batchOptions[]>([]);
//   const [batch, setBatch] = useState<any[]>([]);
//   const [trainees, setTraineeName] = useState<batchOptions[]>([])
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [newBatch, setNewBatch] = useState<BatchData>({
//     id: 0,
//     batchName: "",
//     courseId: 0,
//     courseName: "",
//     traineeId: [],
//     traineeName: [],
//     startDate: "",
//     endDate: "",
//   });
//   const [currentPage, setCurrentPage] = useState(1);
//   {/* pagination */ }
//   const recordsPerPage = 15;
//   const totalPages = Math.ceil(batches.length / recordsPerPage);
//   const startIndex = (currentPage - 1) * recordsPerPage;
//   const currentData = batches.slice(startIndex, startIndex + recordsPerPage);

//   const handlePageChange = (newPage: SetStateAction<number>) => {
//     setCurrentPage(newPage);
//   };

//   const toggleDropdown = () => {
//     setIsDropdownOpen(!isDropdownOpen);
//   };

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchTerm(e.target.value);
//   };

//   const filteredBatches = batch.filter((bat) =>
//     bat.batchName.toLowerCase().includes(searchTerm.toLowerCase())
//   );
//   useEffect(() => {
//     console.log("Selected Module:", selectedCourse);
//     if (selectedCourse) {
//       const filteredBatch = batches.filter(batch =>
//         batch.courseName === selectedCourse
//       );
//       console.log("Filtered Batche:", filteredBatch);  // Check the filtered courses
//       setBatch(filteredBatch);
//     } else {
//       setBatch(batches);
//     }
//   }, [selectedCourse, batches]);


//   const fetchBatchesData = async () => {
//     const token = getToken();
//     if (!token) {
//       toast.error("You must be logged in to view batches.");
//       return;
//     }

//     try {
//       const batchResponse = await fetchBatchApi();
//       const batches = batchResponse.map((batch: any) => ({
//         id: batch.id,
//         batchName: batch.batchName,
//         courseId: batch.course?.id || 0,
//         courseName: batch.course?.courseName || "Unknown",
//         traineeId: batch.trainees ? batch.trainees.map((trainees: any) => trainees.id) : [],
//         traineeName: batch.trainees
//           ? batch.trainees
//             .map((trainee: any) => `${trainee.firstName} ${trainee.lastName}`)
//             .join(", ")
//           : "Unknown",
//         startDate: batch.startDate ? format(new Date(batch.startDate), "yyyy-MM-dd")
//           : "",
//         endDate: batch.endDate ? format(new Date(batch.endDate), "yyyy-MM-dd")
//           : ""
//       }));


//       const responseCourse = await fetchCourseApi();
//       const courses = responseCourse.map((course: any) => ({
//         id: course.id,
//         courseName: course.courseName,
//       }));
//       setCourse(courses);

//       const responseUser = await fetchUsersApi();
//       const trainees = responseUser.Users.filter(
//         (user: any) => user.role.name === "trainee"
//       ).map((trainee: any) => ({
//         id: trainee.id,
//         traineeName: `${trainee.firstName} ${trainee.lastName}`, // Full Name
//       }));
//       setTraineeName(trainees);
//       setBatches(batches);
//     } catch (error) {
//       console.error("Error fetching or processing users:", error);
//       toast.error("Failed to fetch data.");
//     } finally {
//       setLoading(false);
//     }
//   };


//   useEffect(() => {
//     fetchBatchesData();
//   }, []);

//   const addNewBatch = () => {
//     setEditing(false);
//     setNewBatch({
//       id: 0,
//       batchName: "",
//       courseId: 0,
//       courseName: "",
//       traineeId: [],
//       traineeName: [],
//       startDate: "",
//       endDate: "",
//     });
//     setIsModalOpen(true);
//   };

//   const editBatch = (batch: BatchData) => {
//     setEditing(true);
//     setNewBatch(batch);
//     setIsModalOpen(true);
//   };

//   const handleModalClose = () => {
//     setIsModalOpen(false);
//     setNewBatch({
//       id: 0,
//       batchName: "",
//       courseId: 0,
//       courseName: "",
//       traineeId: [],
//       traineeName: [],
//       startDate: "",
//       endDate: "",
//     });
//   };

//   const handleFormSubmit = async () => {
//     const token = getToken();
//     if (!token) {
//       toast.error("You must be logged in to perform this action.");
//       return;
//     }

//     try {

//       if (editing) {
//         await updateBatchApi(newBatch.id, {
//           batchName: newBatch.batchName,
//           courseId: newBatch.courseId,
//           traineeIds: newBatch.traineeId, // Send as an array
//           startDate: newBatch.startDate
//             ? format(new Date(newBatch.startDate), "yyyy-MM-dd")
//             : "",
//           endDate: newBatch.endDate ? format(new Date(newBatch.endDate), "yyyy-MM-dd")
//             : ""
//         });
//         toast.success("Batch updated successfully!");
//       } else {
//         await createBatchApi({
//           batchName: newBatch.batchName,
//           courseId: newBatch.courseId,
//           traineeIds: newBatch.traineeId, // Send as an array
//           startDate: newBatch.startDate
//             ? format(new Date(newBatch.startDate), "yyyy-MM-dd")
//             : "",
//           endDate: newBatch.endDate ? format(new Date(newBatch.endDate), "yyyy-MM-dd")
//             : ""
//         });
//         toast.success("Batch created successfully!")
//       }
//       fetchBatchesData();
//     } catch (error) {
//       toast.error("Failed to add the batch. Please try again later.");
//     } finally {
//       handleModalClose();
//     }
//   };

//   const handleDeleteBatch = async () => {
//     const token = getToken();
//     if (!token) {
//       toast.error("You must be logged in to delete a course.");
//       return;
//     }

//     try {
//       await deleteBatchApi(newBatch.id);
//       toast.success('Batch deleted successfully!');
//       fetchBatchesData();
//       setLoading(true)
//       handleModalClose();
//     } catch (error) {
//       toast.error('Failed to delete the batch. Please try again later.');
//     }
//   }

//   return (
//     <div className="flex-1 p-6 mt-10 ml-16">
//       <div >
//         {/* Dropdown Button */}
//         <Button
//           className="w-72 flex justify-between items-center px-4 py-2 border bg-custom-gradient"
//           onClick={toggleDropdown}
//         >
//           {selectedBatch ? selectedBatch : "Batch"}
//           <ChevronDown className="ml-2 h-5 w-5" />
//         </Button>

//         {/* Dropdown Menu */}
//         {isDropdownOpen && (
//           <ul className="absolute w-72 border bg-white z-10 mt-1 max-h-48 overflow-auto shadow-lg text-black">
//             <li className="px-4 py-2">
//               <input
//                 type="text"
//                 className="w-full border p-2 rounded"
//                 placeholder="Search..."
//                 value={searchTerm}
//                 onChange={handleSearchChange}
//               />
//             </li>
//             {/* Add New Course Option */}
//             <li
//               className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//               onClick={() => {
//                 addNewBatch()
//                 setSelectedBatch("+New Batch")
//                 setIsDropdownOpen(false);
//               }}
//             >
//               + New Batch
//             </li>

//             {/* Course List with Edit Icons */}
//             {filteredBatches.map((batch) => (
//               <li
//                 key={batch.id}
//                 className="flex justify-between items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                 onClick={() => {
//                   onBatchesSelect(batch.batchName)
//                   setSelectedBatch(batch.batchName);
//                   setIsDropdownOpen(false);
//                 }}
//               >
//                 <span>{batch.batchName}</span>
//                 <Pencil
//                   className="h-4 w-4 text-blue-500 cursor-pointer"
//                   onClick={(e) => {
//                     editBatch(batch);
//                     setIsDropdownOpen(false)
//                     e.stopPropagation();
//                   }}
//                 />
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>

//       {/* <table className="table-auto w-full mt-4 border-collapse border border-gray-300 shadow-lg">
//         <thead>
//           <tr className="bg-gray-200 text-left text-gray-800">
//             <th className="border border-gray-300 px-4 py-2">BatchName</th>
//             <th className="border border-gray-300 px-4 py-2">CourseName</th>
//             <th className="border border-gray-300 px-4 py-2">Trainees</th>
//             <th className="border border-gray-300 px-4 py-2">StartDate</th>
//             <th className="border border-gray-300 px-4 py-2">EndDate</th>
//             {/* <th className="border border-gray-300 px-4 py-2">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {currentData.map((batch) => (
//             <tr key={batch.id} className="hover:bg-gray-100">
//               <td className="border border-gray-300 px-4 py-2">{batch.batchName}</td>
//               <td className="border border-gray-300 px-4 py-2">{batch.courseName}</td>
//               <td className="border border-gray-300 px-4 py-2">{batch.traineeName}</td>
//               <td className="border border-gray-300 px-4 py-2">{batch.startDate}</td>
//               <td className="border border-gray-300 px-4 py-2">{batch.endDate}</td>
//               {/* <td className="border border-gray-300 px-4 py-2 flex space-x-2">
//                 <button
//                   onClick={() => editCourse(course)}
//                   className="text-blue-500 hover:text-blue-700"
//                 >
//                   <Edit className="inline-block w-5 h-5" />
//                 </button>
//                 <button
//                   onClick={() => deleteCourse(course.id)}
//                   className="text-red-500 hover:text-red-700"
//                 >
//                   <Trash className="inline-block w-5 h-5" />
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Pagination Controls */}
//       {/* <div className="flex justify-center items-center mt-4">
//         <button
//           disabled={currentPage === 1}
//           onClick={() => handlePageChange(currentPage - 1)}
//           className={`px-4 py-2 rounded-l-md border bg-gray-300 text-gray-700 hover:bg-gray-400 ${currentPage === 1 && "cursor-not-allowed opacity-50"
//             }`}
//         >
//           Previous
//         </button>
//         <span className="px-4 py-2 border-t border-b text-gray-700">
//           Page {currentPage} of {totalPages}
//         </span>
//         <button
//           disabled={currentPage === totalPages}
//           onClick={() => handlePageChange(currentPage + 1)}
//           className={`px-4 py-2 rounded-r-md border bg-gray-300 text-gray-700 hover:bg-gray-400 ${currentPage === totalPages && "cursor-not-allowed opacity-50"
//             }`}
//         >
//           Next
//         </button>
//       </div> */}

//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-96">
//             <h2 className="text-xl font-metropolis font-semibold">{editing ? "Edit Batch" : "Add New Batch"}</h2>
//             <form>
//               <div className="mb-4 mt-4">
//                 <label className="block font-metropolis font-medium">Batch Name</label>
//                 <input
//                   type="text"
//                   className="w-full border rounded p-2 font-metropolis text-gray-700"
//                   value={newBatch.batchName}
//                   onChange={(e) => setNewBatch({ ...newBatch, batchName: e.target.value })}
//                 />
//               </div>
//               <div className="mb-4">
//                 <label className="block font-metropolis font-medium mb-2">Courses</label>
//                 <Select
//                   options={course.map((c) => ({
//                     value: c.id, // Unique course ID
//                     label: c.courseName, // Course name to display
//                   }))}
//                   value={
//                     newBatch.courseId
//                       ? {
//                         value: newBatch.courseId,
//                         label: course.find((c) => c.id === newBatch.courseId)?.courseName,
//                       }
//                       : null
//                   }
//                   onChange={(selectedOption) => {
//                     setNewBatch({
//                       ...newBatch,
//                       courseId: selectedOption ? selectedOption.value : 0, // Handle null or deselection
//                     });
//                   }}
//                   className="w-full rounded font-metropolis text-gray-700"
//                   placeholder="Select Course"
//                   isSearchable={true} // Enables search functionality
//                 />
//               </div>


//               <div className="mb-4">
//                 <label className="block font-metropolis font-medium mb-2">Trainees</label>
//                 <Select
//                   isMulti
//                   options={trainees.map((trainee) => ({
//                     value: trainee.id,
//                     label: trainee.traineeName,
//                   }))}
//                   value={newBatch.traineeId.map((id) => ({
//                     value: id,
//                     label: trainees.find((trainee) => trainee.id === id)?.traineeName,
//                   }))}
//                   onChange={(selectedOptions) => {
//                     const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
//                     const selectedNames = selectedOptions ? selectedOptions.map(option => option.label) : [];
//                     setNewBatch({
//                       ...newBatch,
//                       traineeId: selectedIds,
//                       traineeName: selectedNames,
//                     });
//                   }}
//                   className="w-full border rounded font-metropolis text-gray-700"
//                   placeholder="Select Trainees"
//                   isSearchable={true}
//                 />
//               </div>

//               <div className="mb-4 mt-4">
//                 <label className="block font-metropolis font-medium">StartDate</label>
//                 <input
//                   type="date"
//                   className="w-full border rounded p-2 font-metropolis text-gray-700"
//                   value={newBatch.startDate}
//                   onChange={(e) => setNewBatch({ ...newBatch, startDate: e.target.value })}
//                 />
//               </div>
//               <div className="mb-4 mt-4">
//                 <label className="block font-metropolis font-medium">EndDate</label>
//                 <input
//                   type="date"
//                   className="w-full border rounded p-2 font-metropolis text-gray-700"
//                   value={newBatch.endDate}
//                   onChange={(e) => setNewBatch({ ...newBatch, endDate: e.target.value })}
//                 />
//               </div>
//               <div className="flex space-x-4">
//                 <Button
//                   onClick={handleFormSubmit}
//                   className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//                 >
//                   {editing ? "Update Batch" : "Create Batch"}
//                 </Button>
//                 <Button
//                   onClick={handleModalClose}
//                   className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//                 >
//                   Cancel
//                 </Button>
//                 {editing && (
//                   <Button onClick={handleDeleteBatch} className="bg-red-500">
//                     Delete
//                   </Button>
//                 )}
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ManageBatches;