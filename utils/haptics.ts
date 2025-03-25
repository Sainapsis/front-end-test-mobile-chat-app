import * as Haptics from 'expo-haptics';

/**
 * Utilidades para proporcionar retroalimentación háptica en acciones importantes
 */

/**
 * Reproduce un efecto háptico de selección (leve)
 * Utilizar para: navegación, selección de elementos, pulsación de botones, etc.
 */
export function selectionFeedback() {
    try {
        Haptics.selectionAsync();
    } catch (error) {
        console.warn('Error al proporcionar retroalimentación háptica:', error);
    }
}

/**
 * Reproduce un efecto háptico ligero
 * Utilizar para: confirmaciones, acciones exitosas pequeñas, etc.
 */
export function lightFeedback() {
    try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
        console.warn('Error al proporcionar retroalimentación háptica:', error);
    }
}

/**
 * Reproduce un efecto háptico medio
 * Utilizar para: envío de mensajes, acciones importantes, etc.
 */
export function mediumFeedback() {
    try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
        console.warn('Error al proporcionar retroalimentación háptica:', error);
    }
}

/**
 * Reproduce un efecto háptico fuerte
 * Utilizar para: acciones críticas, confirmaciones importantes, etc.
 */
export function heavyFeedback() {
    try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
        console.warn('Error al proporcionar retroalimentación háptica:', error);
    }
}

/**
 * Reproduce un efecto háptico de éxito (patrón de notificación)
 * Utilizar para: operaciones exitosas, confirmaciones positivas, etc.
 */
export function successFeedback() {
    try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
        console.warn('Error al proporcionar retroalimentación háptica:', error);
    }
}

/**
 * Reproduce un efecto háptico de error (patrón de notificación)
 * Utilizar para: errores, validaciones fallidas, etc.
 */
export function errorFeedback() {
    try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
        console.warn('Error al proporcionar retroalimentación háptica:', error);
    }
}

/**
 * Reproduce un efecto háptico de advertencia (patrón de notificación)
 * Utilizar para: advertencias, confirmaciones que requieren atención, etc.
 */
export function warningFeedback() {
    try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
        console.warn('Error al proporcionar retroalimentación háptica:', error);
    }
} 