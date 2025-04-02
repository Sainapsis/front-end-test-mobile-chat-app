import { PropsWithChildren, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { ThemedText, ThemedView } from '@/design_system/components/atoms';
import { IconSymbol } from '@/design_system/ui/vendors';
import { themes as Colors } from '@/design_system/ui/tokens/colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { styles } from './Collapsible.styles';

interface CollapsibleProps {
  /** Title of the collapsible section */
  title: string;
}

/**
 * Collapsible component provides a toggleable section that can be expanded or collapsed.
 * It includes a title and an icon that indicates the current state (open or closed).
 */
export function Collapsible({ children, title }: PropsWithChildren<CollapsibleProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  return (
    <ThemedView>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={theme === 'light' ? Colors.light.icon.default : Colors.dark.icon.default}
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />

        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>
      {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
    </ThemedView>
  );
}
