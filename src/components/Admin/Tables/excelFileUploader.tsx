import React, { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Card } from "@/components/ui/card"; // ShadCN Card

type DataRow = { [key: string]: string | number }; // Representing each row as an object

const CsvUploader: React.FC = () => {
  const [csvData, setCsvData] = useState<DataRow[]>([]); // Raw CSV data
  const [processedData, setProcessedData] = useState<DataRow[]>([]); // Processed data
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]); // Column headers
  const [summary, setSummary] = useState<Record<string, string>>({});
  const [meetingDuration, setMeetingDuration] = useState<string>("");
  const [isFileUploaded, setIsFileUploaded] = useState<boolean>(false); // ✅ Track file upload

  // Function to handle file upload and parse the CSV file
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsFileUploaded(true); // ✅ Mark file as uploaded
      console.log("File selected:", file.name);

      Papa.parse(file, {
        complete: (result) => {
          console.log("CSV Parsing completed:", result);
          const data = result.data as DataRow[]; // Parsing CSV into rows
          setCsvData(data);
          processCsvData(data); // Process the data after parsing
        },
        header: true, // Assuming the first row contains column names
      });
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

  return (
    <div className="h-[1200px] w-full flex flex-col bg-[#eadcf1] p-8">
      <div className="flex flex-col items-center w-full h-full">
        {/* Upload Section */}
        <Card className="w-full max-w-5xl p-6 shadow-xl bg-white rounded-xl">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
            CSV Uploader (Append & Download Excel)
          </h1>

          <div className="flex flex-col items-center space-y-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="w-full">
              <div className="w-full flex items-center justify-center h-32 border-2 border-dashed border-[#6e2b8b] rounded-lg cursor-pointer bg-[#eadcf1] hover:bg-[#d5afe3]">
                <p className="text-gray-700 font-medium">
                  Drag & Drop or Click to Upload CSV
                </p>
              </div>
            </label>
          </div>

          {/* Show download button only if data is processed */}
          {processedData.length > 0 && (
            <button
              onClick={handleDownloadExcel}
              className="mt-6 bg-green-500 text-white py-2 px-4 flex flex-col rounded-lg shadow hover:bg-green-600 transition-all"
            >
              Download as Excel
            </button>
          )}
        </Card>

        {/* 🚀 Show "No Data Available" when no file is uploaded */}
        {!isFileUploaded ? (
          <div className="mt-6 text-lg font-semibold text-gray-700">
            No Data Available. No Excel sheets are uploaded.
          </div>
        ) : (
          processedData.length > 0 && (
            <div className="w-full max-w-7xl mt-6 mb-5">
              <Card className="p-6 shadow-xl bg-white rounded-xl overflow-hidden">
                <h2 className="text-xl font-semibold mb-3 text-[#6e2b8b]">
                  Processed Data
                </h2>

                {/* Meeting Summary */}
                <div className="mt-6 p-4 bg-white shadow-lg rounded-lg">
                  <div className="text-slate-800">
                    <h2 className="text-xl font-bold ">Meeting Summary</h2>
                    <p>
                      <strong>Title:</strong>{" "}
                      {summary["Meeting title"] || "N/A"}
                    </p>
                    <p>
                      <strong>Start Time:</strong>{" "}
                      {summary["Start time"] || "N/A"}
                    </p>
                    <p>
                      <strong>End Time:</strong> {summary["End time"] || "N/A"}
                    </p>
                    <p>
                      <strong>Average Attendance Time:</strong>{" "}
                      {summary["Average attendance time"] || "N/A"}
                    </p>
                  </div>
                  <p className="text-[#6e2b8b] font-semibold">
                    <strong>Total Meeting Duration:</strong>{" "}
                    {meetingDuration || "N/A"}
                  </p>
                </div>

                {/* Attendance Table */}
                <div className="overflow-auto max-h-[65vh] rounded-lg">
                  <table className="w-full border border-gray-300 rounded-lg shadow-md">
                    <thead className="bg-[#6e2b8b] text-white sticky top-0">
                      <tr>
                        {csvHeaders.map((header, index) => (
                          <th
                            key={index}
                            className="px-4 py-3 text-left border border-gray-300"
                          >
                            {header}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-left border border-gray-300">
                          Participation Rate
                        </th>
                        <th className="px-4 py-3 text-left border border-gray-300">
                          Attendance
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {processedData.map((row, index) => (
                        <tr
                          key={index}
                          className="bg-white border border-gray-300 hover:bg-gray-100 transition"
                        >
                          {Object.values(row).map((value, idx) => (
                            <td key={idx} className="px-4 py-3 text-gray-800">
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default CsvUploader;
