import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  withSequence 
} from 'react-native-reanimated';

export default function Skeleton({ width, height, borderRadius = 12, className = "" }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View 
      style={[
        { width, height, borderRadius, backgroundColor: '#e2e8f0' },
        animatedStyle
      ]}
      className={className}
    />
  );
}

export const DashboardSkeleton = () => (
  <View className="px-6 pt-8 pb-10 space-y-6">
    <View className="mb-8">
      <Skeleton width={150} height={20} className="mb-2" />
      <Skeleton width={200} height={35} />
    </View>
    <View className="flex-row justify-between mb-8">
      <Skeleton width="48%" height={120} borderRadius={24} />
      <Skeleton width="48%" height={120} borderRadius={24} />
    </View>
    <Skeleton width="100%" height={100} borderRadius={24} className="mb-10" />
    <View className="space-y-4">
      <Skeleton width="100%" height={80} borderRadius={16} />
      <Skeleton width="100%" height={80} borderRadius={16} />
      <Skeleton width="100%" height={80} borderRadius={16} />
    </View>
  </View>
);
