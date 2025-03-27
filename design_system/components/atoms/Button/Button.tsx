import React from 'react';
import { ViewStyle, TextStyle, ActivityIndicator, View, StyleProp } from 'react-native';
import { ThemedText } from '@/design_system/components/atoms/ThemedText';
import { AnimatedPressable } from '@/design_system/components/atoms/Pressable';

import { colors } from '@/design_system/ui/tokens';

import { styles } from './Button.styles';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: string;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled,
  loading,
  fullWidth,
  leftIcon,
  rightIcon,
  children,
  style,
}: ButtonProps) {
  const buttonStyles: StyleProp<ViewStyle> = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style as ViewStyle,
  ].filter(Boolean);

  const textStyles: StyleProp<TextStyle> = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
  ].filter(Boolean);

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled || loading}
      style={buttonStyles}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? colors.text.inverse : colors.primary[500]} 
        />
      ) : (
        <View style={styles.contentContainer}>
          {Boolean(leftIcon) && <View style={styles.icon}>{leftIcon}</View>}
          <ThemedText style={textStyles}>{children}</ThemedText>
          {Boolean(rightIcon) && <View style={styles.icon}>{rightIcon}</View>}
        </View>
      )}
    </AnimatedPressable>
  );
}
