import React from 'react';
import { Link, Stack } from 'expo-router';
import { ThemedText, ThemedView } from '@/design_system/components/atoms';
import { styles } from './NotFoundTemplate.styles';

interface NotFoundTemplateProps {
  /** Title to display in the template */
  title: string;
  /** Text for the navigation link */
  linkText: string;
  /** Destination for the navigation link */
  linkHref: string;
}

/**
 * NotFoundTemplate component provides a layout for 404 or not found pages.
 * It includes a title and a navigation link to redirect users.
 */
export const NotFoundTemplate: React.FC<NotFoundTemplateProps> = ({
  title,
  linkText,
  linkHref,
}) => {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">{title}</ThemedText>
        <Link href={linkHref as `/ChatRoom` | `/login` | `/search`} style={styles.link}>
          <ThemedText type="link">{linkText}</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
};

export default NotFoundTemplate;