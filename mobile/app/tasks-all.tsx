import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { getDashboardStats, toggleTask, deleteTask, deleteAllTasks } from '../api/tasks';
import { CheckCircle2, Circle, Clock, ChevronLeft, Trash2, BookOpen, Trash } from 'lucide-react-native';
import Animated, { FadeInDown, LinearTransition, FadeInUp } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

export default function AllTasksScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = async () => {
    try {
      const stats = await getDashboardStats();
      setTasks(stats.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggleTask = async (taskId) => {
    try {
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ));
      await toggleTask(taskId);
    } catch (error) {
      fetchTasks();
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      await deleteTask(taskId);
      Toast.show({ type: 'success', text1: 'Task Deleted' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Delete Failed' });
      fetchTasks();
    }
  };

  const handleClearAll = async () => {
    try {
      setTasks([]);
      await deleteAllTasks();
      Toast.show({ type: 'success', text1: 'Plan Cleared', text2: 'All tasks have been removed.' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Clear Failed' });
      fetchTasks();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Custom Header */}
      <View className="px-6 pt-4 pb-6 flex-row items-center justify-between border-b border-slate-100 bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="bg-slate-50 p-2 rounded-xl mr-3">
            <ChevronLeft size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-slate-900">Daily Plan</Text>
        </View>
        
        {tasks.length > 0 && (
          <TouchableOpacity 
            onPress={handleClearAll}
            className="bg-red-50 px-4 py-2 rounded-xl flex-row items-center"
          >
            <Trash size={16} color="#ef4444" />
            <Text className="text-red-500 font-bold ml-2">Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        className="flex-1 px-6 pt-6"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchTasks();}} />}
      >
        <View className="mb-8">
          <Text className="text-slate-500 text-lg">Every step brings you closer to your goal. 🚀</Text>
        </View>

        <View className="space-y-4 pb-10">
          {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#0284c7" className="mt-10" />
          ) : tasks.length === 0 ? (
            <View className="bg-white p-10 rounded-3xl items-center border border-dashed border-slate-200">
              <BookOpen size={48} color="#cbd5e1" />
              <Text className="text-slate-400 mt-4 text-center">Your plan is empty. Generate one to get started!</Text>
            </View>
          ) : (
            tasks.map((task, index) => (
              <Animated.View 
                key={task.id}
                entering={FadeInDown.delay(index * 50)}
                layout={LinearTransition}
                className="mb-4"
              >
                <View 
                  className={`flex-row items-center p-5 rounded-[28px] border ${
                    task.completed 
                      ? 'bg-slate-50 border-slate-100' 
                      : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <TouchableOpacity onPress={() => handleToggleTask(task.id)} className="mr-4">
                    {task.completed ? (
                      <CheckCircle2 size={26} color="#22c55e" />
                    ) : (
                      <Circle size={26} color="#cbd5e1" />
                    )}
                  </TouchableOpacity>
                  
                  <View className="flex-1">
                    <Text 
                      className={`text-lg font-bold ${
                        task.completed ? 'text-slate-400 line-through' : 'text-slate-900'
                      }`}
                    >
                      {task.title}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Clock size={12} color="#94a3b8" />
                      <Text className="text-slate-400 text-xs ml-1 font-medium">{task.timeSlot || 'Anytime'}</Text>
                    </View>
                  </View>

                  <TouchableOpacity onPress={() => handleDeleteTask(task.id)} className="p-2 ml-2">
                    <Trash2 size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
