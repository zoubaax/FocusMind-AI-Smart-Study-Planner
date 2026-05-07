import api from '../api/axios';

const chatService = {
  sendMessage: async (message) => {
    const response = await api.post('/chat', { message });
    return response.data.response;
  }
};

export default chatService;
