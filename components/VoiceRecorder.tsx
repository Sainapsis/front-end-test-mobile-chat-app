import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Audio } from 'expo-av';
import { IconSymbol } from './ui/IconSymbol';
import { ThemedText } from './ThemedText';
import { useTheme } from '../hooks/theme/useTheme';
import * as Haptics from 'expo-haptics';

interface VoiceRecorderProps {
  onRecordingComplete: (uri: string, duration: number) => void;
  onCancel: () => void;
}

export function VoiceRecorder({ onRecordingComplete, onCancel }: VoiceRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  const { colors } = useTheme();

  useEffect(() => {
    return () => {
      if (recording) {
        stopRecording();
      }
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording, isPaused]);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Se requieren permisos de micrófono');
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      throw error;
    }
  };

  const startRecording = async () => {
    try {
      await requestPermissions();
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      await recording.startAsync();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Error al iniciar la grabación:', error);
      throw error;
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) throw new Error('No se pudo obtener la URI de la grabación');
      
      setRecording(null);
      setIsRecording(false);
      setIsPaused(false);
      
      onRecordingComplete(uri, duration);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error al detener la grabación:', error);
      throw error;
    }
  };

  const pauseRecording = async () => {
    try {
      if (!recording) return;
      await recording.pauseAsync();
      setIsPaused(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error al pausar la grabación:', error);
      throw error;
    }
  };

  const resumeRecording = async () => {
    try {
      if (!recording) return;
      await recording.startAsync();
      setIsPaused(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error al reanudar la grabación:', error);
      throw error;
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.reactionBackground }]}
          onPress={onCancel}
        >
          <IconSymbol name="xmark" size={24} color={colors.text} />
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.recordButton,
            {
              backgroundColor: isRecording ? '#FF3B30' : colors.reactionBackground,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.recordButtonInner}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <IconSymbol
              name={isRecording ? 'stop.fill' : 'mic.fill'}
              size={24}
              color={isRecording ? '#FFFFFF' : colors.text}
            />
          </TouchableOpacity>
        </Animated.View>

        {isRecording && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.reactionBackground }]}
            onPress={isPaused ? resumeRecording : pauseRecording}
          >
            <IconSymbol
              name={isPaused ? 'play.fill' : 'pause.fill'}
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
        )}
      </View>

      {isRecording && (
        <View style={styles.durationContainer}>
          <ThemedText style={styles.duration}>
            {formatDuration(duration)}
          </ThemedText>
          <ThemedText style={styles.hint}>
            {isPaused ? 'Grabación pausada' : 'Grabando...'}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationContainer: {
    alignItems: 'center',
  },
  duration: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  hint: {
    fontSize: 14,
    opacity: 0.7,
  },
}); 