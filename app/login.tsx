import React from 'react';
import { StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { UserListItem } from '@/components/UserListItem';

export default function LoginScreen() {
  const { users, login } = useAppContext();
  const router = useRouter();

  const handleUserSelect = (userId: string) => {
    if (login(userId)) {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Welcome to Chat App</ThemedText>
          <ThemedText style={styles.subtitle}>
            Select a user to continue
          </ThemedText>
        </ThemedView>

        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <UserListItem
              user={item}
              onSelect={() => handleUserSelect(item.id)}
            />
          )}
          contentContainerStyle={styles.listContainer}

          // Performance optimizations
          windowSize={5}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={true}
          initialNumToRender={10}

          // Estimate each user row height to be about 60 points
          getItemLayout={(data, index) => ({
            length: 60,
            offset: 60 * index,
            index,
          })}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: '#8F8F8F',
  },
  listContainer: {
    paddingBottom: 20,
  },
}); 