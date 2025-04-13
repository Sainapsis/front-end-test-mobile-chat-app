import { useState, useEffect, useRef } from 'react';
import { InteractionManager, LayoutAnimation } from 'react-native';

/**
 * Interfaz que define los datos devueltos por el hook usePerformanceMetrics
 */
export interface PerformanceMetricsHookResult {
    fps: number;
    renderTime: number;     // Tiempo del primer renderizado
    itemCount: number;
    memoryUsage: number;
    repaintCount: number;
    frameTime: number;
    interactionLatency: number;
    cpuUsage: number;
    mountedElements: number;
    jsHeapSize: number;
    layoutTime: number;     // Tiempo de layout del primer renderizado
    loadTime: number;
    // Métricas estáticas para comparaciones entre proyectos
    stableRenderTime: number;
    stableFrameTime: number;
    stableLayoutTime: number;
}

/**
 * Hook que proporciona métricas de rendimiento para la aplicación.
 * 
 * Mide FPS, tiempo de renderizado, cuenta elementos y simula uso de memoria.
 * Proporciona métricas estables para comparación entre proyectos.
 * 
 * @param itemCount - Número de elementos renderizados
 * @returns Objeto con métricas de rendimiento
 */
export function usePerformanceMetrics(itemCount: number): PerformanceMetricsHookResult {
    // Estado para las métricas
    const [fps, setFps] = useState<number>(0);
    const [renderTime, setRenderTime] = useState<number>(0);
    const [memoryUsage, setMemoryUsage] = useState<number>(0);
    const [repaintCount, setRepaintCount] = useState<number>(0);
    const [frameTime, setFrameTime] = useState<number>(0);
    const [interactionLatency, setInteractionLatency] = useState<number>(0);
    const [cpuUsage, setCpuUsage] = useState<number>(0);
    const [mountedElements, setMountedElements] = useState<number>(0);
    const [jsHeapSize, setJsHeapSize] = useState<number>(0);
    const [layoutTime, setLayoutTime] = useState<number>(0);
    const [loadTime, setLoadTime] = useState<number>(0);

    // Estado para métricas estáticas y estables (para comparaciones)
    const [stableRenderTime, setStableRenderTime] = useState<number>(0);
    const [stableFrameTime, setStableFrameTime] = useState<number>(0);
    const [stableLayoutTime, setStableLayoutTime] = useState<number>(0);

    // Refs para cálculos internos
    const frameCountRef = useRef<number>(0);
    const lastFrameTimeRef = useRef<number>(Date.now());
    const renderStartTimeRef = useRef<number>(0);
    const animationFrameIdRef = useRef<number | null>(null);
    const prevItemCountRef = useRef<number>(itemCount);
    const hasSetLoadTimeRef = useRef<boolean>(false);
    const hasSetInitialRenderTimeRef = useRef<boolean>(false);
    const hasSetInitialLayoutTimeRef = useRef<boolean>(false);

    // Refs para cálculo de promedios
    const frameTimeSamplesRef = useRef<number[]>([]);
    const MAX_SAMPLES = 10; // Número de muestras para el promedio

    // Función para calcular promedio
    const calculateAverage = (samples: number[]): number => {
        if (samples.length === 0) return 0;
        const sum = samples.reduce((a, b) => a + b, 0);
        return sum / samples.length;
    };

    // Efecto para medir FPS
    useEffect(() => {
        const calculateFps = () => {
            const now = Date.now();
            const elapsed = now - lastFrameTimeRef.current;

            // Solo actualizar FPS cada 500ms para estabilidad en la lectura
            if (elapsed > 500) {
                const currentFps = Math.min(60, Math.round((frameCountRef.current * 1000) / elapsed));
                setFps(currentFps);

                // Calcular tiempo de frame promedio (ms)
                const avgFrameTime = elapsed / frameCountRef.current;

                // Añadir a las muestras de frameTime
                frameTimeSamplesRef.current.push(avgFrameTime);
                if (frameTimeSamplesRef.current.length > MAX_SAMPLES) {
                    frameTimeSamplesRef.current.shift();
                }

                // Actualizar el frameTime con el promedio
                setFrameTime(calculateAverage(frameTimeSamplesRef.current));

                // Actualizar métricas estáticas si no se han establecido
                if (!stableFrameTime) {
                    setStableFrameTime(parseFloat(avgFrameTime.toFixed(1)));
                }

                frameCountRef.current = 0;
                lastFrameTimeRef.current = now;
            }

            frameCountRef.current++;
            animationFrameIdRef.current = requestAnimationFrame(calculateFps);
        };

        // Iniciar medición de FPS
        animationFrameIdRef.current = requestAnimationFrame(calculateFps);

        // Simulación de latencia de interacción
        const measureInteractionLatency = () => {
            const start = Date.now();
            InteractionManager.runAfterInteractions(() => {
                const latency = Date.now() - start;
                setInteractionLatency(latency);
            });
        };

        // Medir latencia cada 2 segundos
        const interactionInterval = setInterval(measureInteractionLatency, 2000);

        // Simular tiempo de carga inicial (solo una vez)
        if (!hasSetLoadTimeRef.current) {
            // Generar un valor determinístico basado en itemCount para comparaciones consistentes
            const loadTimeValue = 100 + Math.min(300, itemCount * 2);
            setLoadTime(loadTimeValue);
            hasSetLoadTimeRef.current = true;
        }

        return () => {
            if (animationFrameIdRef.current !== null) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
            clearInterval(interactionInterval);
        };
    }, []);

    // Efecto para medir tiempo de renderizado (solo la primera vez)
    useEffect(() => {
        // Solo medimos el tiempo de renderizado la primera vez
        if (!hasSetInitialRenderTimeRef.current) {
            renderStartTimeRef.current = Date.now();

            // Calcular el tiempo de renderizado al final del renderizado actual
            setTimeout(() => {
                const initialRenderTime = Date.now() - renderStartTimeRef.current;
                setRenderTime(initialRenderTime);
                setStableRenderTime(initialRenderTime);

                // Calcular layoutTime basado en renderTime (solo la primera vez)
                const initialLayoutTime = Math.round(initialRenderTime * 0.7);
                setLayoutTime(initialLayoutTime);
                setStableLayoutTime(initialLayoutTime);

                hasSetInitialRenderTimeRef.current = true;
                hasSetInitialLayoutTimeRef.current = true;
                console.log('Tiempo de renderizado inicial registrado:', initialRenderTime);
            }, 0);
        }
    }, []);

    // Reiniciar repaintCount cuando cambia itemCount
    useEffect(() => {
        if (prevItemCountRef.current !== itemCount) {
            setRepaintCount(0);
            prevItemCountRef.current = itemCount;
        } else {
            setRepaintCount(prev => prev + 1);
        }
    }, [itemCount]);

    // Simular uso de memoria basado en itemCount
    useEffect(() => {
        // Más determinístico: cada elemento usa exactamente 0.1MB
        const estimatedMemory = Math.round(itemCount * 0.1 * 10) / 10;
        setMemoryUsage(estimatedMemory);

        // Estimar tamaño del heap de JavaScript (usualmente mayor que la memoria visible)
        const estimatedJsHeap = estimatedMemory * 1.5;
        setJsHeapSize(estimatedJsHeap);

        // Simular CPU usage basado en itemCount y repaints de forma más determinística
        const calculatedCpuUsage = Math.min(99, 5 + itemCount * 0.2);
        setCpuUsage(calculatedCpuUsage);

        // Estimar elementos montados (elementos reales + elementos del sistema)
        const baseSystemElements = 50; // Elementos base del sistema UI
        const estimatedElements = baseSystemElements + itemCount * 3; // Cada item visible tiene ~3 elementos
        setMountedElements(estimatedElements);

    }, [itemCount, repaintCount]);

    return {
        fps,
        renderTime,         // Valor fijo después del primer renderizado
        itemCount,
        memoryUsage,
        repaintCount,
        frameTime: parseFloat(frameTime.toFixed(1)),
        interactionLatency,
        cpuUsage,
        mountedElements,
        jsHeapSize,
        layoutTime,         // Valor fijo después del primer renderizado
        loadTime,
        // Métricas estables para comparación entre proyectos
        stableRenderTime,
        stableFrameTime,
        stableLayoutTime
    };
} 