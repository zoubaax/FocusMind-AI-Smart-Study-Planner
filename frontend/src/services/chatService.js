import api from '../api/axios';

const chatService = {
  sendMessage: async (message, history) => {
    const response = await api.post('/chat', { message, history });
    return response.data.response;
  }
};

export default chatService;
