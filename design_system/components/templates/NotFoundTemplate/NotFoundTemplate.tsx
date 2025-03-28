import React from 'react';
import { Link, Stack } from 'expo-router';
import { ThemedText, ThemedView } from '@/design_system/components/atoms';
import { styles } from './NotFoundTemplate.styles';

interface NotFoundTemplateProps {
  title: string;
  linkText: string;
  linkHref: string;
}

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