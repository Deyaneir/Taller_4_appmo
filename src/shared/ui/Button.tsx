import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ActivityIndicator, View, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export interface ButtonProps extends TouchableOpacityProps {
  children?: React.ReactNode;
  loading?: boolean;
}

export function Button({ children, loading = false, disabled, style, ...props }: ButtonProps) {
  const isDisabled = disabled || loading;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      style={[
        {
          borderRadius: 12,
          paddingVertical: 14,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isDisabled ? '#9CA3AF' : '#1A3A5C',
        },
        animatedStyle,
        style,
      ]}
      disabled={isDisabled}
      onPressIn={() => {
        if (!isDisabled) scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
      }}
      onPressOut={() => {
        if (!isDisabled) scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <View>{children}</View>
      )}
    </AnimatedTouchable>
  );
}