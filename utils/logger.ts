import { logger } from 'react-native-logs';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';

// Configuración para diferentes entornos
const isProduction = process.env.NODE_ENV === 'production' || !__DEV__;

// Directorio para archivos de log
const LOG_DIRECTORY = `${FileSystem.documentDirectory}logs/`;
const LOG_FILE = `${LOG_DIRECTORY}app.log`;

// Función para asegurar que el directorio de logs exista
export const ensureLogDirectory = async (): Promise<void> => {
    try {
        const dirInfo = await FileSystem.getInfoAsync(LOG_DIRECTORY);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(LOG_DIRECTORY, { intermediates: true });
        }
    } catch (error) {
        console.error('Error creating log directory:', error);
    }
};

// Configuración del logger
const config = {
    severity: isProduction ? 'info' : 'debug',
    transport: (props: any) => {
        // Extraer la información relevante
        const { msg, level, rawMsg } = props;
        const timestamp = new Date().toISOString();

        // Formato del mensaje
        const formattedMsg = `${timestamp} [${level.text}] ${msg}`;

        // En producción o cuando se ejecuta en un dispositivo, guardar en archivo
        if (isProduction || Platform.OS !== 'web') {
            saveLogToFile(formattedMsg);
        }

        // Mostrar en consola según el nivel
        switch (level.text) {
            case 'debug':
                if (!isProduction) console.debug(formattedMsg);
                break;
            case 'info':
                console.info(formattedMsg);
                break;
            case 'warn':
                console.warn(formattedMsg);
                break;
            case 'error':
                console.error(formattedMsg);
                break;
            default:
                console.log(formattedMsg);
        }
    },
    transportOptions: {
        colors: {
            debug: "blueBright",
            info: "greenBright",
            warn: "yellowBright",
            error: "redBright",
        },
    },
    dateFormat: 'time',
    printLevel: true,
    printDate: true,
    enabled: true,
};

// Guardar logs en archivo (solo en dispositivos móviles)
const saveLogToFile = async (message: string): Promise<void> => {
    try {
        // Solo almacenar en archivo en dispositivos reales
        if (Platform.OS === 'web') return;

        // Asegurar que el directorio existe
        await ensureLogDirectory();

        // Agregar el mensaje al archivo de log con opciones de escritura
        const options: FileSystem.WritingOptions = {
            encoding: FileSystem.EncodingType.UTF8
        };

        // Verificar si el archivo existe
        const fileExists = (await FileSystem.getInfoAsync(LOG_FILE)).exists;

        if (fileExists) {
            // Si existe, leer el contenido actual y agregar el nuevo mensaje
            const currentContent = await FileSystem.readAsStringAsync(LOG_FILE);
            await FileSystem.writeAsStringAsync(
                LOG_FILE,
                currentContent + message + '\n',
                options
            );
        } else {
            // Si no existe, crear nuevo archivo
            await FileSystem.writeAsStringAsync(
                LOG_FILE,
                message + '\n',
                options
            );
        }
    } catch (error) {
        console.error('Error saving log to file:', error);
    }
};

// Obtener información del dispositivo y aplicación para incluir en logs
export const getDeviceInfo = (): string => {
    const appName = Constants.expoConfig?.name || 'Unknown App';
    const appVersion = Constants.expoConfig?.version || '0.0.0';
    const device = Platform.OS;
    const deviceVersion = Platform.Version;

    return `${appName}@${appVersion} (${device} ${deviceVersion})`;
};

// Crear una instancia del logger
export const log = logger.createLogger(config);

// Configurar el logger con información del dispositivo
log.info(`Logger initialized for ${getDeviceInfo()}`);

// Método para obtener el archivo de logs completo (útil para compartir logs)
export const getLogFileContents = async (): Promise<string | null> => {
    try {
        if (Platform.OS === 'web') return 'Logs not available on web platform';

        const fileInfo = await FileSystem.getInfoAsync(LOG_FILE);
        if (!fileInfo.exists) return null;

        return await FileSystem.readAsStringAsync(LOG_FILE);
    } catch (error) {
        console.error('Error reading log file:', error);
        return null;
    }
};

// Método para limpiar los logs (útil para gestión de almacenamiento)
export const clearLogs = async (): Promise<boolean> => {
    try {
        if (Platform.OS === 'web') return true;

        const fileInfo = await FileSystem.getInfoAsync(LOG_FILE);
        if (fileInfo.exists) {
            await FileSystem.deleteAsync(LOG_FILE, { idempotent: true });
        }

        // Crear un nuevo archivo de log vacío
        await FileSystem.writeAsStringAsync(
            LOG_FILE,
            `Log file created at ${new Date().toISOString()}\n`
        );

        return true;
    } catch (error) {
        console.error('Error clearing logs:', error);
        return false;
    }
};

export default log; 