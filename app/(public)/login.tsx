import React from 'react';
import { StyleSheet, SafeAreaView, Pressable, Keyboard, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import LoginForm from '@/components/login/LoginForm';
import { ThemedView } from '@/components/ui/layout/ThemedView';
import LoginList from '@/components/login/LoginList';
import { useAppContext } from '@/hooks/AppContext';
import LoginProfile from '@/components/login/LoginProfile';
import { Avatar } from '@/components/ui/user/Avatar';
import { ThemedText } from '@/components/ui/text/ThemedText';

export default function LoginScreen() {
  const { users } = useAppContext();
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      <Pressable onPress={Keyboard.dismiss}>
        <ThemedView style={styles.loginContainer}>
          <ThemedView style={styles.header}>
            {users.length !== 1 ?
              <Image
                source={require('@/assets/images/logo.png')}
                style={styles.image}
                resizeMode="cover"
              />
              :
              <ThemedView style={styles.profileHeader}>
                <ThemedView style={styles.profileInfo}>
                  {/* Display the user's name */}
                  <ThemedText type="title">{users[0].name}</ThemedText>
                </ThemedView>
                <Avatar user={users[0]} size={100} showStatus={false} />
              </ThemedView>
            }

          </ThemedView>
          {
            users.length === 0 ?
              <LoginForm></LoginForm> :
              users.length === 1 ?
                <LoginProfile></LoginProfile> :
                <LoginList></LoginList>
          }

          {/* */}
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
  profileHeader: {
    alignItems: 'center',
    padding: 20,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 10,
  },
}); 