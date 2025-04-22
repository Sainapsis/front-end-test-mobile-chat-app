import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/common/ThemedText';

export interface AvatarProps {
  size?: number;
  uri?: string;
  fallback?: string;
}

export function Avatar({ size = 40, uri, fallback = '?' }: AvatarProps) {
  const styles = StyleSheet.create({
    container: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: '#E1E1E1',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    image: {
      width: size,
      height: size,
    },
    fallback: {
      fontSize: size * 0.5,
      color: '#666',
    },
  });

  if (!uri) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.fallback}>{fallback}</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri }}
        style={styles.image}
      />
    </View>
  );
} 
