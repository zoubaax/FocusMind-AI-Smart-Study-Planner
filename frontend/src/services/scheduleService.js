import api from '../api/axios';

const scheduleService = {
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/schedules/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/schedules');
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/schedules/${id}`);
    return response.data;
  },
};

export default scheduleService;
