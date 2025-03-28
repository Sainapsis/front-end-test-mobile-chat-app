import React from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { EmptyState } from '@/design_system/components/molecules';

interface ListTemplateProps<T> {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
  emptyStateMessage?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}