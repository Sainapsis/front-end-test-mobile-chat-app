import React, { useState, useEffect, memo, useCallback } from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import { PerformanceMetrics } from './PerformanceMetrics';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';

interface PerformanceMonitorProps {
    initiallyVisible?: boolean;
    itemCount: number;
    itemLabel?: string;
    screenName?: string;
    absolutePosition?: boolean;
}

/**
 * Componente que muestra un monitor de rendimiento en la parte superior de la pantalla
 * 
 * Permite monitorear el rendimiento de la aplicación en producción
 * especialmente en pantallas con muchos elementos.
 */
export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = memo(({
    initiallyVisible = true,
    itemCount,
    itemLabel = 'Items',
    screenName = 'Unknown',
    absolutePosition = false
}) => {
    const [key, setKey] = useState(0); // Key para forzar la recreación de las métricas

    // Resetea las métricas al cambiar de pantalla
    useEffect(() => {
        resetMetrics();
    }, [screenName]);

    // Función para resetear las métricas
    const resetMetrics = useCallback(() => {
        setKey(prev => prev + 1);
    }, []);

    return (
        <View style={[
            styles.container,
            absolutePosition && styles.absoluteContainer
        ]}>
            <PerformanceMetrics
                key={key}
                itemCount={itemCount}
                itemLabel={itemLabel}
                onRefresh={resetMetrics}
            />
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        width: '100%',
        zIndex: 9999,
        elevation: 9999,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 5,
    },
    absoluteContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        marginTop: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 9999,
        zIndex: 9999,
    },
    contentContainer: {
        alignItems: 'center',
        width: '100%',
    },
    toggleButton: {
        position: 'absolute',
        right: 15,
        top: 5,
        zIndex: 1001,
        padding: 5,
    },
    minimizedState: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 12,
        marginBottom: 6,
    },
    minimizedText: {
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 5,
    }
}); 