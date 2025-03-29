import React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ThemedText, ThemedView } from '@/design_system/components/atoms';
import { styles } from './LoginTemplate.styles';

interface LoginTemplateProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

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
