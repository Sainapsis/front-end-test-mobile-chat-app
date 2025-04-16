import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from './Skeleton';

export function ChatListSkeleton() {
  return (
    <View style={styles.container}>
      {[...Array(5)].map((_, index) => (
        <View key={index} style={styles.chatItem}>
          <Skeleton width={50} height={50} borderRadius={25} />
          <View style={styles.content}>
            <View style={styles.header}>
              <Skeleton width={120} height={20} />
              <Skeleton width={60} height={16} />
            </View>
            <View style={styles.message}>
              <Skeleton width={200} height={16} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E1E1E1',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  message: {
    marginTop: 4,
  },
}); 