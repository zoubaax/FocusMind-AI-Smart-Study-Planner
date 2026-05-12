import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats, toggleTask, deleteTask } from '../../api/tasks';
import { CheckCircle2, Circle, Trophy, BookOpen, Clock, Layout, LogOut, Calendar, Plus, Upload, Image as ImageIcon, FileText, Trash2 } from 'lucide-react-native';
import Animated, { FadeInDown, LinearTransition, BounceIn } from 'react-native-reanimated';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { uploadSchedule, getSchedules } from '../../api/schedules';

import { DashboardSkeleton } from '../../components/Skeleton';

import { useFocusEffect } from 'expo-router';

export default function DashboardScreen() {
  const { user, onLogout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    if (!user) return;
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [user])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, []);

  const handleToggleTask = async (taskId) => {
    try {
      // Optimistic UI update
      setStats(prev => {
        const newTasks = prev.tasks.map(t => 
          t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        const completed = newTasks.filter(t => t.completed).length;
        return {
          ...prev,
          tasks: newTasks,
          completedTasks: completed,
          pendingTasks: newTasks.length - completed,
          progress: ((completed / newTasks.length) * 100).toFixed(0)
        };
      });
      
      await toggleTask(taskId);
    } catch (error) {
      console.error('Error toggling task:', error);
      fetchStats(); // Rollback on error
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      // Optimistic UI update
      setStats(prev => ({
        ...prev,
        tasks: prev.tasks.filter(t => t.id !== taskId)
      }));
      
      await deleteTask(taskId);
      Toast.show({ type: 'success', text1: 'Task Deleted' });
    } catch (error) {
      console.error('Error deleting task:', error);
      Toast.show({ type: 'error', text1: 'Delete Failed' });
      fetchStats(); // Rollback
    }
  };

  const handleUploadImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setLoading(true);
        const asset = result.assets[0];
        await uploadSchedule({
          uri: asset.uri,
          name: asset.fileName || 'schedule.jpg',
          type: asset.mimeType || 'image/jpeg',
        });
        
        Toast.show({
          type: 'success',
          text1: 'Schedule Uploaded',
          text2: 'Your image timetable is now synchronized.',
        });
        fetchStats();
      }
    } catch (err) {
      console.error('Image upload error:', err);
      Toast.show({ type: 'error', text1: 'Upload Failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setLoading(true);
        const asset = result.assets[0];
        await uploadSchedule({
          uri: asset.uri,
          name: asset.name,
          type: 'application/pdf',
        });
        
        Toast.show({
          type: 'success',
          text1: 'PDF Schedule Uploaded',
          text2: 'Your timetable has been saved.',
        });
        fetchStats();
      }
    } catch (err) {
      console.error('PDF upload error:', err);
      Toast.show({ type: 'error', text1: 'Upload Failed' });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <DashboardSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView 
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="px-6 pt-8 pb-10">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-10">
            <View>
              <Text className="text-slate-500 text-base font-medium">Good Morning,</Text>
              <Text className="text-3xl font-bold text-slate-900 tracking-tight">
                {user?.firstName || 'Student'}! 👋
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => onLogout()}
              className="bg-white w-12 h-12 rounded-2xl border border-slate-100 shadow-sm items-center justify-center"
            >
              <LogOut size={22} color="#ef4444" />
            </TouchableOpacity>
          </View>

          {/* Stats Grid */}
          <View className="flex-row space-x-4 mb-8">
            <View className="flex-1 bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
              <View className="bg-blue-50 w-12 h-12 rounded-2xl items-center justify-center mb-4">
                <Layout size={24} color="#3b82f6" />
              </View>
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Tasks</Text>
              <Text className="text-3xl font-bold text-slate-900">{stats?.totalTasks || 0}</Text>
            </View>

            <View className="flex-1 bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
              <View className="bg-green-50 w-12 h-12 rounded-2xl items-center justify-center mb-4">
                <Trophy size={24} color="#22c55e" />
              </View>
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Done</Text>
              <Text className="text-3xl font-bold text-slate-900">{stats?.completedTasks || 0}</Text>
            </View>
          </View>

          {/* Progress Card */}
          <View className="bg-primary-600 p-8 rounded-[40px] mb-10 shadow-2xl shadow-primary-500/40 overflow-hidden">
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-primary-100 text-sm font-bold uppercase tracking-widest mb-1">Your Progress</Text>
                <Text className="text-white text-3xl font-extrabold">Daily Goal</Text>
              </View>
              <View className="bg-primary-500/30 px-4 py-2 rounded-2xl">
                <Text className="text-white text-xl font-black">{stats?.progress}%</Text>
              </View>
            </View>
            <View className="w-full h-3 bg-primary-400/30 rounded-full overflow-hidden">
              <View 
                className="h-full bg-white rounded-full" 
                style={{ width: `${Math.max(stats?.progress || 0, 5)}%` }} 
              />
            </View>
            <Text className="text-primary-100 mt-4 font-medium italic">
              {stats?.progress >= 100 ? "You're a rockstar! 🌟" : "Keep going, you're doing great! 🚀"}
            </Text>
          </View>

          {/* Today's Tasks */}
          <View className="mb-10">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-slate-900">Today's Tasks</Text>
              <TouchableOpacity onPress={() => router.push('/tasks-all')}>
                <Text className="text-primary-600 font-semibold">See all</Text>
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              {stats?.tasks?.length === 0 ? (
                <View className="bg-white p-8 rounded-3xl items-center border border-dashed border-slate-200">
                  <BookOpen size={40} color="#cbd5e1" />
                  <Text className="text-slate-400 mt-4 text-center">No tasks for today. Start by generating a plan!</Text>
                </View>
              ) : (
                stats?.tasks?.slice(0, 3).map((task, index) => (
                  <Animated.View 
                    key={task.id}
                    entering={FadeInDown.delay(index * 100)}
                    layout={LinearTransition}
                  >
                    <TouchableOpacity 
                      onPress={() => handleToggleTask(task.id)}
                      className={`flex-row items-center p-5 rounded-2xl border ${
                        task.completed 
                          ? 'bg-slate-50 border-slate-100' 
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <View className="mr-4">
                        {task.completed ? (
                          <CheckCircle2 size={24} color="#22c55e" />
                        ) : (
                          <Circle size={24} color="#cbd5e1" />
                        )}
                      </View>
                      <View className="flex-1">
                        <Text 
                          className={`text-lg font-semibold ${
                            task.completed ? 'text-slate-400 line-through' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <Clock size={12} color="#94a3b8" />
                          <Text className="text-slate-400 text-xs ml-1">{task.timeSlot || 'Anytime'}</Text>
                        </View>
                      </View>
                      
                      <TouchableOpacity 
                        onPress={() => handleDeleteTask(task.id)}
                        className="p-2 ml-2"
                      >
                        <Trash2 size={18} color="#94a3b8" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  </Animated.View>
                ))
              )}
            </View>
          </View>

          {/* My Schedule / Emplois */}
          <View className="mb-10">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-slate-900">My Schedule</Text>
              <View className="flex-row space-x-2">
                <TouchableOpacity 
                  onPress={handleUploadImage}
                  className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm"
                >
                  <ImageIcon size={20} color="#64748b" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleUploadPDF}
                  className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm"
                >
                  <FileText size={20} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="bg-white p-8 rounded-[32px] items-center border border-dashed border-slate-200">
              <Calendar size={40} color="#cbd5e1" />
              <Text className="text-slate-400 mt-4 text-center">
                Upload your timetable (PDF or Image) to keep it handy!
              </Text>
            </View>
          </View>

          </View>
      </ScrollView>
    </SafeAreaView>
  );
}
