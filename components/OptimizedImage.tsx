import React, { useState, memo, useEffect } from 'react';
import { Image, ImageProps, ActivityIndicator, View, StyleSheet, Platform, StyleProp, ViewStyle, ImageStyle } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';

interface OptimizedImageProps extends ImageProps {
    placeholder?: React.ReactNode;
    fallback?: React.ReactNode;
    cacheKey?: string;
    priority?: 'low' | 'normal' | 'high';
    prefetch?: boolean;
    cacheControl?: 'memory-only' | 'disk-only' | 'memory-disk';
}

// Directorio para almacenar imágenes en caché
const CACHE_DIRECTORY = `${FileSystem.cacheDirectory}optimized-images/`;

// Crear el directorio de caché si no existe
const ensureCacheDirectory = async () => {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIRECTORY);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(CACHE_DIRECTORY, { intermediates: true });
    }
};

// Cache en memoria para imágenes
const memoryCache: Record<string, string> = {};

// Obtener una versión en caché de la imagen
const getCachedImage = async (uri: string, cacheKey?: string): Promise<string | null> => {
    try {
        // Asegurar que el directorio de caché existe
        await ensureCacheDirectory();

        // Generar un nombre de archivo basado en URI o clave personalizada
        const filename = cacheKey || await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            uri
        );
        const cacheFilePath = `${CACHE_DIRECTORY}${filename}`;

        // Verificar si existe en memoria primero
        if (memoryCache[filename]) {
            return memoryCache[filename];
        }

        // Verificar si existe en disco
        const fileInfo = await FileSystem.getInfoAsync(cacheFilePath);
        if (fileInfo.exists) {
            // Almacenar en caché de memoria también
            memoryCache[filename] = cacheFilePath;
            return cacheFilePath;
        }

        // Descargar la imagen si no está en caché
        await FileSystem.downloadAsync(uri, cacheFilePath);

        // Almacenar en caché de memoria
        memoryCache[filename] = cacheFilePath;

        return cacheFilePath;
    } catch (error) {
        console.error('Error caching image:', error);
        return null;
    }
};

function OptimizedImageComponent({
    source,
    style,
    placeholder,
    fallback,
    cacheKey,
    priority = 'normal',
    prefetch = false,
    cacheControl = 'memory-disk',
    ...rest
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [cachedUri, setCachedUri] = useState<string | null>(null);

    // Valor por defecto para placeholder
    const defaultPlaceholder = (
        <View style={[styles.placeholder, style as StyleProp<ViewStyle>]}>
            <ActivityIndicator color="#007AFF" />
        </View>
    );

    // Valor por defecto para fallback
    const defaultFallback = (
        <View style={[styles.placeholder, style as StyleProp<ViewStyle>]}>
            <ActivityIndicator color="#FF3B30" />
        </View>
    );

    useEffect(() => {
        // Solo cachear URIs remotas
        if (typeof source === 'object' && source !== null && 'uri' in source && source.uri && source.uri.startsWith('http')) {
            const uri = source.uri;

            // Función para cargar la imagen en caché
            const cacheImage = async () => {
                try {
                    const cached = await getCachedImage(uri, cacheKey);
                    if (cached) {
                        setCachedUri(cached);
                    }
                } catch (error) {
                    console.error('Error prefetching image:', error);
                    // Si falla la caché, continuar con la URI original
                }
            };

            // Si se solicita prefetch, intentar cargar inmediatamente
            if (prefetch) {
                cacheImage();
            }
        }

        // Limpieza al desmontar
        return () => {
            // Si es una imagen en memoria solamente, liberar cuando se desmonta
            if (cacheControl === 'memory-only' && cacheKey && memoryCache[cacheKey]) {
                delete memoryCache[cacheKey];
            }
        };
    }, [source, cacheKey, prefetch, cacheControl]);

    if (hasError) {
        return <>{fallback || defaultFallback}</>;
    }

    // Determinar la fuente final de la imagen
    const finalSource =
        (typeof source === 'object' && source !== null && 'uri' in source && source.uri && cachedUri)
            ? { ...source, uri: cachedUri }
            : source;

    return (
        <View style={style as StyleProp<ViewStyle>}>
            {isLoading && (placeholder || defaultPlaceholder)}
            <Image
                source={finalSource}
                style={[style as StyleProp<ImageStyle>, isLoading && styles.hidden]}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setIsLoading(false);
                    setHasError(true);
                    // Si falla con la versión cacheada, intentar con la original
                    if (cachedUri && typeof source === 'object' && source !== null && 'uri' in source && source.uri) {
                        setCachedUri(null);
                    }
                }}
                fadeDuration={Platform.OS === 'android' ? 300 : 0}
                progressiveRenderingEnabled={true}
                {...rest}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
    },
    hidden: {
        opacity: 0,
    }
});

// Exponer también una función para limpiar la caché
export const clearImageCache = async () => {
    try {
        // Limpiar caché en memoria
        Object.keys(memoryCache).forEach(key => {
            delete memoryCache[key];
        });

        // Limpiar caché en disco
        await FileSystem.deleteAsync(CACHE_DIRECTORY, { idempotent: true });
        await ensureCacheDirectory();
    } catch (error) {
        console.error('Error clearing image cache:', error);
    }
};

// Memorizamos el componente para evitar renderizaciones innecesarias
export const OptimizedImage = memo(OptimizedImageComponent); 