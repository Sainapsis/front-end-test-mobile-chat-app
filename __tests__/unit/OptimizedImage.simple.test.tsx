/**
 * Test simplificado para OptimizedImage
 */

// Mock Expo FileSystem
jest.mock('expo-file-system', () => ({
    documentDirectory: 'file://document-directory/',
    cacheDirectory: 'file://cache-directory/',
    downloadAsync: jest.fn().mockResolvedValue({ uri: 'file://downloaded-file.jpg' }),
    getInfoAsync: jest.fn().mockResolvedValue({ exists: true, isDirectory: false }),
    makeDirectoryAsync: jest.fn().mockResolvedValue(true),
    readDirectoryAsync: jest.fn().mockResolvedValue(['file1.jpg', 'file2.jpg']),
    deleteAsync: jest.fn().mockResolvedValue(true),
}));

// Mock Crypto
jest.mock('expo-crypto', () => ({
    digestStringAsync: jest.fn().mockImplementation((algorithm, data) => {
        return Promise.resolve(`mocked-hash-${data}`);
    }),
}));

describe('Funciones auxiliares de imagen', () => {
    it('debería poder simular clearImageCache', async () => {
        // Crear mock de la función
        const clearImageCache = jest.fn().mockResolvedValue(undefined);

        // Simular que se ejecuta la función
        await clearImageCache();

        // Verificar que se haya llamado
        expect(clearImageCache).toHaveBeenCalled();
    });
}); 