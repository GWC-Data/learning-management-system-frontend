import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { fetchBatchByTraineeIdApi } from "@/api/batchTrainee";
import { fetchBatchByIdApi } from "@/api/batchApi";

interface EnrolledCourses {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  course: string;
  courseId: number;
}

const EnrolledCourses: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [courses, setCourses] = useState<EnrolledCourses[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchBatchesData = async () => {
    try {
      const userId = parseInt(localStorage.getItem("userId") || "0", 10);
      const BatchIds = await fetchBatchByTraineeIdApi(userId);
      const enrolledCourses: EnrolledCourses[] = [];

      for (const id of BatchIds) {
        const data = await fetchBatchByIdApi(id);
        enrolledCourses.push({
          id: id,
          name: data.name,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          course: data.course.courseName,
          courseId: data.course.id,
        });
      }

      setCourses(enrolledCourses);
    } catch (error) {
      toast.error("Error fetching batch details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatchesData();
  }, []);

  const isParentRoute = location.pathname === "/trainee/enrolledCourses";
  const isChildRoute = location.pathname.startsWith("/trainee/enrolledCourses/");

  return (
    <div className="p-6 max-w-7xl mx-auto overflow-x-hidden">
      {isParentRoute && (
        <>
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            Your Enrolled Courses
          </h1>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center text-lg text-gray-500">
              No courses enrolled yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="relative bg-gradient-to-r from-green-100 via-green-50 to-green-200 border border-gray-300 rounded-xl shadow-lg hover:shadow-xl transition-shadow transform hover:scale-105 duration-300 ease-in-out p-6 cursor-pointer"
                  onClick={() =>
                    navigate(`${course.name.toLowerCase()}`, {
                      state: course,
                    })
                  }
                >
                  <div className="text-2xl font-semibold text-gray-800 mb-4">
                    {course.name}
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Start:</span>{" "}
                    {course.startDate.toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">End:</span>{" "}
                    {course.endDate.toLocaleDateString()}
                  </div>
                  <div className="absolute bottom-4 right-4 bg-green-600 text-white text-sm px-4 py-1 rounded-full">
                    {course.course}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>

      )}

      {isChildRoute && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Course Details
          </h2>
          <Outlet />
        </div>
      )}
    </div>
  );
};

export default EnrolledCourses;
