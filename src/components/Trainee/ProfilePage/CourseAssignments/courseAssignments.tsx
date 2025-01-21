import React, { useEffect, useState } from "react";

interface AssignedCourse {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  instructor: string;
  status: string; // e.g., "In Progress", "Completed", "Upcoming"
  priority: number; // Calculated based on the end date
  batchName: string; // Batch Name like "React Jan Batch"
  batchModule: string; // Module name in the batch
  assignmentQuestionFile: string | null; // File for the assignment question
  assignmentQuestionName: string | null; // Name of the assignment question
}

const TraineeCoursesWithFilePreview: React.FC = () => {
  const [courses, setCourses] = useState<AssignedCourse[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  // Mock data fetch
  const fetchAssignedCourses = async () => {
    const response: AssignedCourse[] = [
      {
        id: 1,
        name: "React Basics",
        startDate: new Date("2025-01-10"),
        endDate: new Date("2025-02-10"),
        instructor: "John Doe",
        status: "Completed",
        priority: 0,
        batchName: "React Jan Batch",
        batchModule: "React Fundamentals",
        assignmentQuestionFile: "react-basics-assignment.pdf",
        assignmentQuestionName: "React Basics Assignment",
      },
      {
        id: 2,
        name: "Advanced Node.js",
        startDate: new Date("2025-02-15"),
        endDate: new Date("2025-03-15"),
        instructor: "Jane Smith",
        status: "In Progress",
        priority: 0,
        batchName: "Node.js Feb Batch",
        batchModule: "Node.js Advanced Topics",
        assignmentQuestionFile: "nodejs-advanced-assignment.docx",
        assignmentQuestionName: "Node.js Advanced Assignment",
      },
      {
        id: 3,
        name: "Mongo DB",
        startDate: new Date("2025-02-15"),
        endDate: new Date("2025-03-15"),
        instructor: "William",
        status: "Not Submitted",
        priority: 0,
        batchName: "MongoDB March Batch",
        batchModule: "MongoDB Basics",
        assignmentQuestionFile: "mongodb-assignment.xlsx",
        assignmentQuestionName: "MongoDB Basics Assignment",
      },
    ];

    // Set priority based on the end date (earliest date gets the highest priority)
    const sortedCourses = response
      .map((course) => ({
        ...course,
        priority: new Date(course.endDate).getTime(),
      }))
      .sort((a, b) => a.priority - b.priority);

    setCourses(sortedCourses);
  };

  useEffect(() => {
    fetchAssignedCourses();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setError(null);
    setFilePreviewUrl(null);

    if (file) {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (!allowedTypes.includes(file.type)) {
        setError(
          "Unsupported file type. Please upload a PDF, Word, or Excel file."
        );
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      const fileURL = URL.createObjectURL(file);
      setFilePreviewUrl(fileURL);
    }
  };

  const renderFilePreview = () => {
    if (!filePreviewUrl || !selectedFile) return null;

    if (selectedFile.type === "application/pdf") {
      return (
        <iframe
          src={filePreviewUrl}
          title="PDF Preview"
          className="w-[900px] h-[1150px] border border-gray-300 rounded-md"
        ></iframe>
      );
    }

    if (
      selectedFile.type === "application/msword" ||
      selectedFile.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      selectedFile.type === "application/vnd.ms-excel" ||
      selectedFile.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      return (
        <iframe
          src={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
            filePreviewUrl
          )}`}
          title="Document Preview"
          className="w-full h-96 border border-gray-300 rounded-md"
        ></iframe>
      );
    }

    return (
      <p className="text-sm text-gray-500">
        Preview not available for this file type.
      </p>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-200"; // Green background for "Completed"
      case "In Progress":
        return "bg-yellow-200"; // Yellow background for "In Progress"
      case "Not Submitted":
        return "bg-red-200"; // Red background for "Not Submitted"
      default:
        return "bg-gray-100"; // Default background
    }
  };

  // Function to download assignment file
  const downloadFile = (fileName: string) => {
    const fileUrl = `/path/to/assignments/${fileName}`; // Adjust path based on your file structure
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        My Course Assignments
      </h1>

      {/* Table for Courses */}
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 text-left">
              Priority
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Course Name
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Instructor
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Start Date
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              End Date
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Batch Name
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Batch Module
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Assignment Question
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Status
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course, index) => (
            <tr key={course.id}>
              <td className="border border-gray-300 px-4 py-3">{index + 1}</td>
              <td className="border border-gray-300 px-4 py-3">
                {course.name}
              </td>
              <td className="border border-gray-300 px-4 py-3">
                {course.instructor}
              </td>
              <td className="border border-gray-300 px-4 py-3">
                {course.startDate.toLocaleDateString()}
              </td>
              <td className="border border-gray-300 px-4 py-3">
                {course.endDate.toLocaleDateString()}
              </td>
              <td className="border border-gray-300 px-4 py-3">
                {course.batchName}
              </td>
              <td className="border border-gray-300 px-4 py-3">
                {course.batchModule}
              </td>
              <td className="border border-gray-300 px-4 py-3">
                {course.assignmentQuestionName}
              </td>
              <td
                className={`${index % 2 === 0 ? "border border-gray-300 px-4" : "px-4"} ${getStatusColor(course.status)}`}
              >
                {course.status}
              </td>
              <td className="border border-gray-300 px-8 py-4">
                {course.assignmentQuestionFile && (
                  <button
                    className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 mb-4 w-[140px] focus:ring-green-400 -ml-2"
                    onClick={() =>
                      course.assignmentQuestionFile &&
                      downloadFile(course.assignmentQuestionFile)
                    }
                  >
                    <i className="fas fa-download"></i> Download Question
                  </button>
                )}
                <label className="ml-1">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 -ml-3"
                    onClick={() =>
                      document.getElementById("file-input")?.click()
                    }
                  >
                    Upload Assignment
                  </button>
                </label>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* File Uploader */}
      <div className="mt-8">
        <label className="block">
          <input
            id="file-input"
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
        {selectedFile && (
          <div className="mt-4">
            <p>Selected File: {selectedFile.name}</p>
            {renderFilePreview()}
          </div>
        )}
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default TraineeCoursesWithFilePreview;
