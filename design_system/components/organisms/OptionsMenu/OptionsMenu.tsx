import React from 'react';
import { Modal, Pressable, Animated } from 'react-native';
import { styles as createStyles} from './OptionsMenu.styles';
import { useOptionsMenu } from '@/hooks/useOptionsMenu';
import { OptionButton } from '@/design_system/components/molecules/OptionButton';
import { useTheme } from '@/context/ThemeContext';
import { colors } from '@/design_system/ui/tokens';

interface OptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddEmoji: () => void;
  position?: { top: number; left: number; width: number };
}

export const OptionsMenu: React.FC<OptionsMenuProps> = ({ visible, onClose, onEdit, onDelete, onAddEmoji, position }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { getAdjustedPosition } = useOptionsMenu(visible, position);

  if (!visible || !position) return null;

  const animatedPosition = getAdjustedPosition();
  if (!animatedPosition) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Animated.View style={[styles.optionsContainer, animatedPosition]}>
          <OptionButton icon="create-outline" text="Editar" onPress={() => { onEdit(); onClose(); }} color={theme!='dark'?colors.neutral[100]:colors.primary.darker}  />
          <OptionButton icon="happy-outline" text="Añadir Emoji" onPress={() => { onAddEmoji(); onClose(); }}  color={theme!='dark'?colors.neutral[100]:colors.primary.darker} />
          <OptionButton icon="trash-outline" text="Eliminar" onPress={() => { onDelete(); onClose(); }} color={colors.error.dark} />
          <OptionButton icon="close-outline" text="Cancelar" onPress={onClose} color={theme!='dark'?colors.neutral[100]:colors.primary.darker}  />
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default OptionsMenu;
