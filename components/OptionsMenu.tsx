import React from 'react';
import { Modal, View, TouchableOpacity, ViewStyle } from 'react-native';
import { ThemedText } from '@/design_system/components/atoms';

interface OptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const OptionsMenu: React.FC<OptionsMenuProps> = ({ visible, onClose, onEdit, onDelete }) => (
  <Modal
    transparent={true}
    visible={visible}
    animationType="fade"
    onRequestClose={onClose}
  >
    <TouchableOpacity style={styles.modalOverlay as ViewStyle} onPress={onClose}>
      <View style={styles.optionsContainer as ViewStyle}>
        <TouchableOpacity onPress={() => { onEdit(); onClose(); }}>
          <ThemedText>Edit</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { onDelete(); onClose(); }}>
          <ThemedText style={{ color: 'red' }}>Delete</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose}>
          <ThemedText>Cancel</ThemedText>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  </Modal>
);

const styles = {
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  optionsContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: 200,
    alignItems: 'center',
  },
};