import React, { useState, useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Pressable, Modal } from 'react-native';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ChatListItem } from '@/components/ChatListItem';
import { UserListItem } from '@/components/UserListItem';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { PerformanceMonitor } from '@/components/PerformanceMonitor';

// Componente del botón para generar chats de prueba
const BulkChatGenerator = React.memo(({ onGenerate }: { onGenerate: () => void }) => (
  <Pressable
    onPress={onGenerate}
    style={styles.bulkGeneratorButton}
  >
    <ThemedText style={styles.bulkGeneratorText}>Generar 50 chats</ThemedText>
  </Pressable>
));

export default function ChatsScreen() {
  const { currentUser, users, chats, createChat, sendMessage } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const toggleUserSelection = useCallback((userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  }, []);

  const handleCreateChat = useCallback(() => {
    if (currentUser && selectedUsers.length > 0) {
      const participants = [currentUser.id, ...selectedUsers];
      createChat(participants);
      setModalVisible(false);
      setSelectedUsers([]);
    }
  }, [currentUser, selectedUsers, createChat]);

  const renderEmptyComponent = useCallback(() => (
    <ThemedView style={styles.emptyContainer}>
      <ThemedText style={styles.emptyText}>No chats yet</ThemedText>
      <ThemedText>Tap the + button to start a new conversation</ThemedText>
    </ThemedView>
  ), []);

  const renderChatItem = useCallback(({ item }: { item: any }) => (
    <ChatListItem
      chat={item}
      currentUserId={currentUser?.id || ''}
      users={users}
    />
  ), [currentUser?.id, users]);

  const keyExtractor = useCallback((item: any) => item.id, []);

  const renderUserItem = useCallback(({ item }: { item: any }) => (
    <UserListItem
      user={item}
      onSelect={() => toggleUserSelection(item.id)}
      isSelected={selectedUsers.includes(item.id)}
    />
  ), [toggleUserSelection, selectedUsers]);

  const userKeyExtractor = useCallback((item: any) => item.id, []);

  const filteredUsers = useMemo(() =>
    users.filter(user => user.id !== currentUser?.id),
    [users, currentUser?.id]
  );

  const createButtonStyle = useMemo(() => [
    styles.createButton,
    selectedUsers.length === 0 && styles.disabledButton
  ], [selectedUsers.length]);

  const toggleModal = useCallback(() => {
    setModalVisible(prev => !prev);
    if (modalVisible) {
      setSelectedUsers([]);
    }
  }, [modalVisible]);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedUsers([]);
  }, []);

  // Función para generar chats de prueba masivos
  const generateBulkChats = useCallback(async () => {
    if (!currentUser) return;

    // Mostrar feedback
    alert('Generando 50 chats de prueba...');

    // Obtener todos los usuarios disponibles excepto el actual
    const otherUsers = users.filter(user => user.id !== currentUser.id);

    if (otherUsers.length === 0) {
      alert('No hay otros usuarios disponibles para crear chats.');
      return;
    }

    // Generar chats con combinaciones aleatorias de usuarios
    for (let i = 0; i < 50; i++) {
      // Seleccionar entre 1 y 3 usuarios aleatorios para cada chat
      const numUsers = Math.floor(Math.random() * 3) + 1;
      const selectedUsers = [];

      // Asegurarse de no seleccionar el mismo usuario más de una vez
      const availableUsers = [...otherUsers];
      for (let j = 0; j < numUsers && availableUsers.length > 0; j++) {
        const randomIndex = Math.floor(Math.random() * availableUsers.length);
        selectedUsers.push(availableUsers[randomIndex].id);
        availableUsers.splice(randomIndex, 1);
      }

      // Crear el chat con el usuario actual y los seleccionados
      const participants = [currentUser.id, ...selectedUsers];

      try {
        // Pequeña pausa para no bloquear la UI
        await new Promise(resolve => setTimeout(resolve, 50));

        const newChat = await createChat(participants);

        // Generar algunos mensajes para este chat
        if (newChat) {
          const numMessages = Math.floor(Math.random() * 5) + 1;
          const messages = [
            "Hola, ¿cómo estás?",
            "¿Qué tal todo?",
            "Chat de prueba para rendimiento",
            "Mensaje de test",
            "¡Buen día!"
          ];

          for (let k = 0; k < numMessages; k++) {
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            const senderId = Math.random() > 0.5 ? currentUser.id : selectedUsers[0];

            await new Promise(resolve => setTimeout(resolve, 20));
            await sendMessage(newChat.id, `${randomMessage} (${i + 1}-${k + 1})`, senderId);
          }
        }
      } catch (error) {
        console.error("Error al crear chat de prueba:", error);
      }
    }

    alert('¡50 chats de prueba generados con éxito!');
  }, [currentUser, users, createChat, sendMessage]);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Chats</ThemedText>
        <Pressable
          style={styles.newChatButton}
          onPress={toggleModal}
        >
          <IconSymbol name="plus" size={24} color="#007AFF" />
        </Pressable>
      </ThemedView>

      {/* Performance Monitor integrado en el flujo normal */}
      <PerformanceMonitor
        initiallyVisible={true}
        screenName="chats-list"
        itemCount={chats.length}
        itemLabel="Chats"
      />

      <BulkChatGenerator onGenerate={generateBulkChats} />

      <FlatList
        data={chats}
        keyExtractor={keyExtractor}
        renderItem={renderChatItem}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.listContainer}

        // Performance optimizations
        windowSize={5}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
        initialNumToRender={10}

        // Estimate each chat row height to be about 76 points
        getItemLayout={(data, index) => ({
          length: 76,
          offset: 76 * index,
          index,
        })}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <ThemedView style={styles.modalContainer}>
          <ThemedView style={styles.modalContent}>
            <ThemedView style={styles.modalHeader}>
              <ThemedText type="subtitle">New Chat</ThemedText>
              <Pressable onPress={closeModal}>
                <IconSymbol name="xmark" size={24} color="#007AFF" />
              </Pressable>
            </ThemedView>

            <ThemedText style={styles.modalSubtitle}>
              Select users to chat with
            </ThemedText>

            <FlatList
              data={filteredUsers}
              keyExtractor={userKeyExtractor}
              renderItem={renderUserItem}
              style={styles.userList}

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

            <Pressable
              style={createButtonStyle}
              onPress={handleCreateChat}
              disabled={selectedUsers.length === 0}
            >
              <ThemedText style={styles.createButtonText}>
                Create Chat
              </ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      </Modal>
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
  newChatButton: {
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
  bulkGeneratorButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 8,
  },
  bulkGeneratorText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
