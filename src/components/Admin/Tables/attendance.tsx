import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import Select from 'react-select';
import { Card } from "@/components/ui/card"; // ShadCN Card
import { createAttendanceApi, createAttendanceFileApi, fetchAttendanceApi, fetchAttendanceFileApi } from "@/helpers/api/attendance";
import { fetchUsersApi } from "@/helpers/api/userApi";
import { fetchBatchApi } from "@/helpers/api/batchApi";
import { fetchCourseModuleApi } from "@/helpers/api/courseModuleApi";
import { fetchClassForModuleApi } from "@/helpers/api/classForModuleApi";
import { fetchCourseApi } from "@/helpers/api/courseApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "../../ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


interface Attendance {
  percentage: string;
  attendance: string;
  duration: string;
  lastLeave: string;
  firstJoin: string;
  teamsRole: string;
  email: string;
  userName: string;
  userId: number;
  id: number;
  batchId: number;
  batchName: string;
  moduleId: number;
  moduleName: string;
  courseId: number;
  courseName: string;
  classId: number;
  classTitle: string;
  excelFile: string;
  attendanceFileId: number;
  teamsAttendanceFile: string;
}

// interface AttendanceFile {
//   id: number;
//   teamsAttendanceFile: string;
// }

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [users, setUsers] = useState<Attendance[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [attendanceDataFile, setAttendanceDataFile] = useState<Attendance[]>([]);
  const [batches, setBatches] = useState<Attendance[]>([]);
  const [modules, setModules] = useState<Attendance[]>([]);
  const [courses, setCourses] = useState<Attendance[]>([]);
  const [classes, setClasses] = useState<Attendance[]>([]);
  const [newAttendance, setNewAttendance] = useState<Attendance>({
    id: 0,
    userId: 0,
    userName: "",
    batchId: 0,
    batchName: "",
    moduleId: 0,
    moduleName: "",
    courseId: 0,
    courseName: "",
    classId: 0,
    classTitle: "",
    excelFile: "",
    email: "",
    attendance: "",
    teamsRole: "",
    firstJoin: "",
    lastLeave: "",
    percentage: "",
    attendanceFileId: 0,
    teamsAttendanceFile: "",
    duration: "",

  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {

      try {
        const responseFile = await fetchAttendanceFileApi();
        const existingFile = responseFile; // Assuming the API returns the file info
        if (existingFile && existingFile.teamsAttendanceFile) {
          toast.error("Attendance file already exists in the database.");
          return;
        }
      } catch (error) {
        console.error("Error fetching attendance file:", error);
        toast.error("Failed to check if the file exists.");
        return;
      }

      setIsFileUploaded(true);
      console.log("File selected:", file.name);

      const reader = new FileReader();

      reader.onloadend = async () => {
        let base64File = reader.result as string;

        // Ensure that the base64 string includes the MIME type (you can adapt it to the file type)
        if (base64File.startsWith('data:')) {
          base64File = base64File.split(',')[1]; // Just the raw base64 content
        }

        // Log and check the base64 string
        console.log("Base64 Content:", base64File);

        // Dynamically set the MIME type for CSV files
        const mimeType = file.type; // Default to CSV if MIME type is missing

        // Creating a correctly formatted payload
        const newAttendanceFile = {
          teamsAttendanceFile: `data:${mimeType};base64,${base64File}`,
        };

        try {
          const response = await createAttendanceFileApi(newAttendanceFile);
          console.log("Attendance file uploaded successfully:", response);
          toast.success("AttendanceFile uploaded successfully & Stored in DB");
        } catch (error) {
          console.error("Error uploading attendance file:", error);
        }

        // Parsing the file as CSV (assuming CSV file)
        if (file.type === 'text/csv') {
          Papa.parse(file, {
            complete: (result) => {
              console.log("CSV Parsing completed:", result);
              const data = result.data as DataRow[];
              setCsvData(data);
              processCsvData(data);
            },
            header: true,
          });
        } else {
          console.error("Unsupported file type for CSV parsing.");
        }
      };

      reader.readAsDataURL(file);
    }
  };

  const processCsvData = (data: DataRow[]) => {
    console.log("Initial data:", data);

    const extractedSummary: Record<string, string> = {};

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

    console.log("data", data);

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

    console.log("haha", data);

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
  };

  // Function to export displayed data to Excel
  const handleDownloadExcel = () => {
    if (processedData.length === 0) {
      alert("No data available to export.");
      return;
    }

    // Create a new workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(processedData);

    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Processed Data");

    // Create and download Excel file
    XLSX.writeFile(wb, "Processed_Data.xlsx");

    // Set fileDownloaded to true after the file is downloaded
    setFileDownloaded(true);
  };
  // Function to convert "MMm SSs" or "HHh MMm SSs" into total seconds
  const convertDurationToSeconds = (duration: string): number => {
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

    return `${hours > 0 ? hours + "h " : ""}${minutes > 0 ? minutes + "m " : ""}${remainingSeconds}s`;
  };

  const fetchAttendance = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to view batches.");
      return;
    }
    try {
      const responseAttendance = await fetchAttendanceApi();
      const attendance = responseAttendance.attendance.map((a: any) => {
        const userName = a.user ? `${a.user.firstName} ${a.user.lastName}` : "Unknown";
        const trainees = a.trainees
          ? a.trainees.map((trainee: any) => `${trainee.firstName} ${trainee.lastName}`).join(", ")
          : userName; // Fall back to `userName` if `trainees` is undefined or empty

        return {
          id: a.id,
          userId: a.userId || 0,
          userName: trainees, // User name will be from trainees or fallback to user info
          batchId: a.batchId || 0,
          batchName: a.batch?.batchName || "N/A",
          moduleId: a.moduleId || 0,
          moduleName: a.module?.moduleName || "N/A",
          courseId: a.courseId || 0,
          courseName: a.course?.courseName || "N/A",
          classId: a.classId || 0,
          classTitle: a.class?.classTitle || 'N/A',
          attendanceFileId: a.attendanceFileId || 0,
          teamsAttendanceFile: a.teamsAttendanceFile || "",
          email: a.email,
          teamsRole: a.teamsRole,
          firstJoin: a.firstJoin,
          lastLeave: a.lastLeave,
          duration: a.duration,
          attendance: a.attendance,
          percentage: a.percentage
        };
      });
      console.log("finalizeddata", attendance);

      const responseUser = await fetchUsersApi();
      const users = responseUser.Users
        .filter((user: any) => ["trainee", "trainer"].includes(user.role.name.toLowerCase())) // Filter by role
        .map((trainee: any) => ({
          id: trainee.id,
          userName: `${trainee.firstName} ${trainee.lastName}`.trim(), // Full Name
        }));

      setUsers(users);
      console.log("Filtered Users", users);

      const batchResponse = await fetchBatchApi();
      const batches = batchResponse.map((batch: { id: any; batchName: any; }) => ({
        id: batch.id,
        batchName: batch.batchName,
      }));
      setBatches(batches);
      console.log("batchResponse", batchResponse)

      const classResponse = await fetchClassForModuleApi();
      const classMap = classResponse.map((c:any) => ({
        id: c.id,
        classTitle: c.classTitle,
      }));
      setClasses(classMap);
      console.log("classResponse", classResponse)

      const moduleResponse = await fetchCourseModuleApi();
      const modules = moduleResponse.map((module: { id: any; moduleName: any; }) => ({
        id: module.id,
        moduleName: module.moduleName,
      }));
      setModules(modules);
      console.log("moduleRespos", moduleResponse)

      const courseResponse = await fetchCourseApi();
      const course = courseResponse.map((course: any) => ({
        id: course.id,
        courseName: course.courseName,
      }));
      setCourses(course);
      console.log("course", courseResponse)

      const response = await fetchAttendanceFileApi();
      console.log("Fetched Attendance Data:", response);

      // Ensure unique entries
      const uniqueFiles = response.attendanceFile.filter(
        (file: { id: any; }, index: any, self: any[]) => self.findIndex(t => t.id === file.id) === index
      );

      setAttendanceDataFile(uniqueFiles);

      setAttendanceData(attendance)
    } catch (error) {
      toast.error('Failed to fetch data')
      console.log("getting error attendance", error)
    }
  }

  useEffect(() => {
    fetchAttendance();
  }, [])

  const handleSubmitAttendance = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to create attendance.");
      return;
    }

    if (!newAttendance.batchId || !newAttendance.moduleId || !newAttendance.courseId) {
      toast.error("Please select batch, module, and course.");
      return;
    }

    if (!secondFileUploaded) {
      toast.error("Please upload an attendance file.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createAttendanceApi({
        batchId: newAttendance.batchId,
        moduleId: newAttendance.moduleId,
        courseId: newAttendance.courseId,
        classId: newAttendance.classId,
        excelFile: newAttendance.excelFile,
        attendanceFileId: newAttendance.attendanceFileId,
      });

      toast.success("Attendance Created Successfully");

    } catch (error) {
      console.error("Error creating attendance:", error);
      toast.error('Failed to create attendance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);

    if (file) {
      setSecondFileUploaded(true); // Set this new state when the second file is uploaded
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result as string;

        // Logging the base64 string
        console.log("Converted Base64 String:", base64String);

        setNewAttendance((prev) => ({
          ...prev,
          excelFile: base64String,
        }));
      };

      reader.readAsDataURL(file);
    }
  };

  const getFileName = (base64String: string, date: string | number | Date, batchName: string) => {
    if (!base64String) return "Unknown File";

    const mimeType = base64String.split(";")[0].split(":")[1]; // Extract MIME type
    const extension = mimeType.split("/")[1]; // Get file extension (csv, xlsx)
    const formattedDate = new Date(date).toLocaleDateString(); // Format date

    return `📊 ${batchName}_Attendance_${formattedDate}.${extension}`;
  };


  return (
    <div className="h-[1200px] w-full flex flex-col p-8">
      <div className="flex flex-col items-center w-full h-full">
        {/* First CSV Uploader Section */}
        <Card className="w-full max-w-5xl p-6 shadow-xl bg-white rounded-xl">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
            CSV Uploader (Append & Download Excel)
          </h1>

          <div className="flex flex-col items-center space-y-4">
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="file-upload-1" />
            <label htmlFor="file-upload-1" className="w-full">
              <div className="w-full flex items-center justify-center h-32 border-2 border-dashed border-[#6e2b8b] rounded-lg cursor-pointer bg-[#eadcf1] hover:bg-[#d5afe3]">
                <p className="text-gray-700 font-medium">
                  Drag & Drop or Click to Upload CSV
                </p>
              </div>
            </label>
          </div>

          {/* Download Excel Button */}
          <div className="mt-6 flex justify-center gap-4">
            {!fileDownloaded && processedData.length > 0 && (
              <button
                onClick={handleDownloadExcel}
                className="bg-[#6e2b8b] text-white py-2 px-4 rounded-lg shadow hover:bg-[#4b1e69] transition-all"
              >
                Download as Excel
              </button>
            )}
            {fileDownloaded && (
              <Button
                onClick={() => setIsOpen(true)}
                className="bg-[#6e2b8b] text-white py-2 px-4 rounded-lg shadow hover:bg-[#4b1e69] transition-all"
              >
                Upload Attendance
              </Button>
            )}
          </div>
        </Card>

        {/* Separated Form and Second Upload Section */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold text-gray-800">
                Upload Attendance
              </DialogTitle>
            </DialogHeader>

            {/* Attendance Upload Form */}
            <Card className="w-full max-w-5xl p-6 shadow-xl bg-white rounded-xl">
              {/* Batch Selection */}
              <div className="flex gap-4 mb-2">
              <div className="mb-4">
                <label className="block font-metropolis font-medium">Batches</label>
                <Select
                  options={batches.map((b) => ({ value: b.id, label: b.batchName }))}
                  value={newAttendance.batchId ? { value: newAttendance.batchId, label: batches.find((b) => b.id === newAttendance.batchId)?.batchName } : null}
                  onChange={(selectedOption) => setNewAttendance({ ...newAttendance, batchId: selectedOption ? selectedOption.value : 0 })}
                  className="w-full rounded p-2 font-metropolis text-gray-700"
                  placeholder="Select Batch"
                  isSearchable
                />
              </div>

              {/* Course Selection */}
              <div className="mb-4">
                <label className="block font-metropolis font-medium">Courses</label>
                <Select
                  options={courses.map((c) => ({ value: c.id, label: c.courseName }))}
                  value={newAttendance.courseId ? { value: newAttendance.courseId, label: courses.find((c) => c.id === newAttendance.courseId)?.courseName } : null}
                  onChange={(selectedOption) => setNewAttendance({ ...newAttendance, courseId: selectedOption ? selectedOption.value : 0 })}
                  className="w-full rounded p-2 font-metropolis text-gray-700"
                  placeholder="Select Course"
                  isSearchable
                />
              </div>
              </div>
              {/* Module Selection */}
              <div className="flex gap-4 mb-2">
              <div className="mb-4">
                <label className="block font-metropolis font-medium">Modules</label>
                <Select
                  options={modules.map((m) => ({ value: m.id, label: m.moduleName }))}
                  value={newAttendance.moduleId ? { value: newAttendance.moduleId, label: modules.find((c) => c.id === newAttendance.moduleId)?.moduleName } : null}
                  onChange={(selectedOption) => setNewAttendance({ ...newAttendance, moduleId: selectedOption ? selectedOption.value : 0 })}
                  className="w-full rounded p-2 font-metropolis text-gray-700"
                  placeholder="Select Module"
                  isSearchable
                />
              </div>
              <div className="mb-4">
                <label className="block font-metropolis font-medium">Class</label>
                <Select
                  options={modules.map((m) => ({ value: m.id, label: m.moduleName }))}
                  value={newAttendance.moduleId ? { value: newAttendance.moduleId, label: modules.find((c) => c.id === newAttendance.moduleId)?.moduleName } : null}
                  onChange={(selectedOption) => setNewAttendance({ ...newAttendance, moduleId: selectedOption ? selectedOption.value : 0 })}
                  className="w-full rounded p-2 font-metropolis text-gray-700"
                  placeholder="Select Module"
                  isSearchable
                />
              </div>
              </div>
              {/* Attendance File Dropdown */}
              <div className="mb-4">
                <label className="block font-metropolis font-medium">Attendance File</label>
                <Select
                  options={attendanceDataFile.map((file) => ({
                    value: file.id,
                    label: getFileName(file.teamsAttendanceFile, file.attendanceFileId, file.batchName),
                  }))}
                  value={
                    newAttendance.attendanceFileId
                      ? {
                        value: newAttendance.attendanceFileId,
                        label: getFileName(
                          attendanceDataFile.find((f) => f.id === newAttendance.attendanceFileId)?.teamsAttendanceFile || "",
                          newAttendance.attendanceFileId,
                          attendanceDataFile.find((f) => f.id === newAttendance.attendanceFileId)?.batchName || "Unknown Batch"
                        ),
                      }
                      : null
                  }
                  onChange={(selectedOption) =>
                    setNewAttendance({ ...newAttendance, attendanceFileId: selectedOption ? selectedOption.value : 0 })
                  }
                  className="w-full rounded p-2 font-metropolis text-gray-700"
                  placeholder="Select Attendance File"
                  isSearchable
                />
              </div>

              {/* File Upload Input */}
              <div className="mb-4">
                <input type="file" accept=".csv, .xlsx" onChange={handleFileChange} className="hidden" id="file-upload-2" />
                <label htmlFor="file-upload-2" className="cursor-pointer">
                  <div className="w-full flex items-center justify-center h-32 border-2 border-dashed border-[#6e2b8b] rounded-lg bg-[#eadcf1] hover:bg-[#d5afe3]">
                    <p className="text-gray-700 font-medium">
                      Click to Upload Attendance File (CSV or Excel)
                    </p>
                  </div>
                </label>
              </div>

              {/* Submit Button */}
              {secondFileUploaded && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleSubmitAttendance}
                    disabled={isSubmitting}
                    className={`bg-[#6e2b8b] text-white py-2 px-6 rounded-lg shadow 
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#4b1e69]'} 
                transition-all`}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Attendance'}
                  </button>
                </div>
              )}
            </Card>
          </DialogContent>
        </Dialog>

        <div className="overflow-x-auto mt-4 p-2 border-2 border-gray-300 rounded-lg shadow-md bg-gray-50">
          <Table className="text-sm">
            <TableCaption>Attendance Data</TableCaption>
            <TableHeader className="bg-[#6e2b8b] text-white">
              <TableRow>
                <TableHead className="py-2 px-3 text-white">User</TableHead>
                <TableHead className="py-2 px-3 text-white">Batch</TableHead>
                <TableHead className="py-2 px-3 text-white">Module</TableHead>
                <TableHead className="py-2 px-3 text-white">Course</TableHead>
                <TableHead className="py-2 px-3 text-white">Email</TableHead>
                <TableHead className="py-2 px-3 text-white">Role</TableHead>
                <TableHead className="py-2 px-3 text-white">First Join</TableHead>
                <TableHead className="py-2 px-3 text-white">Last Leave</TableHead>
                <TableHead className="py-2 px-3 text-white">Duration</TableHead>
                <TableHead className="py-2 px-3 text-white">Attendance</TableHead>
                <TableHead className="py-2 px-3 text-white">Participation Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceData.map((row, index) => (
                <TableRow key={index} className="border-b">
                  <TableCell className="py-1 px-3">{row.userName || "N/A"}</TableCell>
                  <TableCell className="py-1 px-3">{row.batchName || "N/A"}</TableCell>
                  <TableCell className="py-1 px-3">{row.moduleName || "N/A"}</TableCell>
                  <TableCell className="py-1 px-3">{row.courseName || "N/A"}</TableCell>
                  <TableCell className="py-1 px-3">{row.email || "N/A"}</TableCell>
                  <TableCell className="py-1 px-3">{row.teamsRole || "N/A"}</TableCell>
                  <TableCell className="py-1 px-3">{row.firstJoin || "N/A"}</TableCell>
                  <TableCell className="py-1 px-3">{row.lastLeave || "N/A"}</TableCell>
                  <TableCell className="py-1 px-3">{row.duration || "N/A"}</TableCell>
                  <TableCell className="py-1 px-3">{row.attendance || "N/A"}</TableCell>
                  <TableCell className="py-1 px-3">{row.percentage || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;