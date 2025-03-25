import apiClient from "../rootApi/apiClient";

// Create a new course
export const createCourseAssignmentApi = async (newCourseAssignment: any) => {
  try {
    const response = await apiClient.post(
      "/courseAssignment",
      newCourseAssignment, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating course", error);
    throw error;
  }
};

// Read all courses
export const fetchCourseAssignmentApi = async () => {
  try {
    const response = await apiClient.get("/courseAssignment");
    console.log("fetchcourseassignmentApi", response.data);
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch courses", error);
    throw error;
  }
};

// Read all courseAssignment by batchId
export const fetchCourseAssignmentbybatchIdApi = async (batchId: string) => {
  try {
    console.log("BatchId", batchId);
    const response = await apiClient.get(`/courseAssignmentRecords/${batchId}`);
    console.log("fetchcourseassignmentApi", response.data.courseAssignments);
    return response.data.courseAssignments
     || [];
  } catch (error) {
    console.error("Failed to fetch courses", error);
    throw error;
  }
};

// Update an existing course
export const updateCourseAssignmentApi = async (
  id: string,
  updateAssignment: any
) => {
  try {
    const response = await apiClient.put(
      `/courseAssignment/${id}`,
      updateAssignment, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("updateCourseAssignmentApi", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating course data", error);
    throw error;
  }
};

// Delete a course
export const deleteCourseAssignmentApi = async (id: string) => {
  try {
    const response = await apiClient.delete(`/courseAssignment/${id}`);
    console.log("deleteCourseAssignment", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to delete course", error);
    throw error;
  }
};
