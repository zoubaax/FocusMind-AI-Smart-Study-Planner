import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export default function Flashcard({ question, answer }) {
  const flip = useSharedValue(0);

  const handleFlip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    flip.value = withSpring(flip.value === 0 ? 1 : 0, {
      damping: 15,
      stiffness: 90
    });
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(
      flip.value,
      [0, 1],
      [0, 180],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ rotateY: `${rotateValue}deg` }],
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(
      flip.value,
      [0, 1],
      [180, 360],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ rotateY: `${rotateValue}deg` }],
    };
  });

  return (
    <TouchableOpacity activeOpacity={1} onPress={handleFlip} className="w-full h-80 items-center justify-center">
      {/* Front Side */}
      <Animated.View 
        style={[styles.card, frontAnimatedStyle]} 
        className="absolute w-full h-full bg-white rounded-3xl p-8 items-center justify-center border border-slate-100 shadow-xl shadow-slate-200"
      >
        <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Question</Text>
        <Text className="text-slate-900 text-2xl font-bold text-center leading-tight">
          {question}
        </Text>
      </Animated.View>

      {/* Back Side */}
      <Animated.View 
        style={[styles.card, backAnimatedStyle, styles.backCard]} 
        className="absolute w-full h-full bg-primary-600 rounded-3xl p-8 items-center justify-center shadow-xl shadow-primary-500/30"
      >
        <Text className="text-primary-200 text-xs font-bold uppercase tracking-widest mb-4">Answer</Text>
        <Text className="text-white text-xl font-medium text-center leading-relaxed">
          {answer}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backfaceVisibility: 'hidden',
  },
  backCard: {
    position: 'absolute',
    top: 0,
  },
});
