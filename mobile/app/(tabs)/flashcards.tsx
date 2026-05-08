import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMaterials, getFlashcards, generateFlashcards } from '../../api/flashcards';
import { BookOpen, Brain, ChevronRight, X, Sparkles, GraduationCap } from 'lucide-react-native';
import Flashcard from '../../components/Flashcard';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';

export default function FlashcardsScreen() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sessionVisible, setSessionVisible] = useState(false);
  const [currentCards, setCurrentCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchMaterials = async () => {
    try {
      const data = await getMaterials();
      setMaterials(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const startStudySession = async (materialId) => {
    try {
      const cards = await getFlashcards(materialId);
      if (cards.length > 0) {
        setCurrentCards(cards);
        setCurrentIndex(0);
        setSessionVisible(true);
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const handleGenerate = async (materialId) => {
    try {
      await generateFlashcards(materialId);
      fetchMaterials();
    } catch (error) {
      console.error('Error generating cards:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView 
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchMaterials();}} />}
      >
        <View className="px-6 pt-8 pb-10">
          <View className="mb-8">
            <Text className="text-3xl font-bold text-slate-900">Study Vault</Text>
            <Text className="text-slate-500 text-lg">Your AI-generated flashcards.</Text>
          </View>

          <View className="space-y-4">
            {materials.length === 0 && !loading ? (
              <View className="bg-white p-10 rounded-3xl items-center border border-dashed border-slate-200">
                <GraduationCap size={48} color="#cbd5e1" />
                <Text className="text-slate-400 mt-4 text-center text-lg">No course materials yet. Upload a PDF on the web to get started!</Text>
              </View>
            ) : (
              materials.map((item, index) => (
                <Animated.View key={item.id} entering={FadeInUp.delay(index * 100)}>
                  <TouchableOpacity 
                    onPress={() => startStudySession(item.id)}
                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex-row items-center"
                  >
                    <View className="bg-primary-50 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                      <BookOpen size={24} color="#0284c7" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-slate-900" numberOfLines={1}>{item.fileName}</Text>
                      <Text className="text-slate-500 text-sm">Tap to study</Text>
                    </View>
                    <ChevronRight size={20} color="#cbd5e1" />
                  </TouchableOpacity>
                </Animated.View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Study Session Modal */}
      <Modal visible={sessionVisible} animationType="slide" presentationStyle="fullScreen">
        <View className="flex-1 bg-slate-900">
          <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
            <View className="flex-1 px-6 pb-10">
              {/* Modal Header */}
              <View className="flex-row justify-between items-center mb-8 pt-4">
                <View>
                  <Text className="text-white text-2xl font-bold tracking-tight">Study Session</Text>
                  <View className="flex-row items-center mt-1">
                    <View className="w-2 h-2 rounded-full bg-primary-500 mr-2" />
                    <Text className="text-slate-400 font-medium">Card {currentIndex + 1} of {currentCards.length}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => setSessionVisible(false)} 
                  className="bg-slate-800/50 w-12 h-12 rounded-full items-center justify-center border border-slate-700"
                >
                  <X size={24} color="white" />
                </TouchableOpacity>
              </View>

            {/* Flashcard Area */}
            <View className="flex-1 justify-center">
              {currentCards.length > 0 && (
                <Flashcard 
                  key={currentCards[currentIndex].id}
                  question={currentCards[currentIndex].question} 
                  answer={currentCards[currentIndex].answer} 
                />
              )}
            </View>

            {/* Controls */}
            <View className="flex-row justify-between mt-10">
              <TouchableOpacity 
                disabled={currentIndex === 0}
                onPress={() => setCurrentIndex(prev => prev - 1)}
                className={`flex-1 py-4 rounded-2xl mr-2 items-center ${currentIndex === 0 ? 'bg-slate-800 opacity-50' : 'bg-slate-800'}`}
              >
                <Text className="text-white font-bold">Previous</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => {
                  if (currentIndex < currentCards.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                  } else {
                    setSessionVisible(false);
                  }
                }}
                className="flex-1 py-4 bg-primary-600 rounded-2xl ml-2 items-center"
              >
                <Text className="text-white font-bold">
                  {currentIndex === currentCards.length - 1 ? 'Finish' : 'Next'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
    </SafeAreaView>
  );
}
