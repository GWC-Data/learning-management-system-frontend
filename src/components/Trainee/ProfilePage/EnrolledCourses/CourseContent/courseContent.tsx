import React, { useEffect, useState } from "react";
import { fetchCourseModulebyCourseIdApi } from "@/api/courseModuleApi"; // Import the API function
import { FaPlay } from "react-icons/fa"; // Play icon from react-icons

// Define the type for the course prop
interface CourseContentProps {
  course: {
    name: string;
    startDate: Date;
    endDate: Date;
    course: string;
    courseId: number;
  };
}

// Define the type for a module
interface Module {
  id: number;
  courseId: number;
  moduleName: string;
  moduleDescription: string;
}

const CourseContent: React.FC<CourseContentProps> = ({ course }) => {
  const [modules, setModules] = useState<Module[]>([]); // State for fetched modules
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null); // State to manage the visibility of modules

  // Fetch course modules on component mount
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const fetchedModules = await fetchCourseModulebyCourseIdApi(
          course.courseId
        );
        setModules(fetchedModules);
      } catch (error) {
        console.error("Failed to fetch course modules", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [course.courseId]);

  // Toggle the visibility of modules
  const handleTopicClick = (topic: string) => {
    if (expandedTopic === topic) {
      setExpandedTopic(null); // Collapse if the same topic is clicked
    } else {
      setExpandedTopic(topic); // Expand the selected topic
    }
  };

  return (
    <div className="w-[400px] overflow-y-auto bg-white p-5 rounded-lg shadow-lg border-2 border-slate-300">
      <h3 className="text-lg font-semibold mb-4">Course Modules</h3>
      <hr />

      {loading ? (
        <div className="text-center mt-5 text-gray-500">Loading modules...</div>
      ) : modules.length === 0 ? (
        <div className="text-center mt-5 text-gray-500">
          No modules available.
        </div>
      ) : (
        <div className="space-y-4 mt-5">
          {/* List of Modules */}
          {modules.map((module, index) => (
            <div key={module.id}>
              <div
                className="font-semibold text-lg cursor-pointer hover:bg-gray-200 p-2 rounded-md flex justify-between items-center"
                onClick={() => handleTopicClick(module.moduleName)}
              >
                {/* Dynamically update numbering */}
                <span>{`${String(index + 1).padStart(2, "0")}: ${module.moduleName}`}</span>
                <div className="border-2 p-1 rounded-lg border-gray-300 ">
                  {/* Arrow icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className={`transition-transform ${expandedTopic === module.moduleName ? "rotate-180" : ""}`}
                  >
                    <path
                      d="M19 9l-7 7-7-7"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Module details (Dropdown) */}
              {expandedTopic === module.moduleName && (
                <div className="mt-2  bg-gray-100 rounded-lg flex items-center">
                  {/* Play Icon */}
                  <button
                    className="flex items-center justify-center w-12 h-12"
                    onClick={() => console.log(`Play ${module.moduleName}`)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24"
                      viewBox="0 -960 960 960"
                      width="24"
                      fill="#000000"
                    >
                      <path d="M320-200v-560l440 280-440 280Zm80-280Zm0 134 210-134-210-134v268Z" />
                    </svg>
                  </button>

                  {/* Description */}
                  <p className="text-gray-600">
                    {module.moduleDescription}
                  </p>
                </div>
              )}

              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseContent;
