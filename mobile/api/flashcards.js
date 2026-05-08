import apiClient from './client';

export const getMaterials = async () => {
  const response = await apiClient.get('/flashcards/materials');
  return response.data;
};

export const getFlashcards = async (materialId) => {
  const response = await apiClient.get(`/flashcards/${materialId}`);
  return response.data;
};

export const uploadMaterial = async (formData) => {
  const response = await apiClient.post('/flashcards/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const generateFlashcards = async (materialId) => {
  const response = await apiClient.post(`/flashcards/generate/${materialId}`);
  return response.data;
};
