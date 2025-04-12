import { useState, useEffect, useRef } from 'react';
import { InteractionManager } from 'react-native';

interface PerformanceMetricsHookResult {
    fps: number;
    renderTime: number;
    itemCount: number;
    memoryUsage: number;
    repaintCount: number;
}

/**
 * Hook personalizado para medir y mostrar métricas de rendimiento
 * 
 * @param itemCount Número de elementos (mensajes, chats, etc.) en la pantalla
 * @returns Objeto con métricas de rendimiento
 */
export function usePerformanceMetrics(
    itemCount: number
): PerformanceMetricsHookResult {
    const [fps, setFps] = useState(0);
    const [renderTime, setRenderTime] = useState(0);
    const [memoryUsage, setMemoryUsage] = useState(0);
    const [repaintCount, setRepaintCount] = useState(0);

    const frameCountRef = useRef(0);
    const lastUpdateTimeRef = useRef(Date.now());
    const renderStartTimeRef = useRef(0);
    const repaintCountRef = useRef(0);
    const renderCountInSecondRef = useRef(0);
    const lastSecondTimestampRef = useRef(Date.now());

    // Usar un único efecto para medir FPS y repintados con requestAnimationFrame
    useEffect(() => {
        let frameId: number;
        let active = true;

        // Incrementar contador de repintados (una vez por renderizado)
        renderCountInSecondRef.current += 1;

        const runAnimationLoop = () => {
            frameCountRef.current += 1;
            const now = Date.now();
            const delta = now - lastUpdateTimeRef.current;
            const repaintDelta = now - lastSecondTimestampRef.current;

            // Actualizar FPS y repintados cada segundo
            if (delta > 1000) {
                if (active) {
                    // Actualizar FPS
                    setFps(Math.round((frameCountRef.current * 1000) / delta));
                    frameCountRef.current = 0;
                    lastUpdateTimeRef.current = now;

                    // Actualizar conteo de repintados por segundo
                    setRepaintCount(renderCountInSecondRef.current);
                    renderCountInSecondRef.current = 0;
                    lastSecondTimestampRef.current = now;
                }
            }

            if (active) {
                frameId = requestAnimationFrame(runAnimationLoop);
            }
        };

        // Iniciar el loop de animación
        frameId = requestAnimationFrame(runAnimationLoop);

        // Cleanup
        return () => {
            active = false;
            cancelAnimationFrame(frameId);
        };
    }, []);  // Solo ejecutar una vez al montar

    // Resetear el contador cuando cambia el número de elementos
    useEffect(() => {
        renderCountInSecondRef.current = 0;
        lastSecondTimestampRef.current = Date.now();
        setRepaintCount(0);
    }, [itemCount]);

    // Medir tiempo de renderizado
    useEffect(() => {
        renderStartTimeRef.current = Date.now();

        // Esperar a que se complete la renderización
        InteractionManager.runAfterInteractions(() => {
            const renderEndTime = Date.now();
            setRenderTime(renderEndTime - renderStartTimeRef.current);
        });
    }, [itemCount]);

    // Simular medición de uso de memoria
    // Nota: En un entorno real, esto requeriría herramientas como Expo-Device o 
    // métricas nativas que no están fácilmente disponibles en React Native
    useEffect(() => {
        // Simulación simple basada en el conteo de elementos
        const estimatedMemory = Math.round(itemCount * 0.05);
        setMemoryUsage(estimatedMemory > 0 ? estimatedMemory : 0);
    }, [itemCount]);

    return {
        fps,
        renderTime,
        itemCount,
        memoryUsage,
        repaintCount
    };
} 