import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemedView } from '@/design_system/components/atoms';
import { Stack } from 'expo-router';

interface ScreenTemplateProps {
  children: React.ReactNode;
  title: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
}