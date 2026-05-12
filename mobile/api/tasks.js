import apiClient from './client';

export const getTasks = async () => {
  const response = await apiClient.get('/tasks');
  return response.data;
};

export const toggleTask = async (taskId) => {
  const response = await apiClient.patch(`/tasks/${taskId}/toggle`);
  return response.data;
};

export const deleteTask = async (taskId) => {
  await apiClient.delete(`/tasks/${taskId}`);
};

export const getDashboardStats = async () => {
  // We can derive stats from tasks or call a specific stats endpoint if it exists
  // For now, let's assume we can get basic counts from existing endpoints
  const tasks = await getTasks();
  const completed = tasks.filter(t => t.completed).length;
  const pending = tasks.length - completed;
  const progress = tasks.length > 0 ? (completed / tasks.length) * 100 : 0;
  
  return {
    totalTasks: tasks.length,
    completedTasks: completed,
    pendingTasks: pending,
    progress: progress.toFixed(0),
    tasks
  };
};
