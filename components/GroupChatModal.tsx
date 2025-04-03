import React, { useState } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    Pressable,
    Modal,
    FlatList,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';
import { Avatar } from './Avatar';

interface GroupChatModalProps {
    readonly visible: boolean;
    readonly onClose: () => void;
}

export function GroupChatModal({
    visible,
    onClose
}: GroupChatModalProps) {
    const { currentUser, users, createChat } = useAppContext();
    const [groupName, setGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState('');

    const toggleUserSelection = (userId: string) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleCreateGroup = () => {
        if (!currentUser) return;

        if (groupName.trim() === '') {
            setErrorMessage('Por favor, introduce un nombre para el grupo');
            return;
        }

        if (selectedUsers.length < 2) {
            setErrorMessage('Por favor, selecciona al menos 2 participantes');
            return;
        }

        // Añadir al usuario actual al grupo
        const participants = [currentUser.id, ...selectedUsers];

        // Crear el chat con el nombre del grupo
        createChat(participants, groupName);

        // Cerrar el modal y resetear los estados
        handleClose();
    };

    const handleClose = () => {
        setGroupName('');
        setSelectedUsers([]);
        setErrorMessage('');
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}
        >
            <ThemedView style={styles.modalContainer}>
                <ThemedView style={styles.modalContent}>
                    <ThemedView style={styles.modalHeader}>
                        <ThemedText type="subtitle">Nuevo Grupo</ThemedText>
                        <Pressable onPress={handleClose}>
                            <IconSymbol name="close" size={24} color="#007AFF" />
                        </Pressable>
                    </ThemedView>

                    <View style={styles.groupNameContainer}>
                        <ThemedText style={styles.label}>Nombre del grupo:</ThemedText>
                        <TextInput
                            style={styles.groupNameInput}
                            value={groupName}
                            onChangeText={setGroupName}
                            placeholder="Ej: Amigos, Familia, Trabajo..."
                            placeholderTextColor="#AAAAAA"
                        />
                    </View>

                    <ThemedText style={styles.label}>
                        Selecciona participantes ({selectedUsers.length})
                    </ThemedText>

                    {selectedUsers.length > 0 && (
                        <ScrollView
                            horizontal
                            style={styles.selectedUsersContainer}
                            showsHorizontalScrollIndicator={false}
                        >
                            {selectedUsers.map(userId => {
                                const user = users.find(u => u.id === userId);
                                return (
                                    <View key={userId} style={styles.selectedUserItem}>
                                        <Avatar user={user} size={40} />
                                        <ThemedText style={styles.selectedUserName} numberOfLines={1}>
                                            {user?.name ?? 'Usuario'}
                                        </ThemedText>
                                        <TouchableOpacity
                                            style={styles.removeUserButton}
                                            onPress={() => toggleUserSelection(userId)}
                                        >
                                            <IconSymbol name="close" size={16} color="#FF3B30" />
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    )}

                    <FlatList
                        data={users.filter(user => user.id !== currentUser?.id)}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.userItem,
                                    selectedUsers.includes(item.id) && styles.selectedUserRow
                                ]}
                                onPress={() => toggleUserSelection(item.id)}
                            >
                                <Avatar user={item} size={40} />
                                <ThemedText style={styles.userName}>{item.name}</ThemedText>
                                <View style={styles.checkboxContainer}>
                                    {selectedUsers.includes(item.id) && (
                                        <IconSymbol name="check" size={24} color="#007AFF" />
                                    )}
                                </View>
                            </TouchableOpacity>
                        )}
                        style={styles.userList}
                    />

                    {errorMessage !== '' && (
                        <ThemedText style={styles.errorMessage}>{errorMessage}</ThemedText>
                    )}

                    <Pressable
                        style={[
                            styles.createButton,
                            (selectedUsers.length < 2 || groupName.trim() === '') && styles.disabledButton
                        ]}
                        onPress={handleCreateGroup}
                        disabled={selectedUsers.length < 2 || groupName.trim() === ''}
                    >
                        <ThemedText style={styles.createButtonText}>
                            Crear Grupo
                        </ThemedText>
                    </Pressable>
                </ThemedView>
            </ThemedView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        maxHeight: '90%',
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
    groupNameContainer: {
        marginBottom: 15,
    },
    label: {
        marginBottom: 8,
        fontWeight: '500',
    },
    groupNameInput: {
        borderWidth: 1,
        borderColor: '#E1E1E1',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        backgroundColor: '#F8F8F8',
        color: '#000000',
    },
    userList: {
        maxHeight: 300,
        marginTop: 10,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E1E1E1',
    },
    selectedUserRow: {
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
    },
    userName: {
        marginLeft: 12,
        flex: 1,
    },
    checkboxContainer: {
        width: 30,
        alignItems: 'center',
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
    selectedUsersContainer: {
        flexDirection: 'row',
        marginBottom: 15,
        maxHeight: 80,
    },
    selectedUserItem: {
        alignItems: 'center',
        marginRight: 15,
        position: 'relative',
        width: 60,
    },
    selectedUserName: {
        fontSize: 12,
        marginTop: 4,
        textAlign: 'center',
        width: '100%',
    },
    removeUserButton: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E1E1E1',
    },
    errorMessage: {
        color: '#FF3B30',
        marginTop: 10,
        fontSize: 14,
    },
}); 