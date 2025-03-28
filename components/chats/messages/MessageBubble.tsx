import React, { useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { ThemedText } from '@/components/ui/text/ThemedText';
import { Message } from '@/hooks/chats/useChats';
import { useColorScheme } from '@/hooks/themes/useColorScheme';
import { Avatar } from '@/components/ui/user/Avatar';
import { IconSymbol } from '@/components/ui/icons/IconSymbol';
import { Colors } from '@/components/ui/themes/Colors';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useAppContext } from '@/hooks/AppContext';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  isReaded: boolean;
  onSwapMessage: (message: Message) => void;
}

export function MessageBubble({ message, isCurrentUser, isReaded, onSwapMessage }: MessageBubbleProps) {
  const { currentUser } = useAppContext()
  const colorScheme = useColorScheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const isDark = colorScheme === 'dark';
  const threshold = 100;


  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  const onGestureEvent = (event: any) => {
    const { translationX, translationY } = event.nativeEvent;
    if (Math.abs(translationY) < 15 && translationX > 0) {
      translateX.setValue(translationX);
    }
  };


  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const translation = event.nativeEvent.translationX;

      if (translation > threshold) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onSwapMessage(message)
      }

      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  };
  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      activeOffsetX={10}
      failOffsetY={[-15, 15]}
    >
      <Animated.View style={[{ transform: [{ translateX }] }]}>
        <View style={styles.chatContainer}>
          <View style={styles.timeContainer}>
            <ThemedText style={[styles.timeText, isCurrentUser
              ? [styles.selfContainer]
              : [styles.otherContainer, styles.otherText]]}>
              {isCurrentUser ? '' : message.senderName + ' '}{formatTime(message.timestamp)}
              {message.readed ?
                <IconSymbol name="checkmark" color="#808080" size={12}></IconSymbol> : <></>
              }
            </ThemedText>
          </View>
          <View style={[
            styles.container,
            isCurrentUser ? styles.selfContainer : styles.otherContainer
          ]}>
            <View style={styles.bubbleContainer}>
              <View style={styles.avatar}>
                {isCurrentUser ? <></> : <Avatar userName={message.senderName} size={30} status={"online"}></Avatar>}
              </View>
              <View style={[
                styles.bubble,
                isCurrentUser
                  ? [{ backgroundColor: isDark ? Colors.dark.chatBubble.backgroundSelf : Colors.light.chatBubble.backgroundSelf }]
                  : [{ backgroundColor: isDark ? Colors.dark.chatBubble.backgroundOther : Colors.light.chatBubble.backgroundOther }]
              ]}>
                {message.responseId &&
                  <View style={[styles.response, { backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(61,99,201,0.1)', borderColor: isDark ? '#FFF' : Colors.light.chatBubble.responseBorder }]}>
                    <ThemedText style={[
                      styles.messageText,
                      styles.responseTitle
                    ]}>{currentUser?.name === message.responseTo ? 'You' : message.responseTo}</ThemedText>
                    <ThemedText style={[
                      styles.messageText,
                      isCurrentUser && !isDark && styles.selfMessageText
                    ]}
                    >{message.responseText}</ThemedText>
                  </View>
                }
                <ThemedText style={[
                  styles.messageText,
                  isCurrentUser && !isDark && styles.selfMessageText
                ]}>
                  {message.text}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  chatContainer: {
    marginBottom: 10,
  },
  container: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  selfContainer: {
    alignSelf: 'flex-end',
  },
  otherContainer: {
    alignSelf: 'flex-start',
  },
  otherText: {
    marginLeft: 45,
  },
  bubble: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 1,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1
  },
  bubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 18,
  },
  selfMessageText: {
    color: '#000000',
  },
  timeContainer: {
    flexDirection: 'column',
    marginTop: 2,
  },
  timeText: {
    fontSize: 11,
    opacity: 0.7,
    lineHeight: 11,
    alignItems: 'center',
  },
  avatar: {
    marginRight: 5
  },
  response: {
    width: 'auto',
    maxHeight: 80,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderLeftWidth: 5
  },
  responseTitle: {
    fontWeight: 600,
    marginBottom: 5,
  }
}); 