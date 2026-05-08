import api from '../api/axios';

const chatService = {
  sendMessage: async (message, history) => {
    const response = await api.post('/chat', { message, history });
    return response.data.response;
  },

  transcribeAudio: async (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'voice_input.webm');
    
    const response = await api.post('/ai/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.text;
  }
};

export default chatService;
