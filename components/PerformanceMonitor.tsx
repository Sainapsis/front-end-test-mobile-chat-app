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
    screenName = 'Unknown'
}) => {
    const [visible, setVisible] = useState(initiallyVisible);
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
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                {visible ? (
                    <PerformanceMetrics
                        key={key}
                        itemCount={itemCount}
                        itemLabel={itemLabel}
                        onRefresh={resetMetrics}
                    />
                ) : (
                    <Pressable
                        style={styles.minimizedState}
                        onPress={() => setVisible(true)}
                    >
                        <IconSymbol name="chart.bar.fill" size={16} color="#007AFF" />
                        <ThemedText style={styles.minimizedText}>Ver métricas</ThemedText>
                    </Pressable>
                )}

                <Pressable
                    style={styles.toggleButton}
                    onPress={() => setVisible(!visible)}
                >
                    <IconSymbol
                        name={visible ? "minus.circle.fill" : "plus.circle.fill"}
                        size={18}
                        color="#007AFF"
                    />
                </Pressable>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        width: '100%',
        zIndex: 1000,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 5,
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