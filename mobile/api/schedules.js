import apiClient from './client';

export const getSchedules = async () => {
  const response = await apiClient.get('/schedules');
  return response.data;
};

export const uploadSchedule = async (fileData) => {
  const formData = new FormData();
  
  formData.append('file', {
    uri: fileData.uri,
    name: fileData.name || 'upload.jpg',
    type: fileData.type || 'image/jpeg',
  });

  const response = await apiClient.post('/schedules/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteSchedule = async (id) => {
  await apiClient.delete(`/schedules/${id}`);
};
