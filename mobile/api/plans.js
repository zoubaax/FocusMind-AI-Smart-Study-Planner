import apiClient from './client';

export const generatePlan = async (scheduleId, goals) => {
  const response = await apiClient.post('/plans/generate', {
    scheduleId,
    goals
  });
  return response.data;
};

export const getMyPlans = async () => {
  const response = await apiClient.get('/plans');
  return response.data;
};
