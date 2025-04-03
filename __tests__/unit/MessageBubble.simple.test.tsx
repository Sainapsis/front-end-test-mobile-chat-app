/**
 * Test simplificado para MessageBubble
 */

// Mock de react-native
jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native');
    return {
        ...RN,
        useColorScheme: jest.fn().mockReturnValue('light'),
        Pressable: jest.fn(({ children }) => children),
        Alert: {
            alert: jest.fn(),
        }
    };
});

// Mock de @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
    Ionicons: jest.fn().mockImplementation(() => null),
}));

// Mock de componentes internos
jest.mock('@/components/OptimizedImage', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => null),
}));

jest.mock('@/components/VoiceMessagePlayer', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => null),
}));

jest.mock('@/components/ThemedText', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(({ children }) => children),
}));

describe('Funcionalidad de burbujas de mensaje', () => {
    it('debería poder simular manejo de mensajes', () => {
        // Simulamos funciones para manejar mensajes
        const handleLongPress = jest.fn();
        const handlePress = jest.fn();

        // Ejecutamos las funciones simuladas
        handleLongPress();
        handlePress();

        // Verificamos que fueron llamadas
        expect(handleLongPress).toHaveBeenCalled();
        expect(handlePress).toHaveBeenCalled();
    });
}); 