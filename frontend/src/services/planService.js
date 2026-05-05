import api from '../api/axios';

const planService = {
  generate: async (scheduleId, goals) => {
    const response = await api.post('/plans/generate', { scheduleId, goals });
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/plans');
    return response.data;
  }
};

export default planService;
