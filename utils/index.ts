// Sistemas de logging y monitoreo
import log from './logger';
import monitoring from './monitoring';
import ErrorBoundary from './errorBoundary';

// Funciones de utilidad para logging
import {
    getLogFileContents,
    clearLogs,
    getDeviceInfo
} from './logger';

// Funciones de monitoreo
import {
    initMonitoring,
    trackNavigation,
    captureError,
    startMeasure,
    endMeasure,
    getMonitoringStatus,
    getErrorReport,
    clearErrorReports
} from './monitoring';

// Exportación de los módulos principales
export {
    log,
    monitoring,
    ErrorBoundary
};

// Exportación de funciones específicas para acceso directo
export {
    // Logger
    getLogFileContents,
    clearLogs,
    getDeviceInfo,

    // Monitoreo
    initMonitoring,
    trackNavigation,
    captureError,
    startMeasure,
    endMeasure,
    getMonitoringStatus,
    getErrorReport,
    clearErrorReports
};

/**
 * Sistema de logging y monitoreo para la aplicación de chat móvil
 * 
 * Este módulo proporciona funcionalidades para:
 * - Logging estructurado con diferentes niveles (debug, info, warn, error)
 * - Almacenamiento de logs en archivos (en dispositivos físicos)
 * - Captura y reporte de errores
 * - Monitoreo de navegación
 * - Medición de rendimiento
 * - ErrorBoundary para capturar errores en componentes React
 * 
 * Uso básico:
 * 
 * ```typescript
 * // Inicialización
 * import { initMonitoring, log } from '@/utils';
 * 
 * // Para logs
 * log.debug('Mensaje de debug');
 * log.info('Evento importante');
 * log.warn('Advertencia');
 * log.error('Error crítico', { contexto: 'adicional' });
 * 
 * // Para monitoreo
 * trackNavigation('PantallaPrincipal');
 * 
 * // Capturar errores manualmente
 * try {
 *   // código que puede fallar
 * } catch (error) {
 *   captureError(error, { contexto: 'adicional' });
 * }
 * 
 * // Medición de rendimiento
 * const metricId = startMeasure('operacionCostosa');
 * // realizar operación
 * endMeasure(metricId);
 * ```
 */

// Exportación por defecto para el módulo completo
export default {
    log,
    monitoring,
    ErrorBoundary,

    // Funciones de utilidad
    getLogFileContents,
    clearLogs,
    getDeviceInfo,
    initMonitoring,
    trackNavigation,
    captureError,
    startMeasure,
    endMeasure,
    getMonitoringStatus,
    getErrorReport,
    clearErrorReports
}; 