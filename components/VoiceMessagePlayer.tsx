import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av'; // Usamos la importación directa
import { ThemedText } from './ThemedText';

interface VoiceMessagePlayerProps {
    readonly uri: string;
    readonly duration: number;
}

export function VoiceMessagePlayer({ uri, duration }: VoiceMessagePlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [loading, setLoading] = useState(false);
    const soundRef = useRef<Audio.Sound | null>(null);
    const isMounted = useRef(true);
    const positionTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Cargar y descargar el sonido cuando cambia el URI o se desmonta el componente
    useEffect(() => {
        loadSound();

        // Función de limpieza al desmontar
        return () => {
            console.log('Desmontando reproductor de audio:', uri);
            isMounted.current = false;
            stopAndUnloadSound();
        };
    }, [uri]); // Solo recargar cuando cambia el URI

    // Función simple para formatear tiempo
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Función para detener el temporizador de posición
    const clearPositionTimer = () => {
        if (positionTimerRef.current) {
            clearInterval(positionTimerRef.current);
            positionTimerRef.current = null;
        }
    };

    // Función para iniciar el temporizador de posición
    const startPositionTimer = () => {
        clearPositionTimer();

        positionTimerRef.current = setInterval(async () => {
            if (!isMounted.current) {
                clearPositionTimer();
                return;
            }

            try {
                if (soundRef.current) {
                    const status = await soundRef.current.getStatusAsync();
                    if (status.isLoaded) {
                        setPosition(Math.floor(status.positionMillis / 1000));

                        if (!status.isPlaying) {
                            clearPositionTimer();
                            if (status.didJustFinish) {
                                setPosition(0);
                                setIsPlaying(false);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error actualizando posición:', error);
            }
        }, 500);
    };

    // Detener y descargar el sonido
    const stopAndUnloadSound = async () => {
        clearPositionTimer();

        if (soundRef.current) {
            try {
                const status = await soundRef.current.getStatusAsync();
                if (status.isLoaded) {
                    if (status.isPlaying) {
                        await soundRef.current.stopAsync();
                    }
                    await soundRef.current.unloadAsync();
                }
            } catch (error) {
                console.error('Error al descargar sonido:', error);
            }

            soundRef.current = null;
        }
    };

    // Cargar el sonido
    const loadSound = async () => {
        if (!isMounted.current) return;

        try {
            setLoading(true);

            // Descargar cualquier sonido anterior
            await stopAndUnloadSound();

            if (!uri) {
                console.error('URI de audio no válido');
                return;
            }

            console.log('Cargando audio desde:', uri);

            // Configurar el modo de audio
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
                allowsRecordingIOS: false,
            });

            // Crear y cargar el sonido
            const { sound } = await Audio.Sound.createAsync(
                { uri },
                { shouldPlay: false },
                onPlaybackStatusUpdate
            );

            if (!isMounted.current) {
                sound.unloadAsync();
                return;
            }

            // Guardar la referencia
            soundRef.current = sound;
            console.log('Audio cargado correctamente');
        } catch (error) {
            console.error('Error cargando audio:', error);
            Alert.alert('Error', 'No se pudo cargar el audio');
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    // Callback para actualizar el estado de reproducción
    const onPlaybackStatusUpdate = (status: any) => {
        if (!isMounted.current) return;

        if (status.isLoaded) {
            if (status.didJustFinish) {
                setIsPlaying(false);
                setPosition(0);
                clearPositionTimer();
            }
        }
    };

    // Manejar reproducción/pausa
    const handlePlayPause = async () => {
        if (loading) return;

        try {
            setLoading(true);

            // Si no hay sonido cargado, intentar cargarlo
            if (!soundRef.current) {
                await loadSound();

                if (!soundRef.current) {
                    console.error('No se pudo cargar el sonido');
                    return;
                }
            }

            // Verificar estado
            const status = await soundRef.current.getStatusAsync();

            if (!status.isLoaded) {
                console.log('Sonido no cargado, recargando...');
                await loadSound();

                if (!soundRef.current) {
                    return;
                }
            }

            // Reproducir o pausar según el estado actual
            if (isPlaying) {
                await soundRef.current.pauseAsync();
                clearPositionTimer();
                setIsPlaying(false);
            } else {
                // Si estamos al final, volver al inicio
                if (position >= duration) {
                    setPosition(0);
                }

                // Iniciar reproducción desde la posición actual
                await soundRef.current.playFromPositionAsync(position * 1000);
                startPositionTimer();
                setIsPlaying(true);
            }
        } catch (error) {
            console.error('Error en play/pause:', error);
            Alert.alert('Error', 'No se pudo reproducir el audio');
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={handlePlayPause}
                style={[styles.playButton, loading && styles.disabledButton]}
                disabled={loading}
            >
                <MaterialIcons
                    name={isPlaying ? 'pause' : 'play-arrow'}
                    size={24}
                    color={loading ? "#999999" : "#007AFF"}
                />
            </TouchableOpacity>

            <View style={styles.progressContainer}>
                <View
                    style={[
                        styles.progressBar,
                        { width: `${(position / duration) * 100}%` }
                    ]}
                />
            </View>

            <ThemedText style={styles.duration}>
                {formatTime(isPlaying ? position : duration)}
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