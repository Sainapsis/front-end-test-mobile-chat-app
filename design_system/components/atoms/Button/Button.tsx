import React from 'react';
import { ViewStyle, TextStyle, ActivityIndicator, View, StyleProp } from 'react-native';
import { ThemedText } from '@/design_system/components/atoms/ThemedText';
import { AnimatedPressable } from '@/design_system/components/atoms/Pressable';
import { colors } from '@/design_system/ui/tokens';
import { createButtonStyles } from "./Button.styles";
import { useTheme } from '@/context/ThemeContext';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  /** Function to be called when the button is pressed */
  onPress?: () => void;
  /** Determines the style of the button */
  variant?: ButtonVariant;
  /** Determines the size of the button */
  size?: ButtonSize;
  /** If true, the button is disabled */
  disabled?: boolean;
  /** If true, an activity indicator is shown instead of the button content */
  loading?: boolean;
  /** If true, the button spans the full width of its container */
  fullWidth?: boolean;
  /** Icon to be displayed on the left side of the button content */
  leftIcon?: React.ReactNode;
  /** Icon to be displayed on the right side of the button content */
  rightIcon?: React.ReactNode;
  /** Content to be displayed inside the button */
  children: React.ReactNode;
  /** Custom styles to be applied to the button */
  style?: StyleProp<ViewStyle>;
}

/**
 * Button component used to trigger actions in the application.
 * Supports various styles, sizes, and states to fit different use cases.
 */
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
  const { theme } = useTheme();
  const styles = createButtonStyles(theme);

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

  const renderContent = () => {
    if (typeof children === 'string') {
      return <ThemedText style={[textStyles]}>{children}</ThemedText>;
    }
    return children;
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled || loading}
      style={buttonStyles}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.border.default : colors.primary.dark}
        />
      ) : (
        <View style={styles.contentContainer}>
          {Boolean(leftIcon) && <View style={styles.icon}>{leftIcon}</View>}
          {renderContent()}
          {Boolean(rightIcon) && <View style={styles.icon}>{rightIcon}</View>}
        </View>
      )}
    </AnimatedPressable>
  );
}
