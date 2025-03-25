import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import * as FileSystem from 'expo-file-system';

import log, { getDeviceInfo } from './logger';

// Función para generar identificadores únicos
const generateUniqueId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Mantener registro de la navegación
const navigationHistory: string[] = [];
const MAX_NAV_HISTORY = 20;

// Información sobre errores y crashes
interface ErrorInfo {
    id: string;
    timestamp: string;
    error: string;
    componentStack?: string;
    additionalInfo?: Record<string, any>;
}

// Almacén temporal para errores
const errorLogs: ErrorInfo[] = [];
const MAX_ERROR_LOGS = 50;

// Directorio para errores
const ERROR_DIRECTORY = `${FileSystem.documentDirectory}errors/`;
const ERROR_FILE = `${ERROR_DIRECTORY}error_report.json`;

// Asegurar que el directorio de errores exista
const ensureErrorDirectory = async (): Promise<void> => {
    try {
        const dirInfo = await FileSystem.getInfoAsync(ERROR_DIRECTORY);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(ERROR_DIRECTORY, { intermediates: true });
        }
    } catch (error) {
        console.error('Error creating error directory:', error);
    }
};

// Métricas de rendimiento
interface PerformanceMetric {
    id: string;
    name: string;
    startTime: number;
    endTime?: number;
    duration?: number;
}

// Almacén para métricas de rendimiento
const performanceMetrics: Record<string, PerformanceMetric> = {};

// Inicializa el sistema de monitoreo
export const initMonitoring = async (): Promise<void> => {
    log.info('Initializing monitoring system');
    await ensureErrorDirectory();

    // Configurar un manejador global de errores si es posible
    try {
        // En React Native, generalmente está disponible a través de NativeModules
        if (Platform.OS !== 'web' && (global as any).ErrorUtils) {
            const ErrorUtils = (global as any).ErrorUtils;
            const originalHandler = ErrorUtils.getGlobalHandler();

            ErrorUtils.setGlobalHandler((error: Error) => {
                captureError(error, { isFatal: true });
                originalHandler(error);
            });

            log.info('Global error handler registered');
        } else {
            // Alternativa para web o cuando ErrorUtils no está disponible
            window.addEventListener('error', (event) => {
                captureError(event.error || event.message, {
                    isFatal: true,
                    location: event.filename,
                    lineNumber: event.lineno
                });
            });

            log.info('Window error listener registered');
        }
    } catch (error) {
        log.warn('Unable to register global error handler:', error);
    }

    log.info('Monitoring system initialized');
};

// Registrar navegación
export const trackNavigation = (routeName: string): void => {
    navigationHistory.push(routeName);

    // Mantener solo un historial limitado
    if (navigationHistory.length > MAX_NAV_HISTORY) {
        navigationHistory.shift();
    }

    log.debug(`Navigation to: ${routeName}`);
};

// Registrar errores
export const captureError = (
    error: Error | string,
    additionalInfo?: Record<string, any>
): string => {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;

    const timestamp = new Date().toISOString();
    const errorId = generateUniqueId();

    const errorInfo: ErrorInfo = {
        id: errorId,
        timestamp,
        error: errorMessage,
        componentStack: errorStack,
        additionalInfo
    };

    // Registrar en el log
    log.error(`Error captured [${errorId}]: ${errorMessage}`);

    // Almacenar en memoria
    errorLogs.push(errorInfo);

    // Limitar la cantidad de errores almacenados
    if (errorLogs.length > MAX_ERROR_LOGS) {
        errorLogs.shift();
    }

    // Persistir en disco de forma asíncrona
    saveErrorsToFile();

    return errorId;
};

// Guardar errores en el archivo
const saveErrorsToFile = async (): Promise<void> => {
    try {
        await ensureErrorDirectory();

        // Escribir en el archivo de errores
        await FileSystem.writeAsStringAsync(
            ERROR_FILE,
            JSON.stringify({
                errors: errorLogs,
                deviceInfo: getDeviceInfo(),
                appVersion: Constants.expoConfig?.version ?? '0.0.0',
                buildId: Application.nativeBuildVersion ?? '0',
                timestamp: new Date().toISOString()
            }, null, 2),
            { encoding: FileSystem.EncodingType.UTF8 }
        );
    } catch (error) {
        console.error('Error saving errors to file:', error);
    }
};

// Metricas de rendimiento
export const startMeasure = (name: string): string => {
    const id = generateUniqueId();
    performanceMetrics[id] = {
        id,
        name,
        startTime: performance.now()
    };
    return id;
};

export const endMeasure = (id: string): PerformanceMetric | null => {
    if (!performanceMetrics[id]) {
        log.warn(`Performance metric with id ${id} not found`);
        return null;
    }

    const metric = performanceMetrics[id];
    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    log.debug(`Performance: ${metric.name} took ${metric.duration.toFixed(2)}ms`);

    return { ...metric };
};

// Obtener estado actual del monitoreo
export const getMonitoringStatus = (): Record<string, any> => {
    return {
        navigationHistory: [...navigationHistory],
        errorCount: errorLogs.length,
        lastError: errorLogs.length > 0 ? errorLogs[errorLogs.length - 1] : null,
        deviceInfo: getDeviceInfo(),
        performanceMetrics: Object.values(performanceMetrics)
            .filter(metric => metric.duration !== undefined)
            .slice(-10)
    };
};

// Obtener el reporte de errores completo
export const getErrorReport = async (): Promise<string | null> => {
    try {
        const fileInfo = await FileSystem.getInfoAsync(ERROR_FILE);
        if (!fileInfo.exists) return null;

        return await FileSystem.readAsStringAsync(ERROR_FILE);
    } catch (error) {
        log.error('Error reading error report:', error);
        return null;
    }
};

// Limpiar informes de error
export const clearErrorReports = async (): Promise<boolean> => {
    try {
        const fileInfo = await FileSystem.getInfoAsync(ERROR_FILE);
        if (fileInfo.exists) {
            await FileSystem.deleteAsync(ERROR_FILE, { idempotent: true });
        }

        // Limpiar memoria
        errorLogs.length = 0;

        // Crear un nuevo archivo de error vacío
        await ensureErrorDirectory();
        await FileSystem.writeAsStringAsync(
            ERROR_FILE,
            JSON.stringify({
                errors: [],
                deviceInfo: getDeviceInfo(),
                timestamp: new Date().toISOString()
            }, null, 2)
        );

        return true;
    } catch (error) {
        log.error('Error clearing error reports:', error);
        return false;
    }
};

export default {
    initMonitoring,
    trackNavigation,
    captureError,
    startMeasure,
    endMeasure,
    getMonitoringStatus,
    getErrorReport,
    clearErrorReports
}; 