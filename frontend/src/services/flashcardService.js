import api from '../api/axios';

const flashcardService = {
    uploadMaterial: async (formData) => {
        const response = await api.post('/flashcards/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    generateFlashcards: async (materialId) => {
        const response = await api.post(`/flashcards/generate/${materialId}`);
        return response.data;
    },

    getUserMaterials: async () => {
        const response = await api.get('/flashcards/materials');
        return response.data;
    },

    getFlashcardsByMaterial: async (materialId) => {
        const response = await api.get(`/flashcards/material/${materialId}`);
        return response.data;
    }
};

export default flashcardService;
