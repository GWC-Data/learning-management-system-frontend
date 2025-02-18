import React, { useState } from "react";
import axios from "axios";
import Select from "react-select";

// Define available programming languages for Judge0 API and their snippets
const languageOptions = [
  { value: 71, label: "Python", snippet: "print('Hello, World!')" },
  { value: 50, label: "C", snippet: "#include <stdio.h>\nint main() {\n    printf(\"Hello, World!\\n\");\n    return 0;\n}" },
  { value: 52, label: "C++", snippet: "#include <iostream>\nint main() {\n    std::cout << \"Hello, World!\" << std::endl;\n    return 0;\n}" },
  { value: 62, label: "Java", snippet: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}" },
  { value: 63, label: "JavaScript", snippet: "console.log('Hello, World!');" },
  { value: 70, label: "Ruby", snippet: "puts 'Hello, World!'" },
  { value: 49, label: "Go", snippet: "package main\nimport \"fmt\"\nfunc main() {\n    fmt.Println(\"Hello, World!\")\n}" },
  { value: 82, label: "SQL", snippet: "SELECT 'Hello, World!';" }, 
];

const CodeExecutor: React.FC = () => {
  const [code, setCode] = useState<string>(languageOptions[0].snippet); // Default to Python snippet
  const [language, setLanguage] = useState<any>(languageOptions[0]); // Default to Python
  const [output, setOutput] = useState<string>(""); // Execution result
  const [loading, setLoading] = useState<boolean>(false); // Loading state

  // Handle language change
  const handleLanguageChange = (selectedOption: any) => {
    setLanguage(selectedOption);
    setCode(selectedOption.snippet); // Update code to match selected language snippet
  };

  // Execute code
  const executeCode = async () => {
    setLoading(true);
    setOutput(""); // Clear previous output

    try {
      // Send the code to Judge0 API for execution
      const response = await axios.post("/submissions", {
        source_code: code,
        language_id: language.value, // Language ID from Judge0
        stdin: "", // Optional: You can provide input for the program here
        expected_output: "", // Optional: You can specify expected output for validation
      });

      // Wait for the execution to finish by polling the submission
      const resultResponse = await pollExecution(response.data.token);

      // Set the output (stdout or stderr)
      if (resultResponse) {
        setOutput(
          resultResponse.stdout || resultResponse.stderr || "No output"
        );
      } else {
        setOutput("Execution timeout or failed");
      }
    } catch (error) {
      setOutput("Error executing code");
    } finally {
      setLoading(false);
    }
  };

  // Poll for execution result
  const pollExecution = async (token: string) => {
    const url = `https://api.judge0.com/submissions/${token}`;
    let result = null;
    let attempts = 0;

    // Poll every 1 second, up to 10 times
    while (attempts < 10) {
      try {
        const response = await axios.get(url);
        if (response.data.status.description === "Accepted") {
          result = response.data;
          break;
        }
      } catch (error) {
        console.error("Polling error:", error);
      }

      attempts += 1;
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
    }

    return result;
  };

  return (
    <div className="bg-green-100 p-8 rounded-xl shadow-lg w-[1200px] mx-auto mt-10 mb-10">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Code Executor
      </h1>

      {/* Language Selection Dropdown */}
      <div className="mb-6">
        <Select
          value={language}
          onChange={handleLanguageChange}
          options={languageOptions}
          className="text-gray-800"
        />
      </div>

      {/* Code Editor */}
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={14}
        className="w-full h-[550px] p-4 bg-white rounded-lg text-gray-800 mb-6 focus:outline-none focus:ring-2 focus:ring-green-400 font-semibold text-xl"
        placeholder="Write your code here..."
      />

      {/* Execute Button */}
      <button
        onClick={executeCode}
        className="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
        disabled={loading}
      >
        {loading ? "Running..." : "Run Code"}
      </button>

      {/* Output Display */}
      <div className="mt-6">
        <h2 className="font-semibold text-gray-800">Output:</h2>
        <pre className="bg-white p-4 rounded-lg text-gray-800 mt-2">
          {output}
        </pre>
      </div>
    </div>
  );
};

export default CodeExecutor;
