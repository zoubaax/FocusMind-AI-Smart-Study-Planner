import apiClient from './client';

export const sendMessage = async (message, history = []) => {
  const response = await apiClient.post('/chat', { message, history });
  return response.data;
};

export const transcribeAudio = async (audioUri) => {
  const formData = new FormData();
  
  // On mobile, we need to handle the file URI correctly
  const filename = audioUri.split('/').pop();
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `audio/${match[1]}` : `audio/m4a`;

  formData.append('file', {
    uri: audioUri,
    name: filename,
    type,
  });

  const response = await apiClient.post('/ai/transcribe', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
