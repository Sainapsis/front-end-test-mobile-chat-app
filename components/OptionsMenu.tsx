import React, { useEffect, useRef } from 'react';
import { Modal, Pressable, View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface OptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddEmoji: () => void;
  position?: { top: number; left: number; width: number };
}

export const OptionsMenu: React.FC<OptionsMenuProps> = ({ visible, onClose, onEdit, onDelete, onAddEmoji, position }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity value

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible || !position) return null;

  const screenWidth = Dimensions.get('window').width;
  const menuWidth = 220;
  const padding = 10;

  const adjustedLeft = Math.min(position.left, screenWidth - menuWidth - padding);
  const adjustedTop = position.top + 10;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Animated.View style={[styles.optionsContainer, { top: adjustedTop, left: adjustedLeft, opacity: fadeAnim }]}>
          <OptionButton icon="create-outline" text="Editar" onPress={() => { onEdit(); onClose(); }} />
          <OptionButton icon="happy-outline" text="Añadir Emoji" onPress={() => { onAddEmoji(); onClose(); }} />
          <OptionButton icon="trash-outline" text="Eliminar" onPress={() => { onDelete(); onClose(); }} color="red" />
          <OptionButton icon="close-outline" text="Cancelar" onPress={onClose} />
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const OptionButton: React.FC<{ icon: string; text: string; onPress: () => void; color?: string }> = ({ icon, text, onPress, color = 'black' }) => (
  <Pressable style={styles.optionButton} onPress={onPress} android_ripple={{ color: '#ddd', borderless: false }}>
    <Ionicons name={icon} size={20} color={color} />
    <Text style={[styles.optionText, { color }]}>{text}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  optionsContainer: {
    position: 'absolute',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    width: 220,
    alignItems: 'flex-start',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    width: '100%',
    paddingHorizontal: 10,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
  },
});

export default OptionsMenu;
