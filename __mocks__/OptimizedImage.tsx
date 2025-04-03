const mockOptimizedImage = jest.fn().mockImplementation(() => null) as jest.Mock & {
    clearImageCache: jest.Mock;
};

// Exportar una función para limpiar la caché de imágenes
mockOptimizedImage.clearImageCache = jest.fn().mockImplementation(() => Promise.resolve());

export default mockOptimizedImage; 