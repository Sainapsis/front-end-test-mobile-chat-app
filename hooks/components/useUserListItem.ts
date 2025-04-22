import { User } from "@/types/User";

interface UseUserListItemProps {
  user: User;
  onSelect?: (user: User) => void;
}

/**
 * Custom hook for handling user list item interactions
 * @param user - User object containing user information
 * @param onSelect - Callback function for when the user is selected
 * @returns Object containing press handler
 */
export function useUserListItem({ user, onSelect }: UseUserListItemProps) {
  /**
   * Handles press event on user list item
   */
  const handlePress = () => {
    if (onSelect) {
      onSelect(user);
    }
  };

  return { handlePress };
}