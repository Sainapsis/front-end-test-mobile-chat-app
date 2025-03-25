import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [isLoaded, setIsLoaded] = useState(false);
  const positionTimer = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  // Función para limpiar recursos
  const cleanup = useCallback(() => {
    if (positionTimer.current) {
      clearInterval(positionTimer.current);
      positionTimer.current = null;
    }

    if (sound) {
      const cleanupSound = async () => {
        try {
          // Detener reproducción antes de descargar
          if (isPlaying) {
            await sound.stopAsync();
          }
          await sound.unloadAsync();
        } catch (error) {
          console.error('Error unloading sound:', error);
        }
      };

      cleanupSound();
      setSound(null);
    }
  }, [sound, isPlaying]);

  // Efecto para cargar el sonido inicialmente
  useEffect(() => {
    loadSound();

    // Limpiar cuando el componente se desmonta
    return () => {
      isMounted.current = false;
      cleanup();
    };
  }, [uri]);

  // Control automático de memoria - descargar sonido cuando pierde el foco
  useEffect(() => {
    const subscription = Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false, // Para mayor eficiencia de memoria
      shouldDuckAndroid: true,
    });

    return () => {
      // En caso de cambio de configuración de audio
      cleanup();
    };
  }, [cleanup]);

  const loadSound = async () => {
    if (!isMounted.current) return;

    try {
      // Primero liberar cualquier recurso existente
      cleanup();

      setIsLoading(true);

      // Configure audio mode first
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        (status) => {
          if (!isMounted.current) return;

          if (!status.isLoaded) return;

          if (status.didJustFinish) {
            setIsPlaying(false);
            setCurrentPosition(0);
            if (positionTimer.current) {
              clearInterval(positionTimer.current);
              positionTimer.current = null;
            }
          }
        }
      );

      if (!isMounted.current) {
        // Si el componente se desmontó mientras se cargaba
        newSound.unloadAsync();
        return;
      }

      setSound(newSound);
      setIsLoaded(true);
      setIsLoading(false);

      // Cargar y empezar a seguir el progreso
      const status = await newSound.getStatusAsync();
      if (status.isLoaded) {
        setCurrentPosition(Math.floor((status.positionMillis || 0) / 1000));
      }
    } catch (error) {
      console.error('Error loading sound:', error);
      if (isMounted.current) {
        setIsLoading(false);
        Alert.alert('Error', 'Failed to load audio file');
      }
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
      if (!isMounted.current) {
        if (positionTimer.current) {
          clearInterval(positionTimer.current);
          positionTimer.current = null;
        }
        return;
      }

      if (sound) {
        try {
          const status = await sound.getStatusAsync();
          if ('positionMillis' in status && status.isLoaded) {
            setCurrentPosition(Math.floor(status.positionMillis / 1000));

            if (!status.isPlaying) {
              clearInterval(positionTimer.current!);
              positionTimer.current = null;
              setIsPlaying(false);
              setCurrentPosition(0);
            }
          }
        } catch (error) {
          console.error('Error getting sound status:', error);
          if (positionTimer.current) {
            clearInterval(positionTimer.current);
            positionTimer.current = null;
          }
          if (isMounted.current) {
            setIsPlaying(false);
          }
        }
      }
    }, 1000);
  };

  const handlePlayPause = async () => {
    try {
      if (isLoading || !isMounted.current) return;
      setIsLoading(true);

      if (!sound || !isLoaded) {
        await loadSound();
      }

      if (!sound) {
        setIsLoading(false);
        return;
      }

      const status = await sound.getStatusAsync();

      if (!status.isLoaded) {
        // Si el sonido no está cargado, intentar cargarlo de nuevo
        await loadSound();
        setIsLoading(false);
        return;
      }

      if (isPlaying) {
        await sound.pauseAsync();
        if (positionTimer.current) {
          clearInterval(positionTimer.current);
          positionTimer.current = null;
        }
        setIsPlaying(false);
      } else {
        await sound.playFromPositionAsync(currentPosition * 1000);
        startTimer();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing voice message:', error);
      if (isMounted.current) {
        Alert.alert('Error', 'Failed to play audio file');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
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