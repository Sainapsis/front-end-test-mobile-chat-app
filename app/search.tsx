import React, { useState } from 'react';
import { View, StyleSheet, TextInput, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAppContext } from '@/context/AppContext';
import { ThemedText, ThemedView } from '@/design_system/components/atoms';
import { MessageBubble } from '@/design_system/components/molecules';
import { IconSymbol } from '@/design_system/ui/vendors';
import { useMessageSearch } from '@/hooks/useMessageSearch';
import { spacing, colors } from '@/design_system/ui/tokens';

export default function SearchScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useAppContext();
  const { searchResults, isSearching, error, handleSearch } = useMessageSearch();
  const router = useRouter();

  const handleSearchInput = (text: string) => {
    setSearchTerm(text);
    if (currentUser?.id) {
      handleSearch(text, currentUser.id);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      <Stack.Screen
        options={{
          headerTitle: 'Search Messages',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
              <IconSymbol name="chevron.left" size={24} color={colors.primary[500]} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchTerm}
          onChangeText={handleSearchInput}
          placeholder="Search messages..."
          placeholderTextColor={colors.neutral[400]}
        />
      </View>

      {isSearching && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      )}

      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.resultItem} 
            onPress={() => router.push({
              pathname: "/ChatRoom",
              params: { chatId: item.chat_id }
            })}
          >
            <View style={styles.messageHeader}>
              <View style={styles.headerLeft}>
                <IconSymbol 
                  name="chevron.right" 
                  size={16} 
                  color={colors.neutral[400]} 
                />
                <ThemedText style={styles.chatName}>
                  Chat with {item.participant_names?.split(',').find((name: string) => name !== currentUser?.name)?.trim()}
                </ThemedText>
              </View>
              <ThemedText style={styles.timestamp}>
                {new Date(item.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </ThemedText>
            </View>
            <MessageBubble
              message={item}
              isCurrentUser={item.sender_id === currentUser?.id}
              userId={currentUser?.id || ''}
            />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.resultsContainer}
        ListEmptyComponent={() => (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText>
              {searchTerm ? 'No messages found' : 'Start typing to search messages'}
            </ThemedText>
          </ThemedView>
        )}
      />
    </ThemedView>
  );
}

// Agregar estos nuevos estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconButton: {
    padding: spacing.sm, // Espaciado para hacer más fácil el clic
  },
  searchContainer: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  searchInput: {
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.md,
    fontSize: 16,
  },
  loadingContainer: {
    padding: spacing.md,
    alignItems: 'center',
  },
  errorContainer: {
    padding: spacing.md,
    backgroundColor: colors.error.light,
  },
  errorText: {
    color: colors.error.dark,
  },
  resultsContainer: {
    padding: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  resultItem: {
    marginBottom: spacing.md,
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    shadowColor: colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chatName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary[700],
    marginLeft: spacing.xs,
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: colors.neutral[500],
    marginLeft: spacing.sm,
  },
});

