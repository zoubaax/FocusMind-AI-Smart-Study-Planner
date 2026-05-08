import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats, toggleTask } from '../../api/tasks';
import { CheckCircle2, Circle, Trophy, BookOpen, Clock, Layout } from 'lucide-react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { DashboardSkeleton } from '../../components/Skeleton';

export default function DashboardScreen() {
  const { user } = useAuth();
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

  useEffect(() => {
    if (user) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [user]);

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
          <View className="mb-8">
            <Text className="text-slate-500 text-lg">Welcome back,</Text>
            <Text className="text-3xl font-bold text-slate-900">{user?.firstname}! 👋</Text>
          </View>

          {/* Stats Grid */}
          <View className="flex-row flex-wrap justify-between mb-8">
            <View className="w-[48%] bg-white p-5 rounded-3xl mb-4 shadow-sm border border-slate-100">
              <View className="bg-blue-50 w-10 h-10 rounded-xl items-center justify-center mb-4">
                <Layout size={20} color="#3b82f6" />
              </View>
              <Text className="text-slate-500 text-sm mb-1">Total Tasks</Text>
              <Text className="text-2xl font-bold text-slate-900">{stats?.totalTasks || 0}</Text>
            </View>

            <View className="w-[48%] bg-white p-5 rounded-3xl mb-4 shadow-sm border border-slate-100">
              <View className="bg-green-50 w-10 h-10 rounded-xl items-center justify-center mb-4">
                <Trophy size={20} color="#22c55e" />
              </View>
              <Text className="text-slate-500 text-sm mb-1">Completed</Text>
              <Text className="text-2xl font-bold text-slate-900">{stats?.completedTasks || 0}</Text>
            </View>
          </View>

          {/* Progress Card */}
          <View className="bg-primary-600 p-6 rounded-3xl mb-10 shadow-lg shadow-primary-500/30">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-lg font-bold">Daily Progress</Text>
              <Text className="text-white text-2xl font-bold">{stats?.progress}%</Text>
            </View>
            <View className="h-2 bg-primary-400/30 rounded-full overflow-hidden">
              <Animated.View 
                className="h-full bg-white rounded-full" 
                style={{ width: `${stats?.progress}%` }} 
              />
            </View>
          </View>

          {/* Today's Tasks */}
          <View>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-slate-900">Today's Tasks</Text>
              <TouchableOpacity onPress={onRefresh}>
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
                stats?.tasks?.map((task, index) => (
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
                    </TouchableOpacity>
                  </Animated.View>
                ))
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
