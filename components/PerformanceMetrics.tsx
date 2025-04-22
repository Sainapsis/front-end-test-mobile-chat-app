import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Text, ScrollView } from 'react-native';
import { useColorScheme } from '../hooks/useColorScheme';
import { usePerformanceMetrics } from '../hooks/usePerformanceMetrics';

interface PerformanceMetricsProps {
    itemCount: number;
    itemLabel?: string;
    onRefresh?: () => void;
}

// Descripciones cortas para cada métrica
interface MetricDescription {
    label: string;
    description: string;
}

// Umbrales para colorear las métricas según su rendimiento
const thresholds = {
    fps: { good: 55, warning: 30 },         // 60 fps es óptimo, < 30 fps es problemático
    renderTime: { good: 16, warning: 30 },  // < 16ms bueno, > 30ms malo
    frameTime: { good: 16, warning: 30 },   // < 16ms bueno para 60fps, > 30ms malo
    layoutTime: { good: 10, warning: 20 },  // < 10ms bueno, > 20ms malo
    cpuUsage: { good: 30, warning: 60 },    // < 30% bueno, > 60% malo
};

const metricDescriptions: Record<string, MetricDescription> = {
    fps: {
        label: "FPS",
        description: "Frames por segundo. 60 es óptimo. < 30 indica problemas de rendimiento."
    },
    renderTime: {
        label: "Render Inicial",
        description: "Tiempo del primer renderizado en ms. Valor estático para comparación entre proyectos."
    },
    repaintCount: {
        label: "Repaint/s",
        description: "Número de actualizaciones de UI por segundo. Alto = más carga."
    },
    memoryUsage: {
        label: "Mem",
        description: "Uso de memoria total estimado en MB."
    },
    jsHeapSize: {
        label: "JS Heap",
        description: "Memoria usada por JavaScript en MB. Importante para detectar fugas."
    },
    frameTime: {
        label: "Frame Time",
        description: "Tiempo promedio entre frames en ms. < 16ms para animaciones fluidas."
    },
    layoutTime: {
        label: "Layout Inicial",
        description: "Tiempo del cálculo inicial de layout en ms. Valor estático para comparación."
    },
    cpuUsage: {
        label: "CPU",
        description: "Estimación del uso de CPU en %. > 80% puede causar lentitud."
    },
    mountedElements: {
        label: "Elements",
        description: "Estimación de componentes en pantalla. Menos = mejor rendimiento."
    },
    interactionLatency: {
        label: "Interaction",
        description: "Retraso en ms para responder a interacciones. < 100ms es bueno."
    },
    loadTime: {
        label: "Load Time",
        description: "Tiempo en ms para la carga inicial. Se mide una sola vez por pantalla."
    }
};

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
    const [expandedView, setExpandedView] = useState(false);
    const [showDescriptions, setShowDescriptions] = useState(false);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Memoizar estilos que dependen del tema
    const containerStyle = useMemo(() => [
        styles.container,
        isDark ? styles.containerDark : styles.containerLight
    ], [isDark]);

    const toggleExpandedView = () => {
        setExpandedView(!expandedView);
        if (!expandedView) {
            setShowDescriptions(false); // Ocultar descripciones al colapsar
        }
    };

    const toggleDescriptions = () => {
        setShowDescriptions(!showDescriptions);
    };

    // Determinar el color para una métrica según su valor y umbrales
    const getMetricColor = (metricKey: string, value: number): string => {
        const threshold = thresholds[metricKey as keyof typeof thresholds];
        if (!threshold) return isDark ? '#0A84FF' : '#007AFF'; // Color por defecto

        if (metricKey === 'fps') {
            if (value >= threshold.good) return '#4CD964'; // Verde
            if (value >= threshold.warning) return '#FFCC00'; // Amarillo
            return '#FF3B30'; // Rojo
        } else {
            // Para métricas donde menor es mejor (tiempos)
            if (value <= threshold.good) return '#4CD964'; // Verde
            if (value <= threshold.warning) return '#FFCC00'; // Amarillo
            return '#FF3B30'; // Rojo
        }
    };

    // Componente para renderizar una métrica con su valor
    const MetricItem = ({ metricKey, value, unit = "", highlighted = false }:
        { metricKey: string, value: number | string, unit?: string, highlighted?: boolean }) => {

        const { label, description } = metricDescriptions[metricKey] || { label: metricKey, description: "" };
        const numericValue = typeof value === 'number' ? value : parseFloat(value as string) || 0;
        const valueColor = ['fps', 'renderTime', 'frameTime', 'layoutTime', 'cpuUsage'].includes(metricKey)
            ? getMetricColor(metricKey, numericValue)
            : (isDark ? '#0A84FF' : '#007AFF');

        return (
            <View style={[styles.metricItem, highlighted && styles.highlightedMetric]}>
                <Text style={[
                    styles.metricText,
                    isDark && styles.textDark,
                    highlighted && styles.highlightedText
                ]}>
                    {label}: <Text style={[
                        styles.valueText,
                        { color: valueColor },
                        highlighted && styles.highlightedValue
                    ]}>{value}{unit}</Text>
                </Text>
            </View>
        );
    };

    // Componente para la vista simplificada con solo métricas de tiempo inicial 
    const SimpleInitialTimeView = () => (
        <View style={styles.initialTimeContainer}>
            <Text style={[styles.initialTimeTitle, isDark && styles.textDark]}>
                Tiempos Iniciales (valores fijos para comparar proyectos)
            </Text>

            <View style={styles.initialTimeMetrics}>
                <View style={styles.initialTimeItem}>
                    <Text style={[styles.initialTimeLabel, isDark && styles.textDark]}>
                        Render Inicial:
                    </Text>
                    <Text style={[
                        styles.initialTimeValue,
                        { color: getMetricColor('renderTime', metrics.renderTime) }
                    ]}>
                        {metrics.renderTime} ms
                    </Text>
                </View>

                <View style={styles.initialTimeItem}>
                    <Text style={[styles.initialTimeLabel, isDark && styles.textDark]}>
                        Layout Inicial:
                    </Text>
                    <Text style={[
                        styles.initialTimeValue,
                        { color: getMetricColor('layoutTime', metrics.layoutTime) }
                    ]}>
                        {metrics.layoutTime} ms
                    </Text>
                </View>

                <View style={styles.initialTimeItem}>
                    <Text style={[styles.initialTimeLabel, isDark && styles.textDark]}>
                        Items:
                    </Text>
                    <Text style={[styles.initialTimeValue, isDark && { color: '#0A84FF' }]}>
                        {metrics.itemCount} {itemLabel}
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={containerStyle}>
            <View style={styles.headerRow}>
                <Pressable
                    onPress={toggleExpandedView}
                    style={styles.expandButton}
                >
                    <Text style={isDark ? styles.iconDark : styles.iconLight}>
                        {expandedView ? '▲' : '▼'}
                    </Text>
                </Pressable>

                {expandedView && (
                    <Pressable
                        onPress={toggleDescriptions}
                        style={[styles.infoButton, showDescriptions && styles.activeButton]}
                    >
                        <Text style={isDark ? styles.iconDark : styles.iconLight}>ⓘ</Text>
                    </Pressable>
                )}

                {onRefresh && (
                    <Pressable
                        onPress={onRefresh}
                        style={styles.refreshButton}
                    >
                        <Text style={isDark ? styles.iconDark : styles.iconLight}>↻</Text>
                    </Pressable>
                )}
            </View>

            {/* Vista simplificada con tiempos iniciales */}
            <SimpleInitialTimeView />

            {expandedView && (
                <>
                    <View style={styles.sectionDivider} />

                    <View style={styles.metricsContainer}>
                        {/* Métricas básicas */}
                        <MetricItem metricKey="fps" value={metrics.fps} />
                        <MetricItem metricKey="renderTime" value={metrics.renderTime} unit="ms" highlighted={true} />
                        <MetricItem metricKey="layoutTime" value={metrics.layoutTime} unit="ms" highlighted={true} />
                        <MetricItem metricKey="repaintCount" value={metrics.repaintCount} />
                        <Text style={[styles.metricText, isDark && styles.textDark]}>
                            {itemLabel}: <Text style={[styles.valueText, isDark && styles.valueDark]}>{metrics.itemCount}</Text>
                        </Text>
                    </View>

                    {/* Métricas avanzadas */}
                    <View style={styles.expandedMetricsContainer}>
                        <MetricItem metricKey="memoryUsage" value={metrics.memoryUsage} unit="MB" />
                        <MetricItem metricKey="jsHeapSize" value={metrics.jsHeapSize ? metrics.jsHeapSize.toFixed(1) : "0"} unit="MB" />
                        <MetricItem metricKey="frameTime" value={metrics.frameTime.toFixed(1)} unit="ms" />
                        <MetricItem metricKey="cpuUsage" value={metrics.cpuUsage.toFixed(1)} unit="%" />
                        <MetricItem metricKey="mountedElements" value={metrics.mountedElements} />
                        <MetricItem metricKey="interactionLatency" value={metrics.interactionLatency} unit="ms" />
                        <MetricItem metricKey="loadTime" value={metrics.loadTime || 0} unit="ms" />
                    </View>
                </>
            )}

            {/* Descripciones de las métricas */}
            {expandedView && showDescriptions && (
                <View style={styles.descriptionsContainer}>
                    <Text style={[styles.descriptionTitle, isDark && styles.textDark]}>
                        Métricas de Rendimiento:
                    </Text>
                    {Object.entries(metricDescriptions).map(([key, { label, description }]) => (
                        <Text key={key} style={[styles.descriptionText, isDark && styles.textDark]}>
                            <Text style={styles.descriptionLabel}>{label}:</Text> {description}
                        </Text>
                    ))}
                </View>
            )}
        </View>
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
    expandButton: {
        padding: 4,
    },
    infoButton: {
        padding: 4,
        marginLeft: 'auto',
        marginRight: 8,
    },
    activeButton: {
        backgroundColor: 'rgba(0, 122, 255, 0.3)',
        borderRadius: 4,
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
    expandedMetricsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
        marginTop: 8,
    },
    sectionDivider: {
        width: '100%',
        height: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        marginVertical: 8,
    },
    metricItem: {
        // Estilo para cada ítem de métrica
    },
    highlightedMetric: {
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    metricText: {
        fontSize: 11,
        fontWeight: '500',
        color: '#000000',
    },
    highlightedText: {
        fontWeight: '600',
    },
    textDark: {
        color: '#FFFFFF',
    },
    valueText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#007AFF',
    },
    highlightedValue: {
        fontSize: 12,
    },
    valueDark: {
        color: '#0A84FF',
    },
    iconLight: {
        fontSize: 16,
        color: '#007AFF',
    },
    iconDark: {
        fontSize: 16,
        color: '#FFFFFF',
    },
    descriptionsContainer: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.1)',
        alignSelf: 'stretch',
        paddingHorizontal: 8,
    },
    descriptionTitle: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 4,
    },
    descriptionText: {
        fontSize: 10,
        marginBottom: 3,
        textAlign: 'left',
    },
    descriptionLabel: {
        fontWeight: '700',
    },
    initialTimeContainer: {
        alignSelf: 'stretch',
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        borderRadius: 8,
        padding: 10,
        marginVertical: 4,
    },
    initialTimeTitle: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    initialTimeMetrics: {
        gap: 6,
    },
    initialTimeItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    initialTimeLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    initialTimeValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#007AFF',
    }
}); 