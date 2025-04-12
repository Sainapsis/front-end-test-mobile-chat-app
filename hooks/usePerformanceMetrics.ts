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
    const lastRepaintResetTimeRef = useRef(Date.now());

    // Incrementar el contador de repintados y reportar repintados por segundo
    useEffect(() => {
        repaintCountRef.current += 1;

        const now = Date.now();
        const timeSinceLastReset = now - lastRepaintResetTimeRef.current;

        // Actualizar el contador de repintados cada segundo
        if (timeSinceLastReset >= 1000) {
            setRepaintCount(repaintCountRef.current);
            repaintCountRef.current = 0;
            lastRepaintResetTimeRef.current = now;
        }

        // Cleanup
        return () => {
            // Si el componente se desmonta, aseguramos que el último valor sea visible
            if (repaintCountRef.current > 0) {
                setRepaintCount(repaintCountRef.current);
            }
        };
    });

    // Resetear el contador cuando cambia el número de elementos
    useEffect(() => {
        repaintCountRef.current = 0;
        lastRepaintResetTimeRef.current = Date.now();
        setRepaintCount(0);
    }, [itemCount]);

    // Medir FPS
    useEffect(() => {
        let frameId: number;
        let active = true;

        const calculateFps = () => {
            frameCountRef.current += 1;
            const now = Date.now();
            const delta = now - lastUpdateTimeRef.current;

            // Actualizar FPS cada segundo
            if (delta > 1000) {
                if (active) {
                    setFps(Math.round((frameCountRef.current * 1000) / delta));
                    frameCountRef.current = 0;
                    lastUpdateTimeRef.current = now;
                }
            }

            if (active) {
                frameId = requestAnimationFrame(calculateFps);
            }
        };

        frameId = requestAnimationFrame(calculateFps);

        return () => {
            active = false;
            cancelAnimationFrame(frameId);
        };
    }, []);

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