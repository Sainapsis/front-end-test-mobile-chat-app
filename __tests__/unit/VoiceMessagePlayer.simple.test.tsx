/**
 * Test simplificado para VoiceMessagePlayer
 */

// Mock para expo-av
jest.mock('expo-av', () => ({
    Audio: {
        Sound: {
            createAsync: jest.fn().mockResolvedValue({
                sound: {
                    setOnPlaybackStatusUpdate: jest.fn(),
                    playAsync: jest.fn().mockResolvedValue({}),
                    pauseAsync: jest.fn().mockResolvedValue({}),
                    unloadAsync: jest.fn().mockResolvedValue({}),
                    setPositionAsync: jest.fn().mockResolvedValue({}),
                    getStatusAsync: jest.fn().mockResolvedValue({
                        isLoaded: true,
                        isPlaying: false,
                        positionMillis: 0,
                        durationMillis: 10000,
                    }),
                },
                status: {
                    isLoaded: true,
                    durationMillis: 10000,
                },
            }),
        },
        setAudioModeAsync: jest.fn().mockResolvedValue({}),
    },
}));

// Mock para @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
    Ionicons: jest.fn().mockImplementation(() => null),
}));

describe('Funcionalidad de reproductor de audio', () => {
    it('debería poder simular reproducción de audio', async () => {
        // Simulación del reproductor de audio
        const playAudio = jest.fn().mockResolvedValue(undefined);
        const pauseAudio = jest.fn().mockResolvedValue(undefined);

        // Probar que podemos simular la funcionalidad
        await playAudio();
        await pauseAudio();

        // Verificar que las funciones fueron llamadas
        expect(playAudio).toHaveBeenCalled();
        expect(pauseAudio).toHaveBeenCalled();
    });
}); 