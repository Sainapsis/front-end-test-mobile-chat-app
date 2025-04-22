import { getAvatarStyles } from '@/design_system/components/organisms/Avatar/Avatar.styles';
import { useColorScheme } from '@/hooks/useColorScheme';
import { User } from '@/types/User';

/**
 * Generates a color based on an identifier string
 * @param identifier - String to generate color from
 * @returns Hexadecimal color string
 */
const getAvatarColor = (identifier?: string): string => {
  const theme = useColorScheme() ?? 'light';
  const colorInit = theme === 'light' ? '00' : 'FF';
  if (!identifier) return '#CACACA';

  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += (colorInit + value.toString(16)).substr(-2);
  }

  return color;
};

/**
 * Extracts initials from a name string
 * @param name - Full name string
 * @returns Initials string
 */
const getInitials = (name?: string): string => {
  if (!name) return '?';

  const parts = name.split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Custom hook for generating avatar styles and properties
 * @param user - User object containing id and name
 * @param size - Size of the avatar in pixels
 * @returns Object containing avatar properties and styles
 */
export function useAvatar(user?: User, size: number = 40) {
  const backgroundColor = getAvatarColor(user?.id || user?.name);
  const initials = getInitials(user?.name);
  const dynamicStyles = getAvatarStyles(size, backgroundColor, user?.status);

  return { backgroundColor, initials, dynamicStyles };
}