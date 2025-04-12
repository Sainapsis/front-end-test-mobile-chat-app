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
                    FPS: <ThemedText style={styles.valueText}>{metrics.fps}</ThemedText>
                </ThemedText>

                <ThemedText style={styles.metricText}>
                    Render: <ThemedText style={styles.valueText}>{metrics.renderTime.toFixed(2)}ms</ThemedText>
                </ThemedText>

                <ThemedText style={styles.metricText}>
                    {itemLabel}: <ThemedText style={styles.valueText}>{metrics.itemCount}</ThemedText>
                </ThemedText>

                <ThemedText style={styles.metricText}>
                    Repaint/s: <ThemedText style={styles.valueText}>{metrics.repaintCount}</ThemedText>
                </ThemedText>

                {metrics.memoryUsage > 0 && (
                    <ThemedText style={styles.metricText}>
                        Mem: <ThemedText style={styles.valueText}>{metrics.memoryUsage}MB</ThemedText>
                    </ThemedText>
                )}
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        marginHorizontal: 10,
        width: '95%',
        zIndex: 9999,
        elevation: 9999,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    containerLight: {
        backgroundColor: 'rgba(0, 122, 255, 0.25)',
    },
    containerDark: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 8,
        marginBottom: 4,
    },
    title: {
        fontSize: 12,
        fontWeight: '600',
    },
    refreshButton: {
        padding: 4,
    },
    metricsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
    },
    metricText: {
        fontSize: 11,
        fontWeight: '500',
    },
    valueText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#007AFF',
    }
}); 