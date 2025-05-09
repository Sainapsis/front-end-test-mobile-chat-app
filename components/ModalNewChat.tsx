import { FlatList, Modal, Pressable, StyleSheet } from 'react-native';
import { ThemedView } from './ThemedView';
import { TextType, ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';
import { ThemeColors } from '@/constants/Colors';
import { UserListItem } from './UserListItem';
import { User } from '@/hooks/useUser';

interface ModalNewChatProps {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedUsers: React.Dispatch<React.SetStateAction<string[]>>;
  users: User[];
  currentUser: User | null;
  toggleUserSelection: (userId: string) => void;
  selectedUsers: string[];
  handleCreateChat: () => void;
}

export default function ModalNewChat({modalVisible, setModalVisible, setSelectedUsers, users, currentUser, toggleUserSelection, selectedUsers, handleCreateChat}: ModalNewChatProps) {
    return <Modal
    animationType="slide"
    transparent={true}
    visible={modalVisible}
    onRequestClose={() => {
      setModalVisible(false);
      setSelectedUsers([]);
    } }

  >
    <ThemedView style={styles.modalContainer}>
      <ThemedView style={styles.modalContent}>
        <ThemedView style={styles.modalHeader}>
          <ThemedText type={TextType.SUBTITLE}>New Chat</ThemedText>
          <Pressable onPress={() => {
            setModalVisible(false);
            setSelectedUsers([]);
          } }>
            <IconSymbol name="xmark" size={24} color={ThemeColors.blue} />
          </Pressable>
        </ThemedView>

        <ThemedText style={styles.modalSubtitle}>
          Select users to chat with
        </ThemedText>

        <FlatList
          data={users.filter(user => user.id !== currentUser?.id)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <UserListItem
              user={item}
              onSelect={() => toggleUserSelection(item.id)}
              isSelected={selectedUsers.includes(item.id)} />
          )}
          style={styles.userList} />

        <Pressable
          style={[
            styles.createButton,
            selectedUsers.length === 0 && styles.disabledButton
          ]}
          onPress={handleCreateChat}
          disabled={selectedUsers.length === 0}
        >
          <ThemedText style={styles.createButtonText}>
            Create Chat
          </ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  </Modal>;
}
  
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0000007f',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: ThemeColors.black,
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
    backgroundColor: ThemeColors.blue,
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
});