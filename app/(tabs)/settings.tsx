import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DatabaseReset } from '../../app/DatabaseReset';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function SettingsScreen() {
  return (
    <View style={[styles.container, { backgroundColor: useThemeColor({}, 'background') }]}>
      <DatabaseReset />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 