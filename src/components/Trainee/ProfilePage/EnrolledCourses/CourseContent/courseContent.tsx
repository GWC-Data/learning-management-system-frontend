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

  // Fetch course modules on component mount
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const fetchedModules = await fetchCourseModulebyCourseIdApi(course.courseId);
        setModules(fetchedModules);
      } catch (error) {
        console.error("Failed to fetch course modules", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [course.courseId]);

  return (
    <div className="w-[390px] bg-white p-5 rounded-lg shadow-lg">
      <h3 className="text-3xl font-semibold mb-6 text-center text-gray-800">Course Modules</h3>
      <hr className="border-gray-300 mb-6" />

      {loading ? (
        <div className="text-center mt-5 text-gray-500">Loading modules...</div>
      ) : modules.length === 0 ? (
        <div className="text-center mt-5 text-gray-500">No modules available.</div>
      ) : (
        <div className="space-y-6 mt-2">
          {/* List of Modules */}
          {modules.map((module) => (
            <div key={module.id} className="bg-gray-50 rounded-lg shadow-md p-4 grid grid-cols-12 gap-6">
              <div className="col-span-2 flex justify-center items-center">
                <button
                  className="bg-blue-500 text-white rounded-full p-4 shadow-md hover:bg-blue-600 transition-colors duration-300"
                  onClick={() => console.log(`Play ${module.moduleName}`)}
                >
                  <FaPlay className="w-2 h-2" />
                </button>
              </div>

              <div className="col-span-10 ml-5">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">{module.moduleName}</h4>
                <p className="text-gray-600">{module.moduleDescription}</p>
              </div>

             
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseContent;
