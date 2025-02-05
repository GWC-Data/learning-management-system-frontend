import { Button } from "../../ui/button";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import { Edit, Trash } from "lucide-react";
import { ColDef } from "ag-grid-community";

import {
  createBatchModuleScheduleApi,
  fetchBatchModuleScheduleApi,
  updateBatchModuleScheduleApi,
  deleteBatchModuleScheduleApi,
} from "@/api/batchModuleScheduleApi";
import { fetchBatchApi } from "@/api/batchApi";
import { fetchCourseModuleApi } from "@/api/courseModuleApi";
import { fetchUsersApi } from "@/api/userApi";

interface BatchModuleScheduleTableProps {
  editable?: boolean;
}

interface ScheduleData {
  id: number;
  batchId: number;
  batchName: string;
  moduleId: number;
  moduleName: string;
  trainerId: number[];
  trainerName: string[];
  scheduleDateTime: string;
  duration: number;
}

interface Options {
  id: any;
  batchName: any;
  moduleName: any;
  trainerName: any;
}

//get token
const getToken = () => localStorage.getItem("authToken");

const BatchModuleScheduleTable = ({
  editable = true,
}: BatchModuleScheduleTableProps) => {
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [colDefs, setColDefs] = useState<ColDef[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [batches, setBatches] = useState<Options[]>([]);
  const [modules, setModules] = useState<Options[]>([]);
  const [trainers, setTrainers] = useState<Options[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [errors] = useState<Record<string, string>>({});
  const [selectedSchedules, setSelectedSchedules] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<ScheduleData | null>(
    null
  );
  const [newSchedule, setNewSchedule] = useState<ScheduleData>({
    id: 0,
    batchId: 0,
    batchName: "",
    moduleId: 0,
    moduleName: "",
    trainerId: [],
    trainerName: [],
    scheduleDateTime: "",
    duration: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);

  {
    /* pagination */
  }
  const recordsPerPage = 15;
  const totalPages = Math.ceil(schedules.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentData = schedules.slice(startIndex, startIndex + recordsPerPage);

  const handlePageChange = (newPage: SetStateAction<number>) => {
    setCurrentPage(newPage);
  };

  const fetchSchedules = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to view schedules.");
      return;
    }

    try {
      const schedulesResponse = await fetchBatchModuleScheduleApi();
      // Extract the data array
      const schedulesData = schedulesResponse?.data || [];

      // Safeguard with Array.isArray
      const schedules = Array.isArray(schedulesData)
        ? schedulesData.map((schedule: any) => ({
            id: schedule.id,
            batchId: schedule.batch?.id || 0,
            batchName: schedule.batch?.batchName || "Unknown Batch",
            moduleId: schedule.module?.id || 0,
            moduleName: schedule.module?.moduleName || "Unknown Module",
            trainerId: schedule.trainer?.id || [],
            trainerName: schedule.trainers
              ? schedule.trainers
                  .map(
                    (trainers: any) =>
                      `${trainers.firstName} ${trainers.lastName}`
                  )
                  .join(", ")
              : "Unknown Trainer",
            scheduleDateTime:
              typeof schedule.scheduleDateTime === "string"
                ? schedule.scheduleDateTime.replace(".000Z", "")
                : schedule.scheduleDateTime,
            duration: schedule.duration,
          }))
        : [];

      console.log("Parsed schedules:", schedules);

      const batchResponse = await fetchBatchApi();
      const batches = batchResponse.map(
        (batch: { id: any; batchName: any }) => ({
          id: batch.id,
          batchName: batch.batchName,
        })
      );
      setBatches(batches);

      const moduleResponse = await fetchCourseModuleApi();
      const modules = moduleResponse.map(
        (module: { id: any; moduleName: any }) => ({
          id: module.id,
          moduleName: module.moduleName,
        })
      );
      setModules(modules);

      const responseUser = await fetchUsersApi();
      const trainers = responseUser.Users.filter(
        (user: any) => user.role.name === "trainer"
      ).map((trainer: any) => ({
        id: trainer.id,
        trainerName: `${trainer.firstName} ${trainer.lastName}`,
      }));
      setTrainers(trainers);
      setSchedules(schedules);
    } catch (error) {
      console.error("Failed to fetch schedules", error);
      toast.error("Failed to fetch schedules. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const addNewSchedule = () => {
    setEditing(false);
    setNewSchedule({
      id: 0,
      batchId: 0,
      batchName: "",
      moduleId: 0,
      moduleName: "",
      trainerId: [],
      trainerName: [],
      scheduleDateTime: "",
      duration: 0,
    });
    setIsModalOpen(true);
  };

  const editSchedule = (schedule: ScheduleData) => {
    setEditing(true);
    setNewSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewSchedule({
      id: 0,
      batchId: 0,
      batchName: "",
      moduleId: 0,
      moduleName: "",
      trainerId: [],
      trainerName: [],
      scheduleDateTime: "",
      duration: 0,
    });
  };

  const confirmDeleteSchedule = (data: ScheduleData) => {
    const schedule = schedules.find((schedule) => schedule.id === data.id);
    if (schedule) {
      setScheduleToDelete(schedule);
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!scheduleToDelete) {
      toast.error("No schedule selected for deletion.");
      return;
    }

    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to perform this action.");
      return;
    }

    try {
      await deleteBatchModuleScheduleApi(scheduleToDelete.id);

      setBatches((prev) =>
        prev.filter((schedule) => schedule.id !== scheduleToDelete.id)
      );
      toast.success("Schedule deleted successfully!");
      fetchSchedules();
    } catch (error) {
      toast.error("Failed to delete schedule. Please try again later.");
    } finally {
      setDeleteModalOpen(false);
      setScheduleToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setScheduleToDelete(null);
  };

  const formatDateForBackend = (data: any) => {
    const newDate = new Date(data); // Convert to Date object
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(newDate.getDate()).padStart(2, "0");
    const hours = String(newDate.getHours()).padStart(2, "0");
    const minutes = String(newDate.getMinutes()).padStart(2, "0");
    // const seconds = String(newDate.getSeconds()).padStart(2, '0'); // Add seconds

    return `${year}-${month}-${day} ${hours}:${minutes}`; // Format as "YYYY-MM-DD HH:mm:ss"
  };

  const handleEditSchedule = (data: any) => {
    const scheduleToEdit = schedules.find(
      (schedule) => schedule.id === data.data.id
    );
    console.log("Batch to edit:", scheduleToEdit);

    if (scheduleToEdit) {
      setEditing(true);
      setNewSchedule({
        id: scheduleToEdit.id,
        batchId: scheduleToEdit.batchId,
        batchName: scheduleToEdit.batchName,
        moduleId: scheduleToEdit.moduleId,
        moduleName: scheduleToEdit.moduleName,
        trainerId: scheduleToEdit.trainerId,
        trainerName: scheduleToEdit.trainerName || "",
        scheduleDateTime: scheduleToEdit.scheduleDateTime, // Ensur // Ensure correct format
        duration: scheduleToEdit.duration,
      });
      setIsModalOpen(true);
    } else {
      console.error("Schedule not found for editing.");
      toast.error("Schedule not found for editing.");
    }
  };

  const handleFormSubmit = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to perform this action.");
      return;
    }

    // const validationErrors = validateFields();
    // if (Object.keys(validationErrors).length > 0) {
    //   return; // Stop further execution if errors exist
    // }

    // const scheduleToSubmit = {
    //   batchId: newSchedule.batchId,
    //   moduleId: newSchedule.moduleId,
    //   trainerIds: newSchedule.trainerId,
    //   scheduleDateTime: typeof newSchedule.scheduleDateTime === "string"
    //         ? newSchedule.scheduleDateTime.replace(".000Z", "")
    //         : newSchedule.scheduleDateTime,
    //   duration: newSchedule.duration
    // };

    // console.log('scheduleToSubmit', scheduleToSubmit);

    try {
      if (editing) {
        // const updateSchedule = await updateBatchModuleScheduleApi(newSchedule.id, scheduleToSubmit);
        // console.log('updateSchedule', updateSchedule)

        // fetchSchedules();

        // setSchedules((prev) =>
        //   prev.map((schedule) =>
        //     schedule.id === newSchedule.id
        //       ? { ...schedule, ...updateSchedule } // Ensure the new schedule data includes the updated duration
        //       : schedule
        //   )
        // );
        await updateBatchModuleScheduleApi(newSchedule.id, {
          batchId: newSchedule.batchId,
          moduleId: newSchedule.moduleId,
          trainerIds: newSchedule.trainerId,
          scheduleDateTime:
            typeof newSchedule.scheduleDateTime === "string"
              ? newSchedule.scheduleDateTime.replace(".000Z", "")
              : newSchedule.scheduleDateTime,
          duration: newSchedule.duration,
        });
        toast.success("Schedule updated successfully!");
      } else {
        //   const newScheduleData = await createBatchModuleScheduleApi(scheduleToSubmit);
        //   console.log('newBatch', newScheduleData)
        //   fetchSchedules();
        //   setSchedules((prev) => [...prev, newScheduleData]);
        //   toast.success("Schedule created successfully!");
        // }
        await createBatchModuleScheduleApi({
          batchId: newSchedule.batchId,
          moduleId: newSchedule.moduleId,
          trainerIds: newSchedule.trainerId,
          scheduleDateTime:
            typeof newSchedule.scheduleDateTime === "string"
              ? newSchedule.scheduleDateTime.replace(".000Z", "")
              : newSchedule.scheduleDateTime,
          duration: newSchedule.duration,
        });
        toast.success("BatchSchedule created successfully!");
      }
      fetchBatchModuleScheduleApi();
    } catch (error) {
      console.error("Failed to submit schedule", error);
      toast.error("Failed to submit schedule. Please try again later.");
    }

    handleModalClose();
  };

  const handleDeleteScheduleModule = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to delete a scheduleModule.");
      return;
    }

    try {
      await deleteBatchModuleScheduleApi(newSchedule.id);
      toast.success("Batch deleted successfully!");
      fetchBatchModuleScheduleApi();
      handleModalClose();
      setLoading(true);
    } catch (error) {
      toast.error("Failed to delete the batch. Please try again later.");
    }
  };

  useEffect(() => {
    setColDefs([
      { headerName: "Batch Name", field: "batchName", editable: false },
      { headerName: "Module Name", field: "moduleName", editable: false },
      { headerName: "Trainer Name", field: "trainerName", editable: false },
      {
        headerName: "Schedule DateTime",
        field: "scheduleDateTime",
        editable: false,
      },
      { headerName: "Duration", field: "duration", editable: false },
      {
        headerName: "Actions",
        field: "actions",
        width: 200,
        cellRenderer: (params: any) => {
          // console.log('cellrender', params.data)
          return (
            <div className="flex space-x-2">
              <Button
                onClick={() => handleEditSchedule(params)}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
              >
                <Edit className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => confirmDeleteSchedule(params.data)}
                className="bg-red-500 text-white p-2 rounded hover:bg-red-700"
              >
                <Trash className="h-5 w-5" />
              </Button>
            </div>
          );
        },
        editable: false,
      },
    ]);
  }, [schedules]);

  const uniquebatch = Array.from(
    new Map(schedules.map((schedule) => [schedule.batchName, schedule.batchId]))
  );

  const uniqueModule = Array.from(
    new Map(
      schedules.map((schedule) => [schedule.moduleName, schedule.moduleId])
    )
  );

  return (
    <div className="flex-1 p-4 mt-10 ml-24">
      <div className="flex items-center justify-between bg-custom-gradient text-white px-6 py-4 rounded-lg shadow-lg mb-6 w-[1147px]">
        <div className="flex flex-col">
          <h2 className="text-2xl font-metropolis font-semibold tracking-wide">
            Batch Module Schedule
          </h2>
          <p className="text-sm font-metropolis font-medium">
            Manage batch module schedules easily.
          </p>
        </div>
        <Button
          onClick={addNewSchedule}
          className="bg-yellow-400 text-gray-900 font-metropolis font-semibold px-5 py-2 rounded-md shadow-lg hover:bg-yellow-500 transition duration-300"
        >
          + New Schedule
        </Button>
      </div>

      {isDeleteModalOpen && scheduleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-auto">
            <h2 className="text-xl font-metropolis font-semibold mb-4">
              Confirm Delete
            </h2>
            <p className="mb-4 font-metropolis font-medium">
              Are you sure you want to delete the Batch{" "}
              <strong>
                {scheduleToDelete?.batchName?.charAt(0).toUpperCase() +
                  scheduleToDelete?.batchName?.slice(1).toLowerCase() ||
                  "this batchname"}
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
                onClick={handleDeleteSchedule}
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

      <div
        className="ag-theme-quartz text-left"
        style={{ height: "calc(100vh - 180px)", width: "88%" }}
      >
        <AgGridReact
          rowSelection="multiple"
          suppressRowClickSelection
          suppressMovableColumns
          loading={loading}
          columnDefs={colDefs}
          rowData={schedules}
          defaultColDef={{
            editable,
            sortable: true,
            filter: true,
            resizable: true,
          }}
          animateRows
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-metropolis font-semibold mb-4 text-center">
              {editing ? "Edit Schedule" : "Add New Schedule"}
            </h2>
            <form>
              <div className="mb-4">
                <label className="block font-metropolis font-medium mb-2">
                  Batch Name
                </label>
                <select
                  className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
                  value={newSchedule.batchId}
                  onChange={(e) =>
                    setNewSchedule({
                      ...newSchedule,
                      batchId: parseInt(e.target.value),
                      batchName:
                        uniquebatch.find(
                          ([_, id]) => id === parseInt(e.target.value)
                        )?.[0] || "",
                    })
                  }
                >
                  <option value="">Select a batch</option>
                  {batches.map((batch) => (
                    <option key={batch.batchName} value={batch.id}>
                      {batch.batchName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Module Selector */}
              <div className="mb-4">
                <label className="block font-metropolis font-medium mb-2">
                  Module Name
                </label>
                <select
                  value={newSchedule.moduleId}
                  onChange={(e) =>
                    setNewSchedule({
                      ...newSchedule,
                      moduleId: parseInt(e.target.value),
                      moduleName:
                        uniqueModule.find(
                          ([_, id]) => id === parseInt(e.target.value)
                        )?.[0] || "",
                    })
                  }
                  className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
                >
                  <option value="">Select a module</option>
                  {modules.map((module) => (
                    <option key={module.moduleName} value={module.id}>
                      {module.moduleName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Trainer Selector */}
              <div className="mb-4">
                <label className="block font-metropolis font-medium mb-2">
                  Trainers
                </label>
                <select
                  multiple
                  value={(newSchedule.trainerId || []).map((id) =>
                    id.toString()
                  )}
                  onChange={(e) => {
                    const selectedOptions = Array.from(
                      e.target.selectedOptions
                    );
                    const ids = selectedOptions.map((option) =>
                      parseInt(option.value)
                    );
                    const names = selectedOptions.map((option) => option.text);
                    setNewSchedule({
                      ...newSchedule,
                      trainerId: ids,
                      trainerName: names,
                    });
                  }}
                  className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
                >
                  {trainers.length === 0 ? (
                    <option value="">No trainers available</option>
                  ) : (
                    <>
                      <option value="">Select a Trainers</option>
                      {(trainers || []).map((trainer) => (
                        <option key={trainer.id} value={trainer.id.toString()}>
                          {trainer.trainerName}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Schedule DateTime */}
              <div className="mb-4">
                <label className="block font-metropolis font-medium mb-2">
                  Schedule Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={newSchedule.scheduleDateTime}
                  onChange={(e) =>
                    setNewSchedule({
                      ...newSchedule,
                      scheduleDateTime: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.endDate && (
                  <span className="text-red-500 text-sm">
                    {errors.ScheduleDateTime}
                  </span>
                )}
              </div>

              {/* Duration */}
              <div className="mb-4">
                <label className="block font-metropolis font-medium mb-2">
                  Duration (hours)
                </label>
                <input
                  type="number"
                  value={newSchedule.duration}
                  onChange={(e) =>
                    setNewSchedule({
                      ...newSchedule,
                      duration: parseInt(e.target.value),
                    })
                  }
                  className="w-full border rounded font-metropolis p-2 text-gray-400 font-semibold"
                />
                {errors.endDate && (
                  <span className="text-red-500 text-sm">
                    {errors.Duration}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button
                  onClick={handleFormSubmit}
                  className="bg-custom-gradient-btn text-white px-4 py-2 
                transition-all duration-500 ease-in-out 
               rounded-tl-3xl hover:rounded-tr-none hover:rounded-br-none hover:rounded-bl-none hover:rounded"
                >
                  {editing ? "Update Batch" : "Create Batch"}
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

export default BatchModuleScheduleTable;
