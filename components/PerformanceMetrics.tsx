import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface PerformanceMetricsProps {
    itemCount: number;
    itemLabel?: string;
    onRefresh?: () => void;
}

/**
 * Componente que muestra métricas de rendimiento para la aplicación
 * 
 * Incluye FPS, tiempo de renderizado, conteo de elementos y uso de memoria.
 */
export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
    itemCount,
    itemLabel = 'Items',
    onRefresh
}) => {
    const metrics = usePerformanceMetrics(itemCount);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Memoizar estilos que dependen del tema
    const containerStyle = useMemo(() => [
        styles.container,
        isDark ? styles.containerDark : styles.containerLight
    ], [isDark]);

    return (
        <ThemedView style={containerStyle}>
            <View style={styles.headerRow}>
                <ThemedText style={styles.title}>Métricas de Rendimiento</ThemedText>
                {onRefresh && (
                    <Pressable
                        onPress={onRefresh}
                        style={styles.refreshButton}
                    >
                        <IconSymbol
                            name="arrow.clockwise"
                            size={16}
                            color={isDark ? "#FFFFFF" : "#007AFF"}
                        />
                    </Pressable>
                )}
            </View>

            <View style={styles.metricsContainer}>
                <ThemedText style={styles.metricText}>
                    FPS: {metrics.fps}
                </ThemedText>

                <ThemedText style={styles.metricText}>
                    Render: {metrics.renderTime.toFixed(2)}ms
                </ThemedText>

                <ThemedText style={styles.metricText}>
                    {itemLabel}: {metrics.itemCount}
                </ThemedText>

                <ThemedText style={styles.metricText}>
                    Repaint/s: {metrics.repaintCount}
                </ThemedText>

                {metrics.memoryUsage > 0 && (
                    <ThemedText style={styles.metricText}>
                        Memoria: {metrics.memoryUsage}MB
                    </ThemedText>
                )}
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8,
        paddingTop: 4,
        paddingBottom: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        marginHorizontal: 10,
        marginBottom: 10,
        width: '95%',
    },
    containerLight: {
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
    },
    containerDark: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 8,
        marginBottom: 6,
    },
    title: {
        fontSize: 13,
        fontWeight: '600',
    },
    refreshButton: {
        padding: 5,
    },
    metricsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
    },
    metricText: {
        fontSize: 12,
        fontWeight: '500',
    }
}); 