import React from 'react';
import { Modal, Pressable, Animated } from 'react-native';
import { styles } from './OptionsMenu.styles';
import { useOptionsMenu } from '@/hooks/useOptionsMenu';
import { OptionButton } from '@/design_system/components/molecules/OptionButton';

interface OptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddEmoji: () => void;
  position?: { top: number; left: number; width: number };
}

export const OptionsMenu: React.FC<OptionsMenuProps> = ({ visible, onClose, onEdit, onDelete, onAddEmoji, position }) => {
  const { getAdjustedPosition } = useOptionsMenu(visible, position);

  if (!visible || !position) return null;

  const animatedPosition = getAdjustedPosition();
  if (!animatedPosition) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Animated.View style={[styles.optionsContainer, animatedPosition]}>
          <OptionButton icon="create-outline" text="Editar" onPress={() => { onEdit(); onClose(); }} />
          <OptionButton icon="happy-outline" text="Añadir Emoji" onPress={() => { onAddEmoji(); onClose(); }} />
          <OptionButton icon="trash-outline" text="Eliminar" onPress={() => { onDelete(); onClose(); }} color="red" />
          <OptionButton icon="close-outline" text="Cancelar" onPress={onClose} />
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default OptionsMenu;
