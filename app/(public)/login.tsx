import React, { useEffect, useState } from 'react';
import { StyleSheet, SafeAreaView, Pressable, Keyboard, Image, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import LoginForm from '@/components/login/LoginForm';
import { ThemedView } from '@/components/ui/layout/ThemedView';
import LoginList from '@/components/login/LoginList';
import { useAppContext } from '@/hooks/AppContext';
import LoginProfile from '@/components/login/LoginProfile';
import { Avatar } from '@/components/ui/user/Avatar';
import { ThemedText } from '@/components/ui/text/ThemedText';

export default function LoginScreen() {
  const [currentView, setCurrentView] = useState("form")
  const { users } = useAppContext();
  const colorScheme = useColorScheme();
  useEffect(() => {
    switch (users.length) {
      case 0:
        setCurrentView("form");
        break;
      case 1:
        setCurrentView("profile");
        break;
      default:
        setCurrentView("list");
        break;
    }
  }, [])
  const handleSwitchAccountPress = () => {
    if (currentView === "profile") {
      if(users.length === 1){
        setCurrentView("form");
      }else{
        setCurrentView("list");
      }
    }else if(currentView === "list"){
      setCurrentView("form");
    }
  }
  return (
    <SafeAreaView style={[{ backgroundColor: colorScheme === 'dark' ? '#121212' : '#FFF' }]}>
      <StatusBar style="auto" />
      <Pressable onPress={Keyboard.dismiss}>
        <ThemedView style={styles.loginContainer}>
          <ThemedView style={styles.header}>
            {currentView !== 'profile' ?
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
                <Avatar userName={users[0].name} size={100} showStatus={false} />
              </ThemedView>
            }

          </ThemedView>
          {
            currentView === 'form' ?
              <LoginForm></LoginForm> :
              currentView === "profile" ?
                <LoginProfile handleSwitchProfile={handleSwitchAccountPress}></LoginProfile> :
                <LoginList handleSwitchProfile={handleSwitchAccountPress}></LoginList>
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