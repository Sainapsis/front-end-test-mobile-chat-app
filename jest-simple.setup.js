console.log('Configuración mínima para Jest');

// Configuración mínima, solo para verificar el funcionamiento básico
jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native');
    return {
        ...RN,
        // Solo mocks mínimos para evitar errores básicos
        Platform: {
            ...RN.Platform,
            OS: 'ios',
            select: (obj) => obj.ios || obj.default
        }
    };
});

// Limpiar mocks en cada prueba
jest.clearAllMocks();

console.log('Configuración mínima completada'); 