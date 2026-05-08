import apiClient from './client';

export const login = async (email, password) => {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  return response.data;
};

export const getMe = async () => {
  const response = await apiClient.get('/users/me');
  return response.data;
};
