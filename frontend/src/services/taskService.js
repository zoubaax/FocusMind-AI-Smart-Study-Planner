import api from '../api/axios';

const taskService = {
  activatePlan: async (planId) => {
    const response = await api.post(`/tasks/activate-plan/${planId}`);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/tasks');
    return response.data;
  },

  toggle: async (taskId) => {
    const response = await api.patch(`/tasks/${taskId}/toggle`);
    return response.data;
  }
};

export default taskService;
