import React from 'react';
import { View, TextInput } from 'react-native';
import { ThemedView } from '@/design_system/components/atoms';

interface SearchTemplateProps {
  children: React.ReactNode;
  onSearch: (term: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}