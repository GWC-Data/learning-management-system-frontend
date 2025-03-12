import apiClient from "../rootApi/apiClient";

// Create a new Batch
export const createAttendanceApi = async (newAttendance: any) => {
    try {
      const response = await apiClient.post('/attendance', newAttendance, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      console.log("responseattendance", response.data)
      return response.data;
    } catch (error) {
      console.error('Error creating batch', error);
      throw error;
    }
  };

  export const getAttendanceFilterByIdApi = async (
    userId: string,
    classId?: string,
    batchId?: string
  ) => {
    try {
      // ✅ Dynamically build query parameters
      const queryParams = new URLSearchParams();
      if (userId) queryParams.append("userId", userId);
      if (classId) queryParams.append("classId", classId);
      if (batchId) queryParams.append("batchId", batchId);
  
      // ✅ Make API call with dynamic query params
      const response = await apiClient.get(`/attendance?${queryParams.toString()}`);
      console.log('✅ Attendance Response:', response.data);
  
      // ✅ Return response data without modifying any state
      return response.data;
    } catch (error) {
      console.error('❌ Error getting attendance by filters', error);
      throw error;
    }
  };


  // Read all Batches
export const fetchAttendanceApi = async () => {
    try {
      const response = await apiClient.get('/attendance');
      console.log("attendacneApi", response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch attendance', error);
      throw error;
    }
  };

  // Delete a course category
export const deleteAttendanceApi = async (id: string) => {
    try {
      const response = await apiClient.delete(`/attendance/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete batch', error);
      throw error;
    }
  };
  
  
// Create a new Batch
export const createAttendanceFileApi = async (newAttendanceFile: any) => {
  try {
    const response = await apiClient.post('/attendance-file', newAttendanceFile, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    console.log("responseattendance", response.data)
    return response.data;
  } catch (error) {
    console.error('Error creating batch', error);
    throw error;
  }
};

export const getAttendanceFileByIdApi = async (id: string) => {
try {
  const response = await apiClient.get(`/attendance-file/${id}`);
  console.log('response', response.data);
  return response.data;
} catch (error) {
  console.error('Error getting attendance user by id', error);
  throw error;
}
}

// Read all Batches
export const fetchAttendanceFileApi = async () => {
  try {
    const response = await apiClient.get('/attendance-file');
    console.log("fetchAttendanceFile", response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch Batches', error);
    throw error;
  }
};

  // update Batches
export const updateAttendanceFileApi = async (id: string) => {
  try {
    const response = await apiClient.get(`/attendance-file/${id}`, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    console.log("updateAttendanceFile", response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch Batches', error);
    throw error;
  }
};

// Delete a course category
export const deleteAttendanceFileApi = async (id: string) => {
  try {
    const response = await apiClient.delete(`/attendance-file/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete batch', error);
    throw error;
  }
};