import React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ThemedText, ThemedView } from '@/design_system/components/atoms';
import { styles } from './LoginTemplate.styles';

interface LoginTemplateProps {
  /** Title to display in the header */
  title: string;
  /** Subtitle to display in the header */
  subtitle: string;
  /** Main content of the template */
  children: React.ReactNode;
}

/**
 * LoginTemplate component provides a layout for login screens.
 * It includes a header with title and subtitle, and supports keyboard avoidance.
 */
export const LoginTemplate: React.FC<LoginTemplateProps> = ({
  title,
  subtitle,
  children
}) => {
  return (
    <ThemedView style={styles.safeArea}>
      <StatusBar style="auto" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ThemedView style={styles.container}>
          <ThemedView style={styles.header}>
            <ThemedText type="title">{title}</ThemedText>
            <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
          </ThemedView>
          {children}
        </ThemedView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

export default LoginTemplate;
