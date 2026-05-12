import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Image, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSchedules, deleteSchedule } from '../../api/schedules';
import { Calendar, FileText, Trash2, X, Eye, ExternalLink, GraduationCap } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInDown, SlideInRight } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

export default function ScheduleScreen() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchSchedules = async () => {
    try {
      const data = await getSchedules();
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteSchedule(id);
      Toast.show({ type: 'success', text1: 'Deleted', text2: 'Schedule removed successfully.' });
      fetchSchedules();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not delete schedule.' });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView 
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchSchedules();}} />}
      >
        <View className="px-6 pt-8 pb-10">
          <View className="mb-8">
            <Text className="text-3xl font-bold text-slate-900 tracking-tight">Academic Schedule</Text>
            <Text className="text-slate-500 text-lg">Your synchronized timetables.</Text>
          </View>

          <View className="space-y-4">
            {loading && !refreshing ? (
              <ActivityIndicator size="large" color="#0284c7" className="mt-10" />
            ) : schedules.length === 0 ? (
              <View className="bg-white p-12 rounded-[40px] items-center border border-dashed border-slate-200">
                <View className="bg-slate-50 w-20 h-20 rounded-full items-center justify-center mb-4">
                  <Calendar size={40} color="#cbd5e1" />
                </View>
                <Text className="text-slate-400 text-center text-lg font-medium px-4">
                  No schedules uploaded yet. Upload one from the Dashboard!
                </Text>
              </View>
            ) : (
              schedules.map((item, index) => (
                <Animated.View 
                  key={item.id} 
                  entering={FadeInUp.delay(index * 100)}
                  className="mb-4"
                >
                  <View className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm">
                    {/* Preview (if image) */}
                    {item.fileUrl && item.fileUrl.match(/\.(jpg|jpeg|png|webp|gif)/i) ? (
                      <TouchableOpacity 
                        onPress={() => setSelectedImage(item.fileUrl)}
                        activeOpacity={0.9}
                      >
                        <Image 
                          source={{ uri: item.fileUrl }} 
                          className="w-full h-48 bg-slate-100"
                          resizeMode="cover"
                        />
                        <View className="absolute top-4 right-4 bg-black/40 p-2 rounded-full backdrop-blur-md">
                          <Eye size={18} color="white" />
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <View className="w-full h-24 bg-primary-50 items-center justify-center">
                        <FileText size={40} color="#0284c7" />
                        <Text className="text-primary-700 font-bold mt-2 uppercase tracking-widest text-xs">Document</Text>
                      </View>
                    )}

                    <View className="p-6 flex-row justify-between items-center">
                      <View className="flex-1 mr-4">
                        <Text className="text-lg font-bold text-slate-900" numberOfLines={1}>
                          {item.fileName || 'My Timetable'}
                        </Text>
                        <Text className="text-slate-400 text-sm">
                          Added {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      
                      <TouchableOpacity 
                        onPress={() => handleDelete(item.id)}
                        className="bg-red-50 p-3 rounded-2xl"
                      >
                        <Trash2 size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Full Screen Image Preview Modal */}
      <Modal visible={!!selectedImage} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/95 justify-center items-center">
          <TouchableOpacity 
            className="absolute top-12 right-6 z-10 bg-white/10 p-3 rounded-full"
            onPress={() => setSelectedImage(null)}
          >
            <X size={24} color="white" />
          </TouchableOpacity>
          
          <Image 
            source={{ uri: selectedImage }} 
            className="w-full h-full"
            resizeMode="contain"
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}
