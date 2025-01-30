import React, { useEffect, useState } from "react";
import { fetchCourseModulebyCourseIdApi } from "@/api/courseModuleApi";
import { FaPlay } from "react-icons/fa";

interface CourseContentProps {
  course: {
    name: string;
    startDate: Date;
    endDate: Date;
    course: string;
    courseId: number;
  };
  setRecordedLink: (link: string | null) => void;
  setSelectedModuleDetails: (
    details: { name: string; description: string } | null
  ) => void; // New prop for setting module details
}

interface Module {
  id: number;
  courseId: number;
  moduleName: string;
  moduleDescription: string;
  recordedLink: string;
  materialForModule: string; // File URL for the module's material
}

const CourseContent: React.FC<CourseContentProps> = ({
  course,
  setRecordedLink,
  setSelectedModuleDetails,
}) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  // Fetch course modules on component mount
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const fetchedModules = await fetchCourseModulebyCourseIdApi(
          course.courseId
        );
        console.log("Fetched Modules:", fetchedModules);
        setModules(fetchedModules);
      } catch (error) {
        console.error("Failed to fetch course modules", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [course.courseId]);

  // Unified function to handle module interactions
  const handleModuleClick = (module: Module) => {
    const isSameModule = expandedTopic === module.moduleName;

    setExpandedTopic(isSameModule ? null : module.moduleName); // Toggle visibility
    setSelectedModuleDetails(
      isSameModule
        ? null // Reset details if collapsing
        : {
            name: module.moduleName,
            description: module.moduleDescription,
          }
    );
    setRecordedLink(isSameModule ? null : module.recordedLink); // Set or reset the recorded link
  };

  return (
    <div className="w-[400px] overflow-y-auto bg-white p-5 rounded-lg shadow-lg border-2 border-slate-300 h-[545px]">
      <div className="sticky top-0 z-0 p-4 bg-white">
        <h3 className="text-lg font-semibold">Course Modules</h3>
      </div>

      {loading ? (
        <div className="text-center mt-5 text-gray-500">Loading modules...</div>
      ) : modules.length === 0 ? (
        <div className="text-center mt-5 text-gray-500">
          No modules available.
        </div>
      ) : (
        <div className="space-y-4 mt-5">
          {modules.map((module, index) => (
            <div key={module.id}>
              <div
                className="font-semibold text-lg cursor-pointer hover:bg-gray-200 p-2 rounded-md flex justify-between items-center"
                onClick={() => handleModuleClick(module)}
              >
                <span>{`${String(index + 1).padStart(2, "0")}: ${module.moduleName}`}</span>
                <div className="border-2 p-1 rounded-lg border-gray-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className={`transition-transform ${
                      expandedTopic === module.moduleName ? "rotate-180" : ""
                    }`}
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

              {expandedTopic === module.moduleName && (
                <div className="mt-2 bg-gray-100 rounded-lg p-2">
                  <div className="flex gap-4 mb-4 bg-gray-100 p-3 items-center">
                    {/* Play Button */}
                    <button
                      className="flex items-center justify-center w-12 h-12 text-black"
                      // onClick={() => handlePlayClick(module.recordedLink)}
                    >
                      <FaPlay className="text-lg" />
                    </button>

                    {/* Module Description */}
                    <div className="flex-1">
                      <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                        {module.moduleDescription}
                      </p>
                    </div>
                  </div>

                  {module.materialForModule && (
                    <div className="mt-3 flex flex-cols gap-2 ml-8">
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="24px"
                          viewBox="0 -960 960 960"
                          width="24px"
                          fill="#000000"
                        >
                          <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h240l80 80h320q33 0 56.5 23.5T880-640v400q0 33-23.5 56.5T800-160H160Zm0-80h640v-400H447l-80-80H160v480Zm0 0v-480 480Z" />
                        </svg>
                        <p className="text-sm text-gray-600">
                          Resourses:
                        </p>
                        <a
                          href={module.materialForModule}
                          download
                          className="text-blue-500 hover:underline text-sm"
                        >
                          Download Material
                        </a>
                      </div>
                    </div>
                  )}
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
