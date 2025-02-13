import React, { useEffect, useState } from "react";
import moment from "moment";
import { toast } from "sonner";
import { fetchBatchIdByTraineeIdApi } from "@/helpers/api/batchTrainee";
import { fetchBatchByIdApi } from "@/helpers/api/batchApi";
import { fetchBatchModuleScheduleByBatchIdApi } from "@/helpers/api/batchModuleScheduleApi";
import { fetchCourseAssignmentbybatchIdApi } from "@/helpers/api/courseAssignmentApi";
import { fetchUsersbyIdApi } from "@/helpers/api/userApi";
import { createAssignmentCompletionsApi } from "@/helpers/api/assignmentCompletionsApi";
import { useNavigate } from "react-router-dom";
import { fetchClassForModuleByModuleIdApi } from "@/helpers/api/classForModuleApi";

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  meetingLink?: string;
  batchId: number;
  trainers: string;
  duration: number;
  module: string;
  startTime: string;
  endTime: string;
  startDateModule: string;
  endDateModule: string;
  classDate: Date;
  classDescription: string;
  classRecordedLink: string;
  classTitle: string;
  isPastEvent?: boolean; // Add isPastEvent to CalendarEvent
}

// Event Interface for Assignments
interface AssignmentEvent {
  title: string;
  start: Date;
  end: Date;
  batchId: number;
  trainer: number;
  assignmentFile: string;
  id: number;
}

interface Assignment {
  id: number;
  courseAssignmentQuestionFile: string;
  courseAssignmentQuestionName: string;
  trainerId: number;
  assignStartDate: Date;
  assignEndDate: Date;
}

interface BatchFilter {
  id: number;
  name: string;
}

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [assignments, setAssignments] = useState<AssignmentEvent[]>([]);
  const [currentWeek, setCurrentWeek] = useState(moment().startOf("week"));
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>(
    []
  );
  const [trainerNames, setTrainerNames] = useState<Record<number, string>>({});

  const [batchFilters, setBatchFilters] = useState<BatchFilter[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    number | null
  >(null);
  const userId = Number(localStorage.getItem("userId"));

  useEffect(() => {
    fetchBatchesData();
  }, []);

  const getToken = () => localStorage.getItem("authToken");

  const navigate = useNavigate();

  const getUserId = () => {
    const token = getToken();
    if (token) {
      const userId = localStorage.getItem("userId");
      return userId ? parseInt(userId, 10) : null;
    }
    return null;
  };

  const fetchBatchesData = async () => {
    const token = getToken();
    const userId = getUserId();

    if (!token || userId === null) {
      toast.error("You must be logged in to view batches.");
      return;
    }

    try {
      const BatchIds = await fetchBatchIdByTraineeIdApi(userId);
      console.log("BatchIds", BatchIds);

      if (BatchIds.length === 0) {
        toast.error("No batches found for this trainee.");
        return;
      }

      const courseDetails: CalendarEvent[] = [];
      const assignmentDetails: AssignmentEvent[] = [];
      const filters: BatchFilter[] = [];

      for (const id of BatchIds) {
        const batchData = await fetchBatchByIdApi(id); // ✅ Declare batchData here
        console.log("Batch Data", batchData);

        const batchStart = moment(batchData.startDate);
        const batchEnd = moment(batchData.endDate); // ✅ Declare batchEnd

        const modules = await fetchBatchModuleScheduleByBatchIdApi(id);
        console.log("Modules for Batch", id, modules);

        const moduleIds = modules.map((module: any) => module.moduleId);
        console.log("Module IDs", moduleIds);

        // Fetch classes for each moduleId
        const classDataArray = await Promise.all(
          moduleIds.map((moduleId: any) =>
            fetchClassForModuleByModuleIdApi(moduleId)
          )
        );

        console.log("All Class Data:", classDataArray);

        const assignmentData: Assignment[] =
          await fetchCourseAssignmentbybatchIdApi(id);
        console.log("Assignment Data", assignmentData);

        let lastModuleEnd = batchStart.clone(); // ✅ Initialize lastModuleEnd before using it

        // Process module schedules
        if (modules && Array.isArray(modules)) {
          modules.forEach((module) => {
            const moduleStart = moment(module.startDate);
            const moduleEnd = moment(module.endDate);

            // Updated code to filter class data based on module start and end dates
            const mappedClassData = classDataArray.flatMap((moduleClasses) =>
              moduleClasses
                .filter(
                  (classItem: any) =>
                    moment(classItem.classDate).isSameOrAfter(
                      moment(module.startDate)
                    ) &&
                    moment(classItem.classDate).isSameOrBefore(
                      moment(module.endDate)
                    )
                )
                .map((classItem: any) => ({
                  classDate: classItem?.classDate || "",
                  classDescription: classItem?.classDescription || "",
                  classRecordedLink: classItem?.classRecordedLink || "",
                  classTitle: classItem?.classTitle || "",
                }))
            );

            console.log(mappedClassData, 'mappedClassData')

            while (moduleStart.isSameOrBefore(moduleEnd)) {
              if (moduleStart.day() !== 0) {
                courseDetails.push({
                  title: batchData.batchName,
                  module: module.module.moduleName,
                  start: moduleStart.toDate(),
                  end: moduleStart.clone().endOf("day").toDate(),
                  startTime: module.startTime,
                  endTime: module.endTime,
                  startDateModule: module.startDate,
                  endDateModule: module.endDate,
                  meetingLink: module.meetingLink,
                  batchId: id,
                  trainers: module.trainers
                    .map(
                      (trainer: any) =>
                        trainer.firstName + " " + trainer.lastName
                    )
                    .join(", "),
                  duration: module.duration,
                  isPastEvent: moment(moduleStart).isBefore(moment(), "day"), // Determine if it's a past event
                  classDate:
                    mappedClassData.length > 0
                      ? mappedClassData[0].classDate
                      : null,
                  classDescription:
                    mappedClassData.length > 0
                      ? mappedClassData[0].classDescription
                      : "",
                  classRecordedLink:
                    mappedClassData.length > 0
                      ? mappedClassData[0].classRecordedLink
                      : "",
                  classTitle:
                    mappedClassData.length > 0
                      ? mappedClassData[0].classTitle
                      : "",
                });
              }
              lastModuleEnd = moduleStart.clone(); // ✅ Update lastModuleEnd safely
              moduleStart.add(1, "day");
            }
          });
        }
        console.log(courseDetails, "courseDetails");

        // Process course assignments
        if (assignmentData && Array.isArray(assignmentData)) {
          assignmentData.forEach((assignment) => {
            // Convert string dates to Date objects
            const endDate = new Date(assignment.assignEndDate);
            const startDate = new Date(assignment.assignStartDate);

            assignmentDetails.push({
              id: assignment.id,
              title: assignment.courseAssignmentQuestionName,
              start: startDate,
              end: endDate,
              batchId: id,
              trainer: assignment.trainerId,
              assignmentFile: assignment.courseAssignmentQuestionFile,
            });
          });
        }

        console.log("course assignments", assignmentDetails);

        // Ensure events continue until batch end date
        while (lastModuleEnd.isBefore(batchEnd)) {
          // ✅ Now batchEnd is correctly referenced
          lastModuleEnd.add(1, "day");
          if (lastModuleEnd.day() !== 0) {
            courseDetails.push({
              title: batchData.batchName + " (No Module Scheduled)",
              module: "No Module",
              start: lastModuleEnd.toDate(),
              end: lastModuleEnd.clone().endOf("day").toDate(),
              startTime: "",
              endTime: "",
              startDateModule: "",
              endDateModule: "",
              meetingLink: "",
              batchId: id,
              trainers: "No Trainers Assigned",
              duration: 0,
              isPastEvent: false, // Mark this as not a past event
              classDate: new Date(),
              classDescription: "",
              classRecordedLink: "",
              classTitle: "",
            });
          }
        }

        filters.push({ id, name: batchData.batchName });
      }

      console.log("Processed Assignment Details:", assignmentDetails);

      setEvents(courseDetails);
      setAssignments(assignmentDetails);
      setBatchFilters(filters);
      setSelectedBatch(BatchIds[0]); // Select the first batch by default
    } catch (error) {
      toast.error("Error fetching batch schedule.");
      console.error(error);
    }
  };

  const buildCalendarDays = () => {
    const startDay = moment(currentWeek).startOf("week");
    const days = [];

    for (let i = 0; i < 7; i++) {
      days.push(startDay.clone().add(i, "days"));
    }

    return days;
  };

  const getEventsForDay = (day: moment.Moment) => {
    if (day.day() === 0 || selectedBatch === null) return [];
    console.log("events", events);

    console.log(
      "filter",
      events.filter((event) => moment(day).isSame(event.start, "day"))
    );
    return events.filter((event) => moment(day).isSame(event.start, "day"));
  };

  const getAssignmentsForDay = (day: moment.Moment) => {
    if (day.day() === 0 || selectedBatch === null) return [];

    // console.log("Checking assignments for:", day.format("YYYY-MM-DD"));
    console.log("All Assignments:", assignments);

    console.log(
      "assign",
      assignments.filter((assignment) =>
        moment(day).isSame(assignment.end, "day")
      )
    );
    return assignments.filter((assignment) =>
      moment(day).isSame(assignment.end, "day")
    );
  };

  const handleDayClick = (event: CalendarEvent) => {
    if (event) {
      setSelectedEvent(event);
      setShowModal(true);
    } else {
      toast.info("No events scheduled for this day.");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDayEvents([]);
    setSelectedEvent(null);
  };

  const changeWeek = (offset: number) => {
    setCurrentWeek(moment(currentWeek).add(offset, "weeks"));
  };

  const fetchTrainerNames = async (trainerId: number) => {
    if (trainerId in trainerNames) return; // Skip fetching if already cached

    try {
      const trainer = await fetchUsersbyIdApi(trainerId); // API Call
      console.log("Fetched Trainer:", trainer);

      setTrainerNames((prev) => ({
        ...prev,
        [trainerId]: `${trainer.firstName} ${trainer.lastName}`,
      }));
    } catch (error) {
      console.error("Error fetching trainer name:", error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        console.log("Base64 String:", base64String);
      };
      reader.onerror = (error) => {
        console.error("Error converting file to Base64:", error);
      };

      reader.readAsDataURL(file); // Converts the file to a Base64 string
    }
  };

  const handleUpload = async (assignmentId: number) => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    setSelectedAssignmentId(assignmentId); // Automatically select the assignment when upload is clicked

    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64String = reader.result as string;

      const payload = {
        traineeId: userId || "", // Send userId as string or empty string if null
        courseAssignId: Number(assignmentId), // Send as number
        courseAssignmentAnswerFile: base64String, // Send base64 string
        obtainedMarks: 0, // Default to 0
      };
      console.log("Payload:", payload);

      try {
        await createAssignmentCompletionsApi(payload); // Update the API to handle JSON payload
        alert("File uploaded successfully!");
        setSelectedFile(null);
        setSelectedAssignmentId(null);
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Failed to upload file. Please try again.");
      }
    };

    reader.onerror = (error) => {
      console.error("Error converting file to Base64:", error);
    };

    reader.readAsDataURL(selectedFile); // Converts the file to a Base64 string
  };

  const handleWatchRecording = () => {
    if (selectedEvent) {
      // ✅ Convert title to lowercase, preserving numbers and hyphens
      const formattedTitle = selectedEvent.title
        .toLowerCase()
        .replace(/\s+/g, "%20");
      navigate(`/trainee/enrolledCourses/${formattedTitle}`);
    }
  };

  useEffect(() => {
    assignments.forEach((assignment) => {
      fetchTrainerNames(assignment.trainer); // Fetch trainer for each assignment
    });
  }, [assignments]);

  return (
    <div className="h-[900px] p-4">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Calendar Header */}
        <div className="p-4 flex justify-between items-center bg-[#6e2b8b] text-white">
          <button
            onClick={() => changeWeek(-1)}
            className="px-4 py-2 rounded hover:bg-white hover:text-black"
          >
            Previous Week
          </button>
          <h2 className="text-xl font-bold">
            {currentWeek.format("MMM D")} -{" "}
            {currentWeek.clone().endOf("week").format("MMM D, YYYY")}
          </h2>
          <button
            onClick={() => changeWeek(1)}
            className="px-4 py-2 rounded hover:bg-white hover:text-black"
          >
            Next Week
          </button>
        </div>

        {/* Calendar Days Header */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="bg-[#FAF2FD] hover:bg-white p-2 text-center font-semibold"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 h-[calc(100vh-120px)]">
          {buildCalendarDays().map((day, index) => {
            const dayEvents = getEventsForDay(day); // Get module events
            console.log("dayEvents", dayEvents);
            const dayAssignments = getAssignmentsForDay(day); // Get assignments
            console.log("dayAssignments", dayAssignments);
            const isSunday = day.day() === 0;
            const isPastDay = day.isBefore(moment(), "day");
            const isToday = day.isSame(moment(), "day");

            return (
              <div
                key={index}
                className={`min-h-[200px] p-2 transition-colors ${
                  isToday ? "bg-gray-50" : "bg-white"
                } ${isSunday ? "bg-gray-100" : "hover:bg-gray-200"} ${
                  isPastDay ? "bg-gray-50" : ""
                }`}
              >
                {/* Display Date */}
                <div
                  className={`font-semibold text-sm mb-1 ${isToday ? "text-[#6E2B8B]" : ""}`}
                >
                  {day.format("D")}
                </div>

                <div className="max-h-[2000px] overflow-y-auto">
                  {/* === MODULES LIST (EVENTS) === */}
                  {dayEvents.length > 0 &&
                    dayEvents.some((event) => event.module !== "No Module") && (
                      <div className="mb-2">
                        <div className="text-xs font-bold text-[#6E2B8B] mb-1">
                          Modules
                        </div>
                        {dayEvents.map((event, eventIndex) => {
                          if (event.module === "No Module") return null; // ✅ Skip rendering No Module events

                          const isPastEvent = moment(event.start).isBefore(
                            moment(),
                            "day"
                          );

                          return (
                            <div
                              key={`event-${eventIndex}`}
                              onClick={() => handleDayClick(event)}
                              className={`text-xs p-2 mb-1 rounded cursor-pointer ${
                                isPastEvent
                                  ? "bg-green-200 hover:bg-green-300"
                                  : "bg-[#FAF2FD] hover:bg-[#d5afe3]"
                              }`}
                            >
                              <div className="font-semibold">{event.title}</div>
                              <div>
                                {event.startTime} - {event.endTime}
                              </div>
                              <div className="truncate">{event.module}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  {/* === ASSIGNMENTS LIST === */}
                  {dayAssignments.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-yellow-700 mb-1">
                        Assignments
                      </div>
                      {dayAssignments.map((assignment, assignmentIndex) => {
                        // // Check if the assignment is in the past
                        const isPastAssignment = moment(
                          assignment.start
                        ).isBefore(moment(), "day");
                        console.log("isPastAssignment", isPastAssignment);
                        console.log("assignment", assignment.start);

                        return (
                          <div
                            key={`assignment-${assignmentIndex}`}
                            className="text-xs p-2 mb-1 rounded cursor-pointer bg-yellow-200 hover:bg-yellow-300 w-[210px]"
                          >
                            {/* Assignment Title */}
                            <div className="font-semibold">
                              {assignment.title}
                            </div>

                            {/* Display Assignment File (as a link to download or preview) */}
                            <div className="truncate">
                              {assignment.assignmentFile && (
                                <a
                                  href={assignment.assignmentFile}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 underline text-sm"
                                  download
                                >
                                  Download Assignment File
                                </a>
                              )}
                            </div>

                            {/* Optional: If you want to display the trainer name */}
                            <div className="text-sm text-gray-600">
                              <strong>Trainer: </strong>
                              {trainerNames[assignment.trainer] || "Loading..."}
                            </div>

                            <div className="text-sm text-gray-600">
                              <strong>Start: </strong>
                              {moment(assignment.start).format("MMMM D, YYYY")}
                            </div>
                            <div className="text-sm text-gray-600">
                              <strong>End: </strong>
                              {moment(assignment.end).format("MMMM D, YYYY")}
                            </div>

                            {/* Upload Section */}
                            <div className="text-sm text-gray-600">
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                                className="mb-4"
                              />
                              <button
                                onClick={() => handleUpload(assignment.id)} // Automatically select assignment when clicked
                                className="bg-green-500 text-white py-2 px-4 rounded-lg shadow hover:bg-green-600 transition-all"
                              >
                                Upload Answers
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Event Modal */}
        {showModal && selectedEvent && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-6">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md transform transition-all scale-95 hover:scale-100">
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {selectedEvent.title}
                  </h2>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-[#FAF2FD] p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">Module:</span>{" "}
                    {selectedEvent.module}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">Trainer:</span>{" "}
                    {selectedEvent.trainers}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">Date:</span>{" "}
                    {moment(selectedEvent.start).format("MMMM D, YYYY")}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">Start Time:</span>{" "}
                    {selectedEvent.startTime}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">End Time:</span>{" "}
                    {selectedEvent.endTime}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">Duration:</span>{" "}
                    {selectedEvent.duration + " minutes"}
                  </p>

                  {selectedEvent.isPastEvent ? (
                    <a
                      href={`http://localhost:5173/#/trainee/enrolledCourses/${encodeURIComponent(selectedEvent.title.toLowerCase())}`}
                      className="inline-block text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm text-center w-full bg-green-500 hover:bg-green-600"
                    >
                      Watch Recording
                    </a>
                  ) : (
                    <a
                      href={selectedEvent.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm text-center w-full bg-[#6e2b8b] hover:bg-[#9a5eb5]"
                    >
                      Join Meeting
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
