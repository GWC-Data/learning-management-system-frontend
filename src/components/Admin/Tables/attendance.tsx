import React, { useState, useEffect, SetStateAction } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { toast } from "react-toastify";
import Select from "react-select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getAttendanceFilterByIdApi,
  createAttendanceFileApi,
  fetchAttendanceApi,
  fetchAttendanceFileApi,
  createAttendanceApi,
} from "@/helpers/api/attendance";
import { fetchUsersApi } from '@/helpers/api/userApi';
import { fetchBatchApi } from '@/helpers/api/batchApi';
import { fetchCourseModuleApi } from '@/helpers/api/courseModuleApi';
import { fetchClassForModuleApi } from '@/helpers/api/classForModuleApi';
import { fetchCourseApi } from '@/helpers/api/courseApi';

interface Attendance {
  percentage: string;
  attendance: string;
  duration: number;
  lastLeave: string;
  firstJoin: string;
  teamsRole: string;
  email: string;
  userName: string;
  userId: string;
  id: string;
  batchId: string;
  batchName: string;
  moduleId: string;
  moduleName: string;
  courseId: string;
  courseName: string;
  classId: string;
  classTitle: string;
  excelFile: string;
  attendanceFileId: string;
  teamsAttendanceFile: string;
}

interface AttendanceFile {
  id: string;
  teamsAttendanceFile: string;
  attendanceDate: string;
  classId: string;
  classTitle: string;
}

type DataRow = { [key: string]: string | number };

const getToken = () => localStorage.getItem("authToken");

const Attendance: React.FC = () => {
  const [csvData, setCsvData] = useState<DataRow[]>([]); // Raw CSV data
  const [processedData, setProcessedData] = useState<DataRow[]>([]); // Processed data
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]); // Column headers
  const [summary, setSummary] = useState<Record<string, string>>({});
  const [meetingDuration, setMeetingDuration] = useState<string>("");
  const [isFileUploaded, setIsFileUploaded] = useState<boolean>(false);
  const [secondFileUploaded, setSecondFileUploaded] = useState(false);
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileDownloaded, setFileDownloaded] = useState(false);
  const [attendanceFile, setAttendanceFile] = useState<File | null>(null);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [users, setUsers] = useState<Attendance[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isNewAttendanceModalOpen, setIsNewAttendanceModalOpen] = useState(false);
  const [attendanceDataFile, setAttendanceDataFile] = useState<AttendanceFile[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [batches, setBatches] = useState<Attendance[]>([]);
  const [modules, setModules] = useState<Attendance[]>([]);
  const [courses, setCourses] = useState<Attendance[]>([]);
  const [classes, setClasses] = useState<Attendance[]>([]);
  const [newAttendanceFile, setNewAttendanceFile] = useState<AttendanceFile>({
    id: "",
    classId: "",
    classTitle: "",
    attendanceDate: "",
    teamsAttendanceFile: "",
  });
  const [newAttendance, setNewAttendance] = useState<Attendance>({
    id: "",
    userId: "",
    userName: "",
    batchId: "",
    batchName: "",
    moduleId: "",
    moduleName: "",
    courseId: "",
    courseName: "",
    classId: "",
    classTitle: "",
    excelFile: "",
    email: "",
    attendance: "",
    teamsRole: "",
    firstJoin: "",
    lastLeave: "",
    percentage: "",
    attendanceFileId: "",
    teamsAttendanceFile: "",
    duration: 0,
  });

  // Filter states
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  // Filtered data
  const filteredData = attendanceData.filter((row) => {
    return (
      (!selectedUserId || row.userId.toString() === selectedUserId) &&
      (!selectedClassId || row.classId.toString() === selectedClassId) &&
      (!selectedBatchId || row.batchId.toString() === selectedBatchId) &&
      (!selectedCourseId || row.courseId.toString() === selectedCourseId) &&
      (!selectedModuleId || row.moduleId.toString() === selectedModuleId)
    );
  });

  
  {/* pagination */ }
  const recordsPerPage = 10;
  const totalPages = Math.ceil(attendanceData.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentData = attendanceData.slice(startIndex, startIndex + recordsPerPage);

  const handlePageChange = (newPage: SetStateAction<number>) => {
    setCurrentPage(newPage);
  };

  const fetchAttendanceById = async (
    userId?: string | null,
    classId?: string | null,
    batchId?: string | null,
    courseId?: string | null,
    moduleId?: string | null
  ) => {
    try {
      // Build query params based on provided values
      const queryParams = new URLSearchParams();
      if (userId) queryParams.append("userId", userId);
      if (classId) queryParams.append("classId", classId);
      if (batchId) queryParams.append("batchId", batchId);
      if (courseId) queryParams.append("courseId", courseId);
      if (moduleId) queryParams.append("moduleId", moduleId);

      // Call the API with dynamic query parameters
      const response = await getAttendanceFilterByIdApi(
        `?${queryParams.toString()}`
      );

      // Check if attendance data exists
      if (response.data && response.data.attendanceRecords.length > 0) {
        setAttendanceData(response.data.attendanceRecords);
      } else {
        toast.info("No attendance records found for the selected filters.");
        setAttendanceData([]);
      }
    } catch (error) {
      console.error("Error fetching attendance by filters:", error);
      toast.error("Failed to fetch attendance data.");
    }
  };

  // Handle filter change
  const handleFilterChange = (
    filterType: string,
    value: string | null
  ) => {
    switch (filterType) {
      case "userId":
        setSelectedUserId(value);
        break;
      case "classId":
        setSelectedClassId(value);
        break;
      case "batchId":
        setSelectedBatchId(value);
        break;
      case "courseId":
        setSelectedCourseId(value);
        break;
      case "moduleId":
        setSelectedModuleId(value);
        break;
      default:
        break;
    }
  };

  // Apply filters
  const applyFilters = () => {
    fetchAttendanceById(
      selectedUserId,
      selectedClassId,
      selectedBatchId,
      selectedCourseId,
      selectedModuleId
    );
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedUserId(null);
    setSelectedClassId(null);
    setSelectedBatchId(null);
    setSelectedCourseId(null);
    setSelectedModuleId(null);
    fetchAttendance();
  };

  const handleAttendanceFileUpload = async () => {
    // Ensure valid data before proceeding
    if (!newAttendanceFile.classId || !newAttendanceFile.attendanceDate || !attendanceFile) {
      toast.error("Please fill all fields and upload the file.");
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData object
      const formData = new FormData();
      formData.append("classId", newAttendanceFile.classId);
      formData.append("attendanceDate", newAttendanceFile.attendanceDate);
      formData.append("teamsAttendanceFile", attendanceFile);

      await createAttendanceFileApi(formData);

      if (attendanceFile.type === "text/csv") {
        Papa.parse(attendanceFile, {
          complete: (result) => {
            console.log("CSV Parsing completed:", result);
            if (result.data && Array.isArray(result.data)) {
              const data = result.data as DataRow[];
              processCsvData(data);
              setIsFileUploaded(true);
              toast.success(`Parsed ${data.length} rows successfully.`);
            } else {
              toast.error("Failed to parse CSV data");
            }
          },
          header: true,
          error: (error) => {
            console.error("Error parsing CSV:", error);
            toast.error("Failed to parse CSV file");
          }
        });
      } else {
        toast.error("Please upload a CSV file");
      };

      setShowSuccessModal(true);

      setTimeout(() => {
        setShowSuccessModal(false);
        setIsUploading(false);
      }, 3000);

      setNewAttendanceFile({
        id: "",
        classId: "",
        classTitle: "",
        attendanceDate: "",
        teamsAttendanceFile: "",
      });
      setAttendanceFile(null);
      setIsFileUploaded(true);
      setIsUploadModalOpen(false);
      toast.success("Attendance file uploaded to GCP successfully.");
    } catch (error) {
      console.error("Error uploading attendance file:", error);
      toast.error("Failed to upload attendance file.");
      setIsUploading(false);
      setShowSuccessModal(false)
    }
  };

  const processCsvData = (data: DataRow[]) => {
    console.log("Initial data:", data);

    const extractedSummary: Record<string, string> = {};

    // Extract summary information
    data.forEach((row) => {
      if (row["1. Summary"]?.toString().trim() === "Meeting title") {
        extractedSummary["Meeting title"] = row[""]?.toString().trim() || "";
      }
      if (row["1. Summary"]?.toString().trim() === "Start time") {
        extractedSummary["Start time"] = row[""]?.toString().trim() || "";
      }
      if (row["1. Summary"]?.toString().trim() === "End time") {
        extractedSummary["End time"] = row[""]?.toString().trim() || "";
      }
      if (row["1. Summary"]?.toString().trim() === "Meeting duration") {
        extractedSummary["Average attendance time"] =
          row[""]?.toString().trim() || "";
      }
    });

    console.log("Extracted Summary Data:", extractedSummary);

    // Store summary in state
    setSummary(extractedSummary);

    // Calculate Total Meeting Duration
    let totalMeetingDuration = "";
    if (extractedSummary["Start time"] && extractedSummary["End time"]) {
      const startTime = new Date(extractedSummary["Start time"]);
      const endTime = new Date(extractedSummary["End time"]);

      if (!isNaN(startTime.getTime()) && !isNaN(endTime.getTime())) {
        const diffInSeconds = Math.floor(
          (endTime.getTime() - startTime.getTime()) / 1000
        );
        const hours = Math.floor(diffInSeconds / 3600);
        const minutes = Math.floor((diffInSeconds % 3600) / 60);
        const seconds = diffInSeconds % 60;

        let formattedDuration = "";
        if (hours > 0) {
          formattedDuration += `${hours}h `;
        }
        if (minutes > 0 || hours > 0) {
          formattedDuration += `${minutes}m `;
        }
        formattedDuration += `${seconds}s`;

        totalMeetingDuration = formattedDuration.trim();
      } else {
        console.error("Invalid start or end time format");
      }
    }

    setMeetingDuration(totalMeetingDuration); // Store total meeting duration in state

    // Regex to find "2. Participants"
    const participantsRegex = /^2\.\s*Participants/;
    let participantsRowIndex = data.findIndex((row) =>
      participantsRegex.test(row["1. Summary"]?.toString() || "")
    );

    if (participantsRowIndex !== -1) {
      console.log('Removing all rows above and including "2. Participants"');
      data = data.slice(participantsRowIndex + 1); // Keep only rows AFTER "2. Participants"
    }

    console.log("Filtered data after participants section:", data);

    // Ensure the next row becomes the header
    let finalHeaders: string[] = [];
    if (data.length > 0) {
      const rawHeaders = Object.values(data[0]).map((header) =>
        header?.toString().trim()
      );

      // Get the index of "Participant ID (UPN)" to remove it correctly from data mapping
      const removeIndex = rawHeaders.indexOf("Participant ID (UPN)");

      // Filter out the unwanted column
      finalHeaders = rawHeaders.filter(
        (header) => header !== "Participant ID (UPN)"
      );

      data = data.slice(1); // Remove header row

      // Convert data to match new headers
      data = data.map((row) => {
        const rowValues = Object.values(row); // Extract values from row object
        const newRow: DataRow = {};

        finalHeaders.forEach((key, index) => {
          // Skip the value at removeIndex when assigning newRow values
          const adjustedIndex =
            removeIndex !== -1 && index >= removeIndex ? index + 1 : index;
          newRow[key] = rowValues[adjustedIndex] || ""; // Ensure proper mapping
        });

        return newRow;
      });

      // Update headers in the state after processing
      setCsvHeaders(finalHeaders);
    }

    // Regex to find "3. In-Meeting Activities"
    const activitiesRegex = /^3\.\s*In-Meeting Activities/;
    let activitiesRowIndex = data.findIndex((row) =>
      activitiesRegex.test(Object.values(row)[0]?.toString() || "")
    );

    if (activitiesRowIndex !== -1) {
      console.log('Removing all rows below "3. In-Meeting Activities"');
      data = data.slice(0, activitiesRowIndex); // Keep only rows BEFORE "3. In-Meeting Activities"
    }

    // Process and group by Email
    const groupedData: { [email: string]: DataRow } = {};

    data.forEach((row) => {
      const email = row["Email"]?.toString().trim();
      const duration = row["In-Meeting Duration"]?.toString().trim();

      if (!email || !duration) return; // Skip if email or duration is missing

      const totalSeconds = convertDurationToSeconds(duration);

      if (!groupedData[email]) {
        groupedData[email] = { ...row, "In-Meeting Duration": totalSeconds };
      } else {
        groupedData[email]["In-Meeting Duration"] =
          (groupedData[email]["In-Meeting Duration"] as number) + totalSeconds;
      }
    });

    // Convert back to HH:MM:SS format and calculate attendance
    const finalData = Object.values(groupedData).map((row) => {
      const inMeetingDurationInSeconds = row["In-Meeting Duration"] as number;

      // Calculate the attendance percentage
      const totalMeetingDurationInSeconds =
        convertDurationToSeconds(totalMeetingDuration);
      const attendancePercentage =
        (inMeetingDurationInSeconds / totalMeetingDurationInSeconds) * 100;

      // Mark attendance based on the threshold (75%)
      row["Participation Rate"] = attendancePercentage.toFixed(2) + "%";
      row["Attendance"] = attendancePercentage >= 75 ? "Present" : "Absent";

      return {
        ...row,
        "In-Meeting Duration": convertSecondsToDuration(
          inMeetingDurationInSeconds
        ),
      };
    });

    console.log("Final Grouped Data (With Attendance):", finalData);

    setProcessedData(finalData);
    setIsFileUploaded(false);
    setFileDownloaded(true);
  };

  // Function to export displayed data to Excel
  // const handleDownloadExcel = () => {
  //   if (processedData.length === 0) {
  //     toast.error("No data available to export.");
  //     return;
  //   }

  //   try {
  //     // Create a new workbook and worksheet
  //     const wb = XLSX.utils.book_new();
  //     const ws = XLSX.utils.json_to_sheet(processedData);

  //     // Append worksheet to workbook
  //     XLSX.utils.book_append_sheet(wb, ws, "Processed Data");

  //     // Create and download Excel file
  //     XLSX.writeFile(wb, `Attendance_Data_${new Date().toISOString().split('T')[0]}.xlsx`);

  //     toast.success("Excel file downloaded successfully");

  //     setNewAttendanceFile({
  //       id: "",
  //       classId: "",
  //       classTitle: "",
  //       attendanceDate: "",
  //       teamsAttendanceFile: "",
  //     });
  //     setAttendanceFile(null);
  //     setIsFileUploaded(false);
  //   } catch (error) {
  //     console.error("Error downloading Excel:", error);
  //     toast.error("Failed to download Excel file");
  //   }
  // };

  // const handleDownloadExcel = () => {
  //   if (processedData.length === 0) {
  //     toast.error("No data available to export.");
  //     return;
  //   }

  //   try {
  //     const wb = XLSX.utils.book_new();
  //     const ws = XLSX.utils.json_to_sheet(processedData);

  //     XLSX.utils.book_append_sheet(wb, ws, "Processed Data");
  //     XLSX.writeFile(wb, `Attendance_Data_${new Date().toISOString().split('T')[0]}.xlsx`);

  //     toast.success("Excel file downloaded successfully.");

  //     // ✅ Clear State After Download
  //     setNewAttendanceFile({
  //       id: "",
  //       classId: "",
  //       classTitle: "",
  //       attendanceDate: "",
  //       teamsAttendanceFile: "",
  //     });
  //     setAttendanceFile(null);
  //     setIsFileUploaded(false);
  //   } catch (error) {
  //     console.error("Error downloading Excel:", error);
  //     toast.error("Failed to download Excel file.");
  //   }
  // };

  const handleDownloadExcel = () => {
    if (processedData.length === 0) {
      toast.error("No data available to export.");
      console.log("download", processedData);
      return;
    }

    try {
      // ✅ Convert CSV Data to Excel Sheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(processedData);

      // Append Sheet to Workbook
      XLSX.utils.book_append_sheet(wb, ws, "Attendance Data");

      // Generate File Name with Date
      XLSX.writeFile(wb, `Attendance_Data_${new Date().toISOString().split('T')[0]}.xlsx`);

      // Show Success Toast
      toast.success("Excel file downloaded successfully.");

      //Clear State After Download (Only Reset Processed Data)
      setProcessedData([]);
      setCsvData([]);
      setAttendanceFile(null);

      // Reset Other States After Download
      setNewAttendanceFile({
        id: "",
        classId: "",
        classTitle: "",
        attendanceDate: "",
        teamsAttendanceFile: "",
      });

      // Optional: Keep Button Enabled Until a New File is Uploaded
      toast.success("You can now upload a new attendance file.");
    } catch (error) {
      console.error("Error downloading Excel:", error);
      toast.error("Failed to download Excel file.");
    }
  };


  // Function to convert "MMm SSs" or "HHh MMm SSs" into total seconds
  const convertDurationToSeconds = (duration: string): number => {
    if (!duration) return 0;

    const regex = /(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?/;
    const matches = duration.match(regex);

    if (!matches) return 0;

    const hours = matches[1] ? parseInt(matches[1]) * 3600 : 0;
    const minutes = matches[2] ? parseInt(matches[2]) * 60 : 0;
    const seconds = matches[3] ? parseInt(matches[3]) : 0;

    return hours + minutes + seconds;
  };

  // Function to convert total seconds back to "HHh MMm SSs" format
  const convertSecondsToDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours > 0 ? hours + "h " : ""}${minutes > 0 || hours > 0 ? minutes + "m " : ""
      }${remainingSeconds}s`;
  };

  const fetchAttendance = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to view batches.");
      return;
    }

    try {
      const responseAttendance = await fetchAttendanceApi();
      console.log("responseAttendance", responseAttendance);

      // Format attendance data
      const attendance = Array.isArray(responseAttendance?.attendance)
        ? responseAttendance.attendance.map((a: any) => {
          const userName = a.userName || "Unknown";
          console.log("userName", userName);

          return {
            id: a.attendanceId || 0,
            userId: a.userId || 0,
            userName: userName,
            batchId: a.batchId || 0,
            batchName: a.batchName || "N/A",
            moduleId: a.moduleId || 0,
            moduleName: a.moduleName || "N/A",
            courseId: a.courseId || 0,
            courseName: a.courseName || "N/A",
            classId: a.classId || 0,
            classTitle: a.classTitle || "N/A",
            attendanceFileId: a.attendanceFileId || 0,
            teamsAttendanceFile: a.teamsAttendanceFile || "",
            email: a.email || "N/A",
            teamsRole: a.teamsRole || "N/A",
            firstJoin: a.firstJoin?.value || a.firstJoin || "N/A",
            lastLeave: a.lastLeave?.value || a.lastLeave || "N/A",
            duration: a.duration || 0,
            attendance: a.attendance ? "Present" : "Absent",
            percentage: a.percentage || "N/A",
          };
        })
        : [];

      console.log("Finalized Attendance Data:", attendance);

      // Fetch users data
      const responseUser = await fetchUsersApi();
      const users = responseUser.users
        .filter((user: any) =>
          ["trainee", "trainer"].includes(user.roleName.toLowerCase())
        )
        .map((trainee: any) => ({
          id: trainee.id,
          userName: `${trainee.firstName} ${trainee.lastName}`.trim(),
        }));

      setUsers(users);
      console.log("Filtered Users", users);

      // Fetch batch data
      const batchResponse = await fetchBatchApi();
      console.log("batchResponse", batchResponse);
      const batches = batchResponse.batch.map(
        (batch: { id: string; batchName: any }) => ({
          id: batch.id,
          batchName: batch.batchName,
        })
      );
      setBatches(batches);
      console.log("batches", batches);

      // Fetch class data
      const classResponse = await fetchClassForModuleApi();
      console.log("classResponse", classResponse);

      const classMap = Array.isArray(classResponse?.classes)
        ? classResponse.classes.map(
          (c: { classId: string; classTitle: string }) => ({
            id: c.classId,
            classTitle: c.classTitle
          })
        )
        : [];

      setClasses(classMap);
      console.log("classResponse", classMap);

      // Fetch module data
      const moduleResponse = await fetchCourseModuleApi();
      console.log("moduleResponssssse", moduleResponse)
      const modules = moduleResponse.map(
        (module: { moduleId: any; moduleName: any }) => ({
          id: module.moduleId,
          moduleName: module.moduleName,
        })
      );
      setModules(modules);
      console.log("moduleResponse", moduleResponse);

      // Fetch course data
      const courseResponse = await fetchCourseApi();
      console.log("courseressssss", courseResponse);
      const course = courseResponse.map((course: any) => ({
        id: course.courseId,
        courseName: course.courseName,
      }));
      setCourses(course);
      console.log("course", courseResponse);

      // Fetch attendance file data
      const response = await fetchAttendanceFileApi();
      console.log("Fetched Attendance Data:", response);

      // Ensure unique entries
      const uniqueFiles = response.attendanceFile.filter(
        (file: { id: any }, index: any, self: any[]) =>
          self.findIndex((t) => t.id === file.id) === index
      );

      setAttendanceDataFile(uniqueFiles);
      setAttendanceData(attendance);
    } catch (error) {
      toast.error("Failed to fetch data");
      console.log("getting error attendance", error);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleSubmitAttendance = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to create attendance.");
      return;
    }

    // Check if batch, module, and course are selected
    if (!newAttendance.batchId || !newAttendance.moduleId || !newAttendance.courseId) {
      toast.error("Please select batch, module, and course.");
      return;
    }

    // Check if Excel file is available
    if (!excelFile) {
      toast.error("Please upload an attendance file.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("batchId", newAttendance.batchId);
      formData.append("moduleId", newAttendance.moduleId);
      formData.append("courseId", newAttendance.courseId);
      formData.append("classId", newAttendance.classId);
      formData.append("attendanceFileId", newAttendance.attendanceFileId);
      formData.append("excelFile", excelFile);
      await createAttendanceApi(formData);

      toast.success("Attendance Created Successfully");
      fetchAttendance();
      setIsNewAttendanceModalOpen(false);
      setExcelFile(null);
    } catch (error) {
      console.error("Error creating attendance:", error);
      toast.error("Failed to create attendance: " + (error || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAttendanceFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setAttendanceFile(file);
    setSecondFileUploaded(false)

    if (file) {
      console.log("Selected Attendance File:", file.name);
    }
  };


  const handleExcelFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setExcelFile(file);
    setSecondFileUploaded(true)

    if (file) {
      console.log("Selected Excel File:", file.name);
    }
  };

  return (
    <div className="h-full w-full flex flex-col p-8">
      <div className="flex flex-col items-center w-full h-full">
        <div className="w-full max-w-7xl flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Attendance Management</h1>
          <div className="flex space-x-4">
            <Button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-[#6e2b8b] text-white py-2 px-4 rounded-lg shadow hover:bg-[#4b1e69] transition-all"
            >
              Upload Attendance File
            </Button>
            <Button
              onClick={() => setIsNewAttendanceModalOpen(true)}
              className="bg-[#6e2b8b] text-white py-2 px-4 rounded-lg shadow hover:bg-[#4b1e69] transition-all"
            >
              New Attendance
            </Button>
          </div>
        </div>

        <Card className="w-full mb-6 p-6 shadow-md bg-white rounded-xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Filter Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Batch Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
              <Select
                options={batches.map((b) => ({
                  value: b.id,
                  label: b.batchName,
                }))}
                value={
                  selectedBatchId
                    ? {
                      value: selectedBatchId,
                      label: batches.find((b) => b.id === selectedBatchId)?.batchName,
                    }
                    : null
                }
                onChange={(selectedOption) => handleFilterChange("batchId", selectedOption ? selectedOption.value : null)}
                className="w-full"
                placeholder="Select Batch"
                isClearable
              />
            </div>

            {/* Class Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <Select
                options={classes.map((c) => ({
                  value: c.id,
                  label: c.classTitle,
                }))}
                value={
                  selectedClassId
                    ? {
                      value: selectedClassId,
                      label: classes.find((c) => c.id === selectedClassId)?.classTitle,
                    }
                    : null
                }
                onChange={(selectedOption) => handleFilterChange("classId", selectedOption ? selectedOption.value : null)}
                className="w-full"
                placeholder="Select Class"
                isClearable
              />
            </div>

            {/* Module Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
              <Select
                options={modules.map((m) => ({
                  value: m.id,
                  label: m.moduleName,
                }))}
                value={
                  selectedModuleId
                    ? {
                      value: selectedModuleId,
                      label: modules.find((m) => m.id === selectedModuleId)?.moduleName,
                    }
                    : null
                }
                onChange={(selectedOption) => handleFilterChange("moduleId", selectedOption ? selectedOption.value : null)}
                className="w-full"
                placeholder="Select Module"
                isClearable
              />
            </div>

            {/* User Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
              <Select
                options={users.map((u) => ({
                  value: u.id,
                  label: u.userName,
                }))}
                value={
                  selectedUserId
                    ? {
                      value: selectedUserId,
                      label: users.find((u) => u.id === selectedUserId)?.userName,
                    }
                    : null
                }
                onChange={(selectedOption) => handleFilterChange("userId", selectedOption ? selectedOption.value : null)}
                className="w-full"
                placeholder="Select User"
                isClearable
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              onClick={resetFilters}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300 transition-all"
            >
              Reset
            </Button>
            <Button
              onClick={applyFilters}
              className="bg-[#6e2b8b] text-white hover:bg-[#4b1e69] transition-all"
            >
              Apply Filters
            </Button>
          </div>
        </Card>

        {/* Upload Attendance File Modal */}
        <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold text-gray-800">
                Upload Attendance File
              </DialogTitle>
            </DialogHeader>

            {/* Teams Attendance File Upload Form */}
            <Card className="w-full max-w-5xl p-6 shadow-xl bg-white rounded-xl mb-8">
              {/* Class ID Dropdown */}
              <div className="flex flex-col space-y-2 mb-4">
                <label htmlFor="classId" className="text-gray-700 font-medium">
                  Class <span className="text-red-500">*</span>
                </label>
                <Select
                  options={classes.map((c) => ({
                    value: c.id,
                    label: c.classTitle
                  }))}
                  value={
                    newAttendanceFile.classId
                      ? {
                        value: newAttendanceFile.classId,
                        label:
                          classes.find((c) => c.id === newAttendanceFile.classId)
                            ?.classTitle || "Unknown Class"
                      }
                      : null
                  }
                  onChange={(selectedOption) =>
                    setNewAttendanceFile({
                      ...newAttendanceFile,
                      classId: selectedOption ? selectedOption.value : ""
                    })
                  }
                  className="w-full rounded font-metropolis text-gray-700"
                  placeholder="Select Class"
                  isSearchable
                />
              </div>

              {/* Attendance Date Input */}
              <div className="flex flex-col space-y-2 mb-4">
                <label htmlFor="attendanceDate" className="text-gray-700 font-medium">
                  Attendance Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="attendanceDate"
                  value={newAttendanceFile.attendanceDate}
                  onChange={(e) =>
                    setNewAttendanceFile((prev) => ({
                      ...prev,
                      attendanceDate: e.target.value
                    }))
                  }
                  className="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#6e2b8b]"
                />
              </div>

              {/* File Upload */}
              <div className="mb-4">
                <input
                  type="file"
                  accept=".csv, .xlsx"
                  onChange={handleAttendanceFileChange}
                  className="hidden"
                  id="file-upload-1"
                />
                <label htmlFor="file-upload-1" className="w-full">
                  <div className="w-full flex items-center justify-center h-32 border-2 border-dashed border-[#6e2b8b] rounded-lg cursor-pointer bg-[#eadcf1] hover:bg-[#d5afe3]">
                    {attendanceFile ? (
                      <p className="text-gray-700 font-medium">
                        ✅ File Selected: {attendanceFile.name}
                      </p>
                    ) : (
                      <p className="text-gray-700 font-medium">
                        Drag & Drop or Click to Upload Teams Attendance CSV
                      </p>
                    )}
                  </div>
                </label>

                {attendanceFile && (
                  <div className="mt-2 text-sm text-gray-600 flex justify-start">
                    <strong>📁 Selected File:</strong>&nbsp;
                    <span className="text-[#6e2b8b] font-semibold">
                      {attendanceFile.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleAttendanceFileUpload}
                  disabled={
                    !newAttendanceFile.classId ||
                    !newAttendanceFile.attendanceDate ||
                    !attendanceFile
                  }
                  className={`px-6 py-2 text-white rounded-lg font-medium transition-all 
              ${newAttendanceFile.classId &&
                      newAttendanceFile.attendanceDate &&
                      attendanceFile
                      ? "bg-[#6e2b8b] hover:bg-[#53206e]"
                      : "bg-gray-300 cursor-not-allowed"
                    }`}
                >
                  Upload File
                </button>
              </div>

              {/* Enable Download Button Only When File is Uploaded */}
              {fileDownloaded && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleDownloadExcel}
                    className="bg-[#6e2b8b] text-white py-2 px-4 rounded-lg shadow hover:bg-[#4b1e69] transition-all"
                  >
                    📥 Download Processed Excel
                  </button>
                </div>
              )}
            </Card>

            {/* Loading Modal (While Uploading) */}
            {isUploading && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
                  <svg
                    className="animate-spin h-12 w-12 text-[#6e2b8b]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  <p className="mt-4 text-gray-700 font-medium">Uploading file... Please wait</p>
                </div>
              </div>
            )}

            {/* Success Modal (After File Uploaded) */}
            {showSuccessModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
                  <svg
                    className="text-green-500 h-16 w-16"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <h2 className="text-2xl font-bold text-gray-800 mt-4">File Uploaded Successfully!</h2>
                  <p className="text-gray-500 text-sm mt-2">
                    Your attendance file has been uploaded successfully.
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* New Attendance Modal */}
        <Dialog open={isNewAttendanceModalOpen} onOpenChange={setIsNewAttendanceModalOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold text-gray-800">
                New Attendance
              </DialogTitle>
            </DialogHeader>

            {/* Attendance Upload Form */}
            <Card className="w-full max-w-5xl p-6 shadow-xl bg-white rounded-xl">
              {/* Batch and Course Selection */}
              <div className="flex gap-4 mb-2">
                <div className="mb-4 w-1/2">
                  <label className="block font-medium mb-1">Batches <span className="text-red-500">*</span>
                  </label>
                  <Select
                    options={batches.map((b) => ({
                      value: b.id,
                      label: b.batchName,
                    }))}
                    value={
                      newAttendance.batchId
                        ? {
                          value: newAttendance.batchId,
                          label: batches.find((b) => b.id === newAttendance.batchId)
                            ?.batchName,
                        }
                        : null
                    }
                    onChange={(selectedOption) => {
                      setNewAttendance({
                        ...newAttendance,
                        batchId: selectedOption ? selectedOption.value : "",
                      });
                    }}
                    className="w-full"
                    placeholder="Select Batch"
                    isSearchable
                  />
                </div>

                <div className="mb-4 w-1/2">
                  <label className="block font-medium mb-1">Courses <span className="text-red-500">*</span>
                  </label>
                  <Select
                    options={courses.map((c) => ({
                      value: c.id,
                      label: c.courseName,
                    }))}
                    value={
                      newAttendance.courseId
                        ? { value: newAttendance.courseId, label: courses.find((c) => c.id === newAttendance.courseId)?.courseName } : null}
                    onChange={(selectedOption) => setNewAttendance({ ...newAttendance, courseId: selectedOption ? selectedOption.value : "" })}
                    className="w-full rounded font-metropolis text-gray-700"
                    placeholder="Select Course"
                    isSearchable
                  />
                </div>
              </div>
              {/* Module Selection */}
              <div className="flex gap-4 mb-2">
                <div className="mb-4 w-1/2">
                  <label className="block font-metropolis font-medium">Modules <span className="text-red-500">*</span></label>
                  <Select
                    options={modules.map((m) => ({ value: m.id, label: m.moduleName }))}
                    value={newAttendance.moduleId ? { value: newAttendance.moduleId, label: modules.find((c) => c.id === newAttendance.moduleId)?.moduleName } : null}
                    onChange={(selectedOption) => setNewAttendance({ ...newAttendance, moduleId: selectedOption ? selectedOption.value : "" })}
                    className="w-full rounded font-metropolis text-gray-700"
                    placeholder="Select Module"
                    isSearchable
                  />
                </div>
                <div className="mb-4 w-1/2">
                  <label className="block font-metropolis font-medium">Class <span className="text-red-500">*</span></label>
                  <Select
                    options={classes.map((m) => ({ value: m.id, label: m.classTitle }))}
                    value={newAttendance.classId ? { value: newAttendance.classId, label: classes.find((c) => c.id === newAttendance.classId)?.classTitle } : null}
                    onChange={(selectedOption) => setNewAttendance({ ...newAttendance, classId: selectedOption ? selectedOption.value : "" })}
                    className="w-full rounded font-metropolis text-gray-700"
                    placeholder="Select Class"
                    isSearchable
                  />
                </div>
              </div>
              {/* Attendance File Dropdown */}
              <div className="mb-4">
                <label className="block font-metropolis font-medium">
                  Attendance File <span className="text-red-500">*</span>
                </label>
                <Select
                  options={attendanceDataFile.map((file) => ({
                    value: file.id,
                    label: ` ${file.classTitle}`,
                  }))}
                  value={
                    newAttendance.attendanceFileId
                      ? {
                        value: newAttendance.attendanceFileId,
                        label: ` ${attendanceDataFile.find((f) => f.id === newAttendance.attendanceFileId)?.classTitle || "No Class Title"
                          }`,
                      }
                      : null
                  }
                  onChange={(selectedOption) =>
                    setNewAttendance({
                      ...newAttendance,
                      attendanceFileId: selectedOption ? selectedOption.value : "",
                    })
                  }
                  className="w-full rounded font-metropolis text-gray-700"
                  placeholder="Select Attendance File"
                  isSearchable
                />
              </div>

              {/* File Upload Input */}
              <div className="mb-4">
                {/* Hidden File Input */}
                <input
                  type="file"
                  accept=".csv, .xlsx"
                  onChange={handleExcelFileChange}
                  className="hidden"
                  id="file-upload-2"
                />

                {/* File Upload Label */}
                <label htmlFor="file-upload-2" className="cursor-pointer">
                  <div className="w-full flex items-center justify-center h-32 border-2 border-dashed border-[#6e2b8b] rounded-lg bg-[#eadcf1] hover:bg-[#d5afe3]">
                    <p className="text-gray-700 font-medium">
                      {excelFile ? (
                        <>
                          ✅ Uploaded File: <span className="text-[#6e2b8b] font-semibold">
                            {excelFile.name}
                          </span>
                        </>
                      ) : (
                        "Upload Attendance File (CSV or Excel)"
                      )}
                    </p>
                  </div>
                </label>

                {/* File Name Display (Optional - Below Upload Box) */}
                {excelFile && (
                  <div className="mt-2 text-sm text-gray-600">
                    <strong>📁 Selected File:</strong> {excelFile.name}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleSubmitAttendance}
                  disabled={isSubmitting || !excelFile}
                  className={`bg-[#6e2b8b] text-white py-2 px-6 rounded-lg shadow 
              ${(isSubmitting || !excelFile) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#4b1e69]'} 
              transition-all`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Attendance'}
                </button>
              </div>
            </Card>
          </DialogContent>
        </Dialog>

        <div className="overflow-x-auto mt-4 p-2 border-2 border-gray-300 rounded-lg shadow-md bg-gray-50 max-w-8xl mx-auto">
          <Table className="text-xs w-full">
            <TableCaption>Attendance Data</TableCaption>

            <TableHeader className="bg-[#6e2b8b] text-white">
              <TableRow>
                <TableHead className="py-1 px-2 w-36 text-white">User</TableHead>
                <TableHead className="py-1 px-2 text-white">Batch Name</TableHead>
                <TableHead className="py-1 px-2 text-white">Class Title</TableHead>
                <TableHead className="py-1 px-2 text-white">Course Name</TableHead>
                <TableHead className="py-1 px-2 text-white">Module Name</TableHead>
                <TableHead className="py-1 px-2 text-white">Email</TableHead>
                <TableHead className="py-1 px-2 text-white">Teams Role</TableHead>
                <TableHead className="py-1 px-2 text-white">First Join</TableHead>
                <TableHead className="py-1 px-2 text-white">Last Leave</TableHead>
                <TableHead className="py-1 px-2 text-white">Duration</TableHead>
                <TableHead className="py-1 px-2 text-white">Attendance</TableHead>
                <TableHead className="py-1 px-2 text-white">Participation Rate</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredData.map((row, index) => (
                <TableRow key={index} className="border-b hover:bg-gray-100 transition-all">
                  <TableCell className="py-1 px-2">{row.userName || "N/A"}</TableCell>
                  <TableCell className="py-1 px-2">{row.batchName || "N/A"}</TableCell>
                  <TableCell className="py-1 px-2">{row.classTitle || "N/A"}</TableCell>
                  <TableCell className="py-1 px-2">{row.courseName || "N/A"}</TableCell>
                  <TableCell className="py-1 px-2">{row.moduleName || "N/A"}</TableCell>
                  <TableCell className="py-1 px-2">{row.email || "N/A"}</TableCell>
                  <TableCell className="py-1 px-2">{row.teamsRole || "N/A"}</TableCell>

                  {/* Formatted First Join Date */}
                  <TableCell className="py-1 px-2">
                    {row.firstJoin
                      ? format(new Date(row.firstJoin), "dd MMM yyyy, hh:mm a")
                      : "N/A"}
                  </TableCell>

                  {/*Formatted Last Leave Date */}
                  <TableCell className="py-1 px-2">
                    {row.lastLeave
                      ? format(new Date(row.lastLeave), "dd MMM yyyy, hh:mm a")
                      : "N/A"}
                  </TableCell>

                  {/*Duration Converted to Minutes & Seconds */}
                  <TableCell className="py-1 px-2">
                    {row.duration
                      ? `${Math.floor(row.duration / 60)} minutes ${row.duration % 60} seconds`
                      : "N/A"}
                  </TableCell>

                  <TableCell className="py-1 px-2">{row.attendance || "N/A"}</TableCell>
                  <TableCell className="py-1 px-2">{row.percentage || "N/A"}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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

      </div>
    </div>
  );
};

export default Attendance;