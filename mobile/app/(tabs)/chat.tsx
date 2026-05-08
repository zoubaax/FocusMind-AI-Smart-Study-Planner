import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { sendMessage, transcribeAudio } from '../../api/chat';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { Send, Mic, User, Bot, Loader2 } from 'lucide-react-native';
import Animated, { useAnimatedStyle, withSpring, FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export default function ChatScreen() {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const scrollRef = useRef(null);
  
  const { isRecording, metering, startRecording, stopRecording } = useVoiceRecorder();

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    const userMessage = { id: Date.now(), text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendMessage(text, messages.slice(-10));
      const aiMessage = { id: Date.now() + 1, text: response.response, sender: 'ai' };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceToggle = async () => {
    if (isRecording) {
      const uri = await stopRecording();
      if (uri) {
        setIsTranscribing(true);
        try {
          const { text } = await transcribeAudio(uri);
          if (text) {
            setInput(text);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        } catch (err) {
          console.error('Transcription error:', err);
        } finally {
          setIsTranscribing(false);
        }
      }
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await startRecording();
    }
  };

  // Waveform animation based on metering
  const waveStyle = useAnimatedStyle(() => {
    // Mapping metering (-160 to 0) to scale (1 to 2.5)
    const normalized = Math.max(0, (metering.value + 160) / 160);
    const scale = 1 + normalized * 1.5;
    
    return {
      transform: [{ scale }],
      opacity: isRecording ? 0.6 : 0,
    };
  });

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        className="flex-1 bg-slate-50"
      >
        <ScrollView 
          ref={scrollRef}
          className="flex-1 px-4"
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 20 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 && (
            <View className="items-center justify-center py-20">
              <View className="bg-primary-100 p-6 rounded-full mb-6">
                <Bot size={48} color="#0284c7" />
              </View>
              <Text className="text-2xl font-bold text-slate-900 text-center px-10">
                How can I help you today, {user?.firstName || 'Student'}?
              </Text>
              <Text className="text-slate-500 text-center mt-2 px-12">
                Ask me about your schedule, tasks, or study tips!
              </Text>
            </View>
          )}

          <View className="space-y-4">
            {messages.map((msg) => (
              <Animated.View 
                key={msg.id} 
                entering={FadeInDown}
                className={`flex-row ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <View className={`max-w-[85%] p-4 rounded-[24px] ${
                  msg.sender === 'user' 
                    ? 'bg-primary-600 rounded-tr-none shadow-sm' 
                    : 'bg-white border border-slate-100 rounded-tl-none shadow-sm'
                }`}>
                  <Text className={`text-[15px] leading-5 ${msg.sender === 'user' ? 'text-white' : 'text-slate-800'}`}>
                    {msg.text}
                  </Text>
                </View>
              </Animated.View>
            ))}
            {loading && (
              <View className="flex-row justify-start">
                <View className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
                  <ActivityIndicator size="small" color="#0284c7" />
                </View>
              </View>
            )}
          </View>
        </ScrollView>

      {/* Input Area */}
      <View className="p-4 bg-white border-t border-slate-100">
        <View className="flex-row items-center space-x-3">
          <View className="flex-1 flex-row items-center bg-slate-50 rounded-3xl px-4 py-2 border border-slate-200">
            <TextInput
              className="flex-1 py-2 text-slate-900"
              placeholder={isRecording ? "Listening..." : "Message AI Assistant..."}
              value={input}
              onChangeText={setInput}
              multiline
            />
            {isTranscribing && <ActivityIndicator size="small" color="#0284c7" className="ml-2" />}
          </View>

          <View className="items-center justify-center">
            {isRecording && (
              <Animated.View 
                style={waveStyle}
                className="absolute w-12 h-12 bg-primary-400 rounded-full"
              />
            )}
            <TouchableOpacity 
              onPress={handleVoiceToggle}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                isRecording ? 'bg-red-500' : 'bg-slate-100'
              }`}
            >
              <Mic size={24} color={isRecording ? 'white' : '#64748b'} />
            </TouchableOpacity>
          </View>

          {input.trim().length > 0 && (
            <TouchableOpacity 
              onPress={() => handleSend()}
              className="w-12 h-12 bg-primary-600 rounded-full items-center justify-center shadow-lg shadow-primary-500/30"
            >
              <Send size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
