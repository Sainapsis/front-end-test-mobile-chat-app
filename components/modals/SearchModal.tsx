import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Pressable, TextInput, FlatList, Modal, Animated } from 'react-native';
import { IconSymbol } from '../ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { MessageBubble } from '../MessageBubble';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  filteredMessages: Array<{
    id: string;
    text: string;
    senderId: string;
    reactions?: Record<string, string>;
  }>;
  currentUser: {
    id: string;
  } | null;
  selectedMessages: Array<{
    messageId: string;
    senderId: string;
  }>;
  onReactionPress?: (messageId: string, reaction: string) => void;
  onRemoveReaction?: (messageId: string) => void;
}

export default function SearchModal({
  visible,
  onClose,
  searchQuery,
  onSearchQueryChange,
  filteredMessages,
  currentUser,
  selectedMessages,
  onReactionPress,
  onRemoveReaction
}: SearchModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const modalAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(modalAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(contentAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(contentAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[
        styles.modalOverlay,
        {
          opacity: modalAnim,
          backgroundColor: `rgba(0, 0, 0, ${modalAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.7]
          })})`
        }
      ]}>
        <Animated.View style={[
          styles.modalContent,
          {
            transform: [
              { translateY: contentAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              })}
            ],
            backgroundColor: Colors[colorScheme].background,
            borderColor: Colors[colorScheme].icon,
            borderWidth: 1,
          }
        ]}>
          <View style={[
            styles.searchHeader,
            { borderBottomColor: Colors[colorScheme].icon }
          ]}>
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: Colors[colorScheme].background,
                  color: Colors[colorScheme].text,
                  borderColor: Colors[colorScheme].icon
                }
              ]}
              placeholder="Search messages..."
              placeholderTextColor={Colors[colorScheme].icon}
              value={searchQuery}
              onChangeText={onSearchQueryChange}
              autoFocus
            />
            <Pressable onPress={onClose}>
              <IconSymbol name="xmark" size={24} color={Colors[colorScheme].tint} />
            </Pressable>
          </View>

          <FlatList
            data={filteredMessages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MessageBubble
                message={item}
                isCurrentUser={item.senderId === currentUser?.id}
                onReactionPress={onReactionPress}
                onRemoveReaction={onRemoveReaction}
                selectedMessages={selectedMessages}
              />
            )}
            contentContainerStyle={styles.searchResultsContainer}
          />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  searchResultsContainer: {
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 