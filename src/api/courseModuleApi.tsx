import apiClient from './apiClient';

// Create a new course category
export const createCourseModuleApi = async (newCourseModule: any) => {
  try {
    const response = await apiClient.post('/module', newCourseModule);
    return response.data;
  } catch (error) {
    console.error('Error creating course module', error);
    throw error;
  }
};

// Read all course categories
export const fetchCourseModuleApi = async () => {
  try {
    const response = await apiClient.get('/module');
    console.log('response', response.data.modules);
    return response.data.modules || [];
  } catch (error) {
    console.error('Failed to fetch course module', error);
    throw error;
  }
};

export const fetchCourseModulebyCourseIdApi = async (courseId: number) => {
  try {
    const response = await apiClient.get(`/coursemodule/${courseId}`);
    console.log('response', response.data.modules);
    return response.data.modules || [];
  } catch (error) {
    console.error('Failed to fetch course module', error);
    throw error;
  }
};

// Update an existing course category
export const updateCourseModuleApi = async (id: number, updatedCourseModule: any) => {
  try {
    console.log('updatedCourseModule', updatedCourseModule);
    const response = await apiClient.put(`/module/${id}`, updatedCourseModule);
    return response.data;
  } catch (error) {
    console.error('Error updating course module', error);
    throw error;
  }
};

// Delete a course category
export const deleteCourseModuleApi = async (id: number) => {
  try {
    const response = await apiClient.delete(`/module/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete course module', error);
    throw error;
  }
};
