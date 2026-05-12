import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Image, Modal, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSchedules, deleteSchedule, uploadSchedule } from '../../api/schedules';
import { generatePlan } from '../../api/plans';
import { Calendar, FileText, Trash2, X, Eye, Sparkles, GraduationCap, Plus, Upload, Image as ImageIcon, Check } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInDown, SlideInRight, BounceIn, FadeIn } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

export default function ScheduleScreen() {
  const router = useRouter();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [goalsModalVisible, setGoalsModalVisible] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [goals, setGoals] = useState('Pass all my exams with high grades and maintain a good work-life balance.');

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
        
        Toast.show({ type: 'success', text1: 'Schedule Uploaded' });
        fetchSchedules();
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
        
        Toast.show({ type: 'success', text1: 'PDF Schedule Uploaded' });
        fetchSchedules();
      }
    } catch (err) {
      console.error('PDF upload error:', err);
      Toast.show({ type: 'error', text1: 'Upload Failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      // Optimistic update
      setSchedules(prev => prev.filter(s => s.id !== id));
      
      await deleteSchedule(id);
      Toast.show({ type: 'success', text1: 'Deleted', text2: 'Schedule removed successfully.' });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not delete schedule.' });
      fetchSchedules(); // Rollback
    }
  };

  const handleGeneratePlan = async () => {
    if (!selectedScheduleId) return;
    
    setGoalsModalVisible(false);
    setIsGenerating(true);
    
    try {
      await generatePlan(selectedScheduleId, goals);
      Toast.show({ 
        type: 'success', 
        text1: 'Plan Generated! 🚀', 
        text2: 'Your new study tasks are now ready.' 
      });
      
      // Navigate to dashboard (tabs index)
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error generating plan:', error);
      Toast.show({ type: 'error', text1: 'Generation Failed', text2: 'Please try again later.' });
    } finally {
      setIsGenerating(false);
      setSelectedScheduleId(null);
    }
  };

  const openGoalsModal = (id) => {
    setSelectedScheduleId(id);
    setGoalsModalVisible(true);
  };
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView 
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchSchedules();}} />}
      >
        <View className="px-6 pt-8 pb-10">
          <View className="flex-row justify-between items-start mb-8">
            <View className="flex-1 mr-4">
              <Text className="text-3xl font-bold text-slate-900 tracking-tight">Academic Schedule</Text>
              <Text className="text-slate-500 text-lg">Your synchronized timetables.</Text>
            </View>
            <View className="flex-row space-x-2 pt-1">
              <TouchableOpacity 
                onPress={handleUploadImage}
                className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm"
              >
                <ImageIcon size={22} color="#0284c7" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleUploadPDF}
                className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm"
              >
                <FileText size={22} color="#0284c7" />
              </TouchableOpacity>
            </View>
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

                    <View className="p-6">
                      <View className="flex-row justify-between items-center mb-4">
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

                      {/* Generate Button */}
                      <TouchableOpacity 
                        onPress={() => openGoalsModal(item.id)}
                        className="bg-primary-600 py-4 rounded-2xl flex-row items-center justify-center"
                        disabled={isGenerating}
                      >
                        <Sparkles size={20} color="white" />
                        <Text className="text-white font-bold ml-2">Generate AI Plan</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Goals Modal */}
      <Modal visible={goalsModalVisible} transparent={true} animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 bg-black/60 justify-end">
              <Animated.View entering={FadeInDown} className="bg-white rounded-t-[40px] p-8 pb-12">
                <View className="flex-row justify-between items-center mb-6">
                  <Text className="text-2xl font-bold text-slate-900">Study Goals</Text>
                  <TouchableOpacity onPress={() => setGoalsModalVisible(false)} className="bg-slate-50 p-2 rounded-full">
                    <X size={24} color="#64748b" />
                  </TouchableOpacity>
                </View>
                
                <Text className="text-slate-500 mb-4 leading-relaxed">
                  What are your specific goals for this plan? (e.g., focus on math, prepare for finals, maintain balance)
                </Text>
                
                <TextInput
                  className="bg-slate-50 p-6 rounded-3xl text-slate-900 text-base min-h-[120px] border border-slate-100 mb-8"
                  multiline
                  placeholder="Enter your study goals..."
                  value={goals}
                  onChangeText={setGoals}
                  textAlignVertical="top"
                  autoFocus={true}
                />
                
                <TouchableOpacity 
                  onPress={handleGeneratePlan}
                  className="bg-primary-600 py-5 rounded-[28px] flex-row items-center justify-center shadow-xl shadow-primary-500/30"
                >
                  <Sparkles size={22} color="white" />
                  <Text className="text-white font-bold text-lg ml-2">Start AI Magic</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* Generating Overlay */}
      {isGenerating && (
        <View className="absolute inset-0 bg-white/90 items-center justify-center z-50">
          <Animated.View entering={BounceIn} className="items-center">
            <View className="bg-primary-50 w-24 h-24 rounded-full items-center justify-center mb-6">
              <Sparkles size={48} color="#0284c7" />
            </View>
            <Text className="text-2xl font-bold text-slate-900 mb-2">AI is working...</Text>
            <Text className="text-slate-500 text-center px-10">
              Analyzing your schedule and crafting your perfect study plan.
            </Text>
            <ActivityIndicator size="large" color="#0284c7" className="mt-8" />
          </Animated.View>
        </View>
      )}

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
