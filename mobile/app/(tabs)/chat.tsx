import React, { useState, useRef } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { sendMessage, transcribeAudio } from '../../api/chat';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { Send, Mic, Bot, RotateCcw, Sparkles } from 'lucide-react-native';
import Animated, { useAnimatedStyle, FadeInDown, FadeIn } from 'react-native-reanimated';
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
      const errorMessage = { id: Date.now() + 1, text: 'Sorry, I couldn\'t process that. Please try again.', sender: 'ai' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    if (messages.length === 0) return;
    Alert.alert(
      'New Conversation',
      'Start a fresh chat? Current messages will be cleared.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setMessages([]);
            setInput('');
          }
        }
      ]
    );
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
    const normalized = Math.max(0, (metering.value + 160) / 160);
    const scale = 1 + normalized * 1.5;
    
    return {
      transform: [{ scale }],
      opacity: isRecording ? 0.6 : 0,
    };
  });

  const quickPrompts = [
    'What should I study today?',
    'Summarize my schedule',
    'Give me a study tip',
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="px-6 py-4 bg-white border-b border-slate-100 flex-row justify-between items-center">
        <View className="flex-row items-center">
          <View className="bg-primary-50 w-10 h-10 rounded-full items-center justify-center mr-3">
            <Sparkles size={20} color="#0284c7" />
          </View>
          <View>
            <Text className="text-lg font-bold text-slate-900">FocusMind AI</Text>
            <Text className="text-xs text-green-500 font-medium">Online</Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={handleNewChat}
          className="bg-slate-50 w-10 h-10 rounded-full items-center justify-center border border-slate-100"
        >
          <RotateCcw size={18} color="#64748b" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        className="flex-1 bg-slate-50"
      >
        <ScrollView 
          ref={scrollRef}
          className="flex-1 px-4"
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 && (
            <Animated.View entering={FadeIn.duration(500)} className="items-center justify-center py-12">
              <View className="bg-primary-50 w-20 h-20 rounded-full items-center justify-center mb-6">
                <Bot size={40} color="#0284c7" />
              </View>
              <Text className="text-2xl font-bold text-slate-900 text-center px-8">
                Hey {user?.firstName || 'there'}! 👋
              </Text>
              <Text className="text-slate-500 text-center mt-2 px-10 leading-relaxed">
                I know your schedule & tasks. Ask me anything about your studies!
              </Text>

              {/* Quick prompts */}
              <View className="mt-8 w-full px-2">
                {quickPrompts.map((prompt, index) => (
                  <Animated.View key={index} entering={FadeInDown.delay(200 + index * 100)}>
                    <TouchableOpacity 
                      onPress={() => handleSend(prompt)}
                      className="bg-white border border-slate-200 rounded-2xl px-5 py-4 mb-3 flex-row items-center"
                      activeOpacity={0.7}
                    >
                      <Text className="text-primary-600 mr-2">✦</Text>
                      <Text className="text-slate-700 font-medium flex-1">{prompt}</Text>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            </Animated.View>
          )}

          <View className="space-y-3">
            {messages.map((msg) => (
              <Animated.View 
                key={msg.id} 
                entering={FadeInDown.duration(300)}
                className={`flex-row ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-2`}
              >
                {msg.sender === 'ai' && (
                  <View className="bg-primary-50 w-8 h-8 rounded-full items-center justify-center mr-2 mt-1 shrink-0">
                    <Sparkles size={14} color="#0284c7" />
                  </View>
                )}
                <View className={`max-w-[78%] px-4 py-3 ${
                  msg.sender === 'user' 
                    ? 'bg-primary-600 rounded-2xl rounded-br-md' 
                    : 'bg-white border border-slate-100 rounded-2xl rounded-bl-md shadow-sm'
                }`}>
                  <Text className={`text-[15px] leading-6 ${
                    msg.sender === 'user' ? 'text-white' : 'text-slate-800'
                  }`}>
                    {msg.text}
                  </Text>
                </View>
              </Animated.View>
            ))}
            {loading && (
              <Animated.View entering={FadeInDown} className="flex-row justify-start mb-2">
                <View className="bg-primary-50 w-8 h-8 rounded-full items-center justify-center mr-2 mt-1">
                  <Sparkles size={14} color="#0284c7" />
                </View>
                <View className="bg-white border border-slate-100 px-5 py-4 rounded-2xl rounded-bl-md shadow-sm">
                  <View className="flex-row items-center space-x-1">
                    <View className="w-2 h-2 bg-primary-400 rounded-full" />
                    <View className="w-2 h-2 bg-primary-300 rounded-full" />
                    <View className="w-2 h-2 bg-primary-200 rounded-full" />
                  </View>
                </View>
              </Animated.View>
            )}
          </View>
        </ScrollView>

        {/* Input Area */}
        <View className="px-4 py-3 bg-white border-t border-slate-100">
          <View className="flex-row items-end space-x-2">
            <View className="flex-1 flex-row items-end bg-slate-50 rounded-3xl px-4 py-2 border border-slate-200 min-h-[48px] max-h-[120px]">
              <TextInput
                className="flex-1 py-2 text-slate-900 text-[15px]"
                placeholder={isRecording ? "Listening..." : "Ask anything..."}
                placeholderTextColor="#94a3b8"
                value={input}
                onChangeText={setInput}
                multiline
                style={{ maxHeight: 80 }}
              />
              {isTranscribing && <ActivityIndicator size="small" color="#0284c7" className="ml-2 mb-2" />}
            </View>

            <View className="flex-row items-center space-x-2 pb-1">
              {/* Voice button */}
              <View className="items-center justify-center">
                {isRecording && (
                  <Animated.View 
                    style={waveStyle}
                    className="absolute w-11 h-11 bg-red-400 rounded-full"
                  />
                )}
                <TouchableOpacity 
                  onPress={handleVoiceToggle}
                  className={`w-11 h-11 rounded-full items-center justify-center ${
                    isRecording ? 'bg-red-500' : 'bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Mic size={20} color={isRecording ? 'white' : '#64748b'} />
                </TouchableOpacity>
              </View>

              {/* Send button */}
              {input.trim().length > 0 && (
                <TouchableOpacity 
                  onPress={() => handleSend()}
                  className="w-11 h-11 bg-primary-600 rounded-full items-center justify-center shadow-lg shadow-primary-500/30"
                >
                  <Send size={18} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
