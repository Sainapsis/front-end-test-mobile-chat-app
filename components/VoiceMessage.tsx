import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Audio } from 'expo-av';
import { IconSymbol } from './ui/IconSymbol';
import { ThemedText } from './ThemedText';
import { useTheme } from '../hooks/theme/useTheme';
import * as Haptics from 'expo-haptics';

interface VoiceMessageProps {
  uri: string;
  duration: number;
  isOwnMessage: boolean;
}

export function VoiceMessage({ uri, duration, isOwnMessage }: VoiceMessageProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [waveformAnim] = useState(new Animated.Value(1));
  const { colors } = useTheme();

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveformAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(waveformAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      waveformAnim.setValue(1);
    }
  }, [isPlaying]);

  const loadSound = async () => {
    try {
      setIsLoading(true);
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      setSound(sound);
      setIsLoading(false);
    } catch (error) {
      console.error('Error al cargar el audio:', error);
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setCurrentPosition(status.positionMillis / 1000);
      if (status.didJustFinish) {
        setIsPlaying(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const playPause = async () => {
    try {
      if (!sound) {
        await loadSound();
      }

      if (isPlaying) {
        await sound?.pauseAsync();
      } else {
        await sound?.playAsync();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Error al reproducir/pausar:', error);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getWaveformColor = () => {
    if (isOwnMessage) {
      return isPlaying ? '#007AFF' : '#8E8E93';
    }
    return isPlaying ? '#34C759' : '#8E8E93';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.playButton,
          {
            backgroundColor: isOwnMessage ? colors.ownBubble : colors.bubble,
          },
        ]}
        onPress={playPause}
        disabled={isLoading}
      >
        <Animated.View
          style={[
            styles.waveformContainer,
            {
              transform: [{ scale: waveformAnim }],
            },
          ]}
        >
          <IconSymbol
            name={isPlaying ? 'pause.fill' : 'play.fill'}
            size={20}
            color="#FFFFFF"
          />
        </Animated.View>
      </TouchableOpacity>

      <View style={styles.durationContainer}>
        <ThemedText style={styles.duration}>
          {formatDuration(currentPosition || duration)}
        </ThemedText>
        <View style={styles.waveform}>
          {[...Array(3)].map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.waveformBar,
                {
                  backgroundColor: getWaveformColor(),
                  transform: [
                    {
                      scaleY: isPlaying
                        ? waveformAnim.interpolate({
                            inputRange: [1, 1.2],
                            outputRange: [1, 1.5],
                          })
                        : 1,
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
    minWidth: 200,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  waveformContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationContainer: {
    flex: 1,
  },
  duration: {
    fontSize: 14,
    marginBottom: 4,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
  },
  waveformBar: {
    width: 3,
    height: 12,
    marginHorizontal: 2,
    borderRadius: 2,
  },
}); 