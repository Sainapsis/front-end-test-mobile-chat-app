import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from './Skeleton';

export function ChatRoomSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Skeleton width={32} height={32} borderRadius={16} />
        <Skeleton width={120} height={20} />
      </View>
      <View style={styles.messages}>
        {[...Array(10)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.message,
              index % 2 === 0 ? styles.messageRight : styles.messageLeft,
            ]}
          >
            <Skeleton
              width={Math.random() * 200 + 100}
              height={40}
              borderRadius={20}
            />
          </View>
        ))}
      </View>
      <View style={styles.inputContainer}>
        <Skeleton width="80%" height={40} borderRadius={20} />
        <Skeleton width={40} height={40} borderRadius={20} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 10,
  },
  messages: {
    flex: 1,
    padding: 10,
  },
  message: {
    marginVertical: 5,
    maxWidth: '80%',
  },
  messageLeft: {
    alignSelf: 'flex-start',
  },
  messageRight: {
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E1E1E1',
  },
}); 