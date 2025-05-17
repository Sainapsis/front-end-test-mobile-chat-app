import { Link, Stack } from 'expo-router';

import { TextType, ThemedText } from '@/src/presentation/components/ThemedText';
import { ThemedView } from '@/src/presentation/components/ThemedView';
import styles from './notFound.style';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedView style={styles.container}>
        <ThemedText type={TextType.TITLE}>This screen doesn't exist.</ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type={TextType.LINK}>Go to home screen!</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}


