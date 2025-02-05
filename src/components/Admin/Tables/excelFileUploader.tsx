import React, { useState } from "react";
import Papa from "papaparse";
import { Card } from "@/components/ui/card"; // ShadCN Card

type DataRow = { [key: string]: string | number }; // Representing each row as an object

const CsvUploader: React.FC = () => {
  const [csvData, setCsvData] = useState<DataRow[]>([]); // Raw CSV data
  const [processedData, setProcessedData] = useState<DataRow[]>([]); // Processed data
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]); // Column headers

  // Function to handle file upload and parse the CSV file
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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

    // Regex to find "2. Participants"
    const participantsRegex = /^2\.\s*Participants/;
    let participantsRowIndex = data.findIndex((row) =>
      participantsRegex.test(row["1. Summary"]?.toString() || "")
    );

    if (participantsRowIndex !== -1) {
      console.log('Removing all rows above and including "2. Participants"');
      data = data.slice(participantsRowIndex + 1); // Keep only rows AFTER "2. Participants"
    }

    // Ensure the next row becomes the header
    let finalHeaders: string[] = [];
    if (data.length > 0) {
      finalHeaders = Object.values(data[0]).map((header) =>
        header?.toString().trim()
      );
      data = data.slice(1);

      // Convert data to match new headers
      data = data.map((row) => {
        const newRow: DataRow = {};
        finalHeaders.forEach((key, index) => {
          newRow[key] = Object.values(row)[index] || "";
        });
        return newRow;
      });
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

    // Convert back to HH:MM:SS format
    const finalData = Object.values(groupedData).map((row) => {
      return {
        ...row,
        "In-Meeting Duration": convertSecondsToDuration(
          row["In-Meeting Duration"] as number
        ),
      };
    });

    console.log("Final Grouped Data (No duplicates):", finalData);

    setProcessedData(finalData);
    setCsvHeaders(finalHeaders);
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
    <div className="h-[1200px] w-full flex flex-col bg-gradient-to-r from-blue-50 to-blue-100 p-8">
      <div className="flex flex-col items-center w-full h-full">
        {/* Upload Section */}
        <Card className="w-full max-w-5xl p-6 shadow-xl bg-white rounded-xl">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
            CSV Uploader
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
              <div className="w-full flex items-center justify-center h-32 border-2 border-dashed border-blue-500 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100">
                <p className="text-gray-700 font-medium">
                  Drag & Drop or Click to Upload CSV
                </p>
              </div>
            </label>
          </div>
        </Card>

        {/* Processed Data Table */}
        <div className="w-full max-w-7xl mt-6 mb-5">
          <Card className="p-6 shadow-xl bg-white rounded-xl overflow-hidden">
            <h2 className="text-xl font-semibold mb-3 text-gray-700">
              Processed Data
            </h2>
            <div className="overflow-auto max-h-[65vh] rounded-lg">
              <table className="w-full border border-gray-300 rounded-lg shadow-md">
                <thead className="bg-blue-600 text-white sticky top-0">
                  <tr>
                    {csvHeaders.length > 0 ? (
                      csvHeaders.map((header, index) => (
                        <th
                          key={index}
                          className="px-4 py-3 text-left border border-gray-300"
                        >
                          {header}
                        </th>
                      ))
                    ) : (
                      <th className="px-4 py-3">No Data Available</th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {processedData.length > 0 ? (
                    processedData.map((row, index) => (
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
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={csvHeaders.length || 1}
                        className="px-4 py-3 text-center text-gray-600"
                      >
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CsvUploader;
