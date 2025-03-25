import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, Pressable, Modal, View, useColorScheme } from 'react-native';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ChatListItem } from '@/components/ChatListItem';
import { UserListItem } from '@/components/UserListItem';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { GroupChatModal } from '@/components/GroupChatModal';
import { ChatItemSkeleton, UserItemSkeleton } from '@/components/SkeletonLoader';
import { log, monitoring, startMeasure, endMeasure } from '@/utils';
import { Colors } from '@/constants/Colors';
import { EmptyStateView } from '@/components/EmptyStateView';

export default function ChatsScreen() {
  const { currentUser, users, chats, createChat } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupChatModalVisible, setGroupChatModalVisible] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  // Simular tiempo de carga inicial
  useEffect(() => {
    const screenLoadMetric = startMeasure('chats_screen_load');
    log.info('Chats screen loaded');

    const loadTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => {
      clearTimeout(loadTimer);
      const metric = endMeasure(screenLoadMetric);
      log.debug(`Chats screen session duration: ${metric?.duration?.toFixed(2) || '?'}ms`);
    };
  }, []);

  // Monitorear datos cargados
  useEffect(() => {
    if (users.length > 0 && chats.length > 0) {
      log.info(`ChatsScreen data: ${users.length} users, ${chats.length} chats`);
    }
  }, [users.length, chats.length]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    log.debug('Chat list manual refresh triggered');

    // Simular recarga de datos
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  const renderEmptyComponent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          {[...Array(5)].map((_, index) => (
            <ChatItemSkeleton key={index} />
          ))}
        </View>
      );
    }

    return (
      <EmptyStateView
        type="chat"
        title="No tienes conversaciones"
        message="Inicia una nueva conversación pulsando el botón + en la esquina superior derecha"
        actionText="Nuevo Chat"
        onAction={handleAddChatPress}
      />
    );
  };

  const toggleUserSelection = (userId: string) => {
    try {
      if (selectedUsers.includes(userId)) {
        log.debug(`User deselected: ${userId}`);
        setSelectedUsers(selectedUsers.filter(id => id !== userId));
      } else {
        log.debug(`User selected: ${userId}`);
        setSelectedUsers([...selectedUsers, userId]);
      }
    } catch (error) {
      monitoring.captureError(
        error instanceof Error ? error : new Error(String(error)),
        { context: 'user_selection', userId }
      );
    }
  };

  const handleCreateChat = async () => {
    if (currentUser && selectedUsers.length > 0) {
      const metricId = startMeasure('create_chat_flow');
      try {
        log.info(`Creating chat with participants: ${selectedUsers.join(', ')}`);
        const participants = [currentUser.id, ...selectedUsers];
        const result = await createChat(participants);
        log.debug(`Chat created: ${result?.id || 'failed'}`);

        setModalVisible(false);
        setSelectedUsers([]);
      } catch (error) {
        const errorId = monitoring.captureError(
          error instanceof Error ? error : new Error(String(error)),
          { context: 'create_chat', participants: selectedUsers.length }
        );
        log.error(`Failed to create chat [errorId: ${errorId}]`);
      } finally {
        endMeasure(metricId);
      }
    }
  };

  const handleAddChatPress = () => {
    log.info('Open new chat modal');
    // Mostrar opciones: chat individual o grupal
    setIsCreatingGroup(false);
    setModalVisible(true);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Chats</ThemedText>
        <View style={styles.headerButtons}>
          <Pressable
            style={[
              styles.newGroupButton,
              { backgroundColor: colorScheme === 'dark' ? 'rgba(109, 152, 217, 0.2)' : 'rgba(74, 111, 165, 0.1)' }
            ]}
            onPress={() => {
              log.info('Open group chat modal');
              setGroupChatModalVisible(true);
            }}
          >
            <IconSymbol name="people" size={24} color={theme.primary} />
          </Pressable>
          <Pressable
            style={[
              styles.newChatButton,
              { backgroundColor: colorScheme === 'dark' ? 'rgba(109, 152, 217, 0.2)' : 'rgba(74, 111, 165, 0.1)' }
            ]}
            onPress={handleAddChatPress}
          >
            <IconSymbol name="add" size={24} color={theme.primary} />
          </Pressable>
        </View>
      </ThemedView>

      <FlatList
        data={isLoading ? [] : chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatListItem
            chat={item}
            currentUserId={currentUser?.id || ''}
            users={users}
          />
        )}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.listContainer}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        onScrollBeginDrag={() => startMeasure('chat_list_scroll')}
        onScrollEndDrag={() => {
          const metric = endMeasure('chat_list_scroll');
          log.debug(`Chat list scroll: ${metric?.duration?.toFixed(2) || '?'}ms`);
        }}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          log.info('Closing new chat modal via back button');
          setModalVisible(false);
          setSelectedUsers([]);
        }}
      >
        <ThemedView
          style={styles.modalContainer}
          darkBackgroundColor="rgba(0,0,0,0.75)"
          lightBackgroundColor="rgba(0,0,0,0.4)"
        >
          <ThemedView
            style={
              colorScheme === 'dark'
                ? { ...styles.modalContent, ...styles.modalContentDark }
                : styles.modalContent
            }
            darkBackgroundColor={theme.modalContent}
            lightBackgroundColor={theme.modalContent}
          >
            <ThemedView
              style={styles.modalHeader}
              darkBackgroundColor="transparent"
              lightBackgroundColor="transparent"
            >
              <ThemedText type="subtitle">Nuevo Chat</ThemedText>
              <Pressable onPress={() => {
                setModalVisible(false);
                setSelectedUsers([]);
              }}>
                <IconSymbol name="close" size={24} color={theme.primary} />
              </Pressable>
            </ThemedView>

            <ThemedText style={styles.modalSubtitle}>
              Selecciona un usuario para chatear
            </ThemedText>

            <FlatList
              data={users.filter(user => user.id !== currentUser?.id)}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={() => (
                <View style={styles.loadingContainer}>
                  {[...Array(5)].map((_, index) => (
                    <UserItemSkeleton key={index} />
                  ))}
                </View>
              )}
              renderItem={({ item }) => (
                <UserListItem
                  user={item}
                  onSelect={() => {
                    toggleUserSelection(item.id);
                    if (!isCreatingGroup) {
                      const participants = [currentUser?.id || '', item.id];
                      createChat(participants);
                      setModalVisible(false);
                      setSelectedUsers([]);
                    }
                  }}
                  isSelected={selectedUsers.includes(item.id)}
                />
              )}
              style={styles.userList}
            />

            {isCreatingGroup && (
              <Pressable
                style={[
                  styles.createButton,
                  selectedUsers.length === 0 && styles.disabledButton,
                  { backgroundColor: selectedUsers.length === 0 ? theme.buttonDisabled : theme.buttonBackground }
                ]}
                onPress={handleCreateChat}
                disabled={selectedUsers.length === 0}
              >
                <ThemedText style={{ color: theme.buttonText, fontWeight: 'bold' }}>
                  Crear Chat
                </ThemedText>
              </Pressable>
            )}
          </ThemedView>
        </ThemedView>
      </Modal>

      <GroupChatModal
        visible={groupChatModalVisible}
        onClose={() => {
          log.info('Closing group chat modal');
          setGroupChatModalVisible(false);
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  newGroupButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  listContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContentDark: {
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalSubtitle: {
    marginBottom: 10,
  },
  userList: {
    maxHeight: 400,
  },
  createButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    paddingTop: 12,
  },
});
