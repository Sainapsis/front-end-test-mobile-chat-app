import React from 'react';
import { StyleSheet, SafeAreaView, Pressable, Keyboard, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import LoginForm from '@/components/login/LoginForm';
import { ThemedView } from '@/components/ui/layout/ThemedView';

export default function LoginScreen() {

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      <Pressable onPress={Keyboard.dismiss}>
        <ThemedView style={styles.loginContainer}>
          <ThemedView style={styles.header}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.image}
              resizeMode="cover"
            />
          </ThemedView>
          {/* <LoginList></LoginList> */}
          <LoginForm></LoginForm>
        </ThemedView>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  loginContainer: {
    justifyContent: 'center',
    height: '100%'
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: 125,
    height: 125,
  },
}); 