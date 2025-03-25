import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { ThemedText } from './ThemedText';

interface VoiceMessagePlayerProps {
  uri: string;
  duration: number;
}

export function VoiceMessagePlayer({ uri, duration }: VoiceMessagePlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const positionTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadSound();
    return () => {
      if (positionTimer.current) {
        clearInterval(positionTimer.current);
      }
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [uri]);

  const loadSound = async () => {
    try {
      // Configure audio mode first
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        (status) => {
          if (!status.isLoaded) return;
          if (status.didJustFinish) {
            setIsPlaying(false);
            setCurrentPosition(0);
            if (positionTimer.current) {
              clearInterval(positionTimer.current);
            }
          }
        }
      );

      setSound(newSound);
    } catch (error) {
      console.error('Error loading sound:', error);
      Alert.alert('Error', 'Failed to load audio file');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (positionTimer.current) {
      clearInterval(positionTimer.current);
    }

    positionTimer.current = setInterval(async () => {
      if (sound) {
        try {
          const status = await sound.getStatusAsync();
          if ('positionMillis' in status && status.isLoaded) {
            setCurrentPosition(Math.floor(status.positionMillis / 1000));
            
            if (!status.isPlaying) {
              clearInterval(positionTimer.current!);
              setIsPlaying(false);
              setCurrentPosition(0);
            }
          }
        } catch (error) {
          console.error('Error getting sound status:', error);
          clearInterval(positionTimer.current!);
          setIsPlaying(false);
        }
      }
    }, 1000);
  };

  const handlePlayPause = async () => {
    try {
      if (isLoading || !sound) return;
      setIsLoading(true);

      const status = await sound.getStatusAsync();
      if (!status.isLoaded) {
        await loadSound();
      }

      if (isPlaying) {
        await sound.pauseAsync();
        if (positionTimer.current) {
          clearInterval(positionTimer.current);
        }
        setIsPlaying(false);
      } else {
        await sound.playFromPositionAsync(currentPosition * 1000);
        startTimer();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing voice message:', error);
      Alert.alert('Error', 'Failed to play audio file');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={handlePlayPause} 
        style={[styles.playButton, isLoading && styles.disabledButton]}
        disabled={isLoading}
      >
        <MaterialIcons
          name={isPlaying ? 'pause' : 'play-arrow'}
          size={24}
          color={isLoading ? "#999999" : "#007AFF"}
        />
      </TouchableOpacity>

      <View style={styles.progressContainer}>
        <View 
          style={[
            styles.progressBar,
            { width: `${(currentPosition / duration) * 100}%` }
          ]}
        />
      </View>

      <ThemedText style={styles.duration}>
        {formatTime(isPlaying ? currentPosition : duration)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'transparent',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  progressContainer: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  duration: {
    fontSize: 12,
    minWidth: 40,
    textAlign: 'right',
  },
}); 