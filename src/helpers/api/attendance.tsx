import apiClient from "../rootApi/apiClient";

// Create a new Batch
export const createAttendanceApi = async (newAttendance: any) => {
    try {
      const response = await apiClient.post('/attendance', newAttendance);
      console.log("responseattendance", response.data)
      return response.data;
    } catch (error) {
      console.error('Error creating batch', error);
      throw error;
    }
  };

// export const getAttendanceUserByIdApi = async (userId: number) => {
//   try {
//     const response = await apiClient.get(`/attendance/${userId}`);
//     console.log('response', response.data);
//     return response.data;
//   } catch (error) {
//     console.error('Error getting attendance user by id', error);
//     throw error;
//   }
// }

export const getAttendanceByUserIdApi = async (userId: string) => {
  try {
    const response = await apiClient.get(`/attendance`, {
      params: { userId }, // Pass userId as a query parameter
    });

    console.log('response', response.data.attendanceRecords);
    return response.data.attendanceRecords;
  } catch (error) {
    console.error('Error getting attendance user by id', error);
    throw error;
  }
};


  // Read all Batches
export const fetchAttendanceApi = async () => {
    try {
      const response = await apiClient.get('/attendance');
      console.log("read all batches", response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch Batches', error);
      throw error;
    }
  };

  // Delete a course category
export const deleteAttendanceApi = async (id: number) => {
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
    const response = await apiClient.post('/attendance-file', newAttendanceFile);
    console.log("responseattendance", response.data)
    return response.data;
  } catch (error) {
    console.error('Error creating batch', error);
    throw error;
  }
};

export const getAttendanceFileByIdApi = async (id: number) => {
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
export const updateAttendanceFileApi = async (id: number) => {
  try {
    const response = await apiClient.get(`/attendance-file/${id}`);
    console.log("updateAttendanceFile", response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch Batches', error);
    throw error;
  }
};

// Delete a course category
export const deleteAttendanceFileApi = async (id: number) => {
  try {
    const response = await apiClient.delete(`/attendance-file/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete batch', error);
    throw error;
  }
};