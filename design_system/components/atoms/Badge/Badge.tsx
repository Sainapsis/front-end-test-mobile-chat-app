import React from 'react';
import { ThemedView, ThemedText } from '@/design_system/components/atoms';
import { colors } from '@/design_system/ui/tokens';

import { styles } from './Badge.styles';

interface BadgeProps {
  count?: number;
  dot?: boolean;
  color?: string;
}

export function Badge({ count, dot, color = colors.error.main }: BadgeProps) {
  if (!count && !dot) return null;

  return (
    <ThemedView style={[styles.container, { backgroundColor: color }]}>
      {!dot && count && (
        <ThemedText style={styles.text}>
          {count > 99 ? '99+' : count}
        </ThemedText>
      )}
    </ThemedView>
  );
}