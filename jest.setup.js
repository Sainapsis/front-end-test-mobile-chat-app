// Configuración de Jest para mocks y configuraciones globales

// Mensaje de carga
console.log('Setting up Jest...');

// Mock para react-native
jest.mock('react-native', () => {
    const ReactNative = jest.requireActual('react-native');

    // Mock para todas las APIs nativas
    return {
        ...ReactNative,
        NativeModules: {
            ...ReactNative.NativeModules,
            ExpoUpdates: {
                __constants: { manifest: { sdkVersion: '49.0.0' } }
            },
            RNGestureHandlerModule: {
                attachGestureHandler: jest.fn(),
                createGestureHandler: jest.fn(),
                dropGestureHandler: jest.fn(),
                updateGestureHandler: jest.fn(),
                State: {},
                Directions: {}
            },
            UIManager: {
                RCTView: () => ({
                    directEventTypes: {},
                }),
                getViewManagerConfig: jest.fn(),
                getConstantsForViewManager: jest.fn(),
            },
            NativeAnimatedModule: {
                startOperationBatch: jest.fn(),
                finishOperationBatch: jest.fn(),
                createAnimatedNode: jest.fn(),
                getValue: jest.fn(() => Promise.resolve(0)),
            },
            SettingsManager: {
                settings: {},
                getConstants: () => ({}),
            },
            PlatformConstants: {
                isTesting: true,
            },
            Timing: {
                createTimer: jest.fn(),
            },
        },
        Platform: {
            ...ReactNative.Platform,
            OS: 'ios',
            Version: 14,
            isTesting: true,
            select: (obj) => obj.ios || obj.default,
        },
        Dimensions: {
            ...ReactNative.Dimensions,
            get: jest.fn().mockReturnValue({
                width: 375,
                height: 812,
                scale: 1,
                fontScale: 1,
            }),
        },
        NativeEventEmitter: jest.fn().mockImplementation(() => ({
            addListener: jest.fn(),
            removeListener: jest.fn(),
        })),
        PixelRatio: {
            ...ReactNative.PixelRatio,
            get: jest.fn(() => 1),
            getFontScale: jest.fn(() => 1),
            getPixelSizeForLayoutSize: jest.fn((size) => size),
            roundToNearestPixel: jest.fn((size) => size),
        },
        Alert: {
            ...ReactNative.Alert,
            alert: jest.fn(),
        },
        AppState: {
            ...ReactNative.AppState,
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            currentState: 'active',
        },
    };
});

// Mocks para Expo
jest.mock('expo-font', () => ({
    loadAsync: jest.fn().mockResolvedValue(true),
    isLoaded: jest.fn().mockReturnValue(true),
    isLoading: jest.fn().mockReturnValue(false),
    useFonts: jest.fn().mockReturnValue([true, null]),
}));

jest.mock('expo-asset', () => ({
    Asset: {
        loadAsync: jest.fn().mockResolvedValue([]),
    },
}));

jest.mock('expo-splash-screen', () => ({
    preventAutoHideAsync: jest.fn().mockResolvedValue(true),
    hideAsync: jest.fn().mockResolvedValue(true),
}));

jest.mock('expo-router', () => ({
    useRouter: jest.fn().mockReturnValue({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        setParams: jest.fn(),
    }),
    useLocalSearchParams: jest.fn().mockReturnValue({}),
    useSegments: jest.fn().mockReturnValue([]),
    useNavigation: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
    documentDirectory: 'file://document-directory/',
    cacheDirectory: 'file://cache-directory/',
    downloadAsync: jest.fn().mockResolvedValue({ uri: 'file://downloaded-file.jpg' }),
    getInfoAsync: jest.fn().mockResolvedValue({ exists: true, isDirectory: false }),
    makeDirectoryAsync: jest.fn().mockResolvedValue(true),
    readDirectoryAsync: jest.fn().mockResolvedValue(['file1.jpg', 'file2.jpg']),
    deleteAsync: jest.fn().mockResolvedValue(true),
}));

jest.mock('expo-crypto', () => ({
    digestStringAsync: jest.fn().mockImplementation((algorithm, data) => {
        return Promise.resolve(`mocked-hash-${data}`);
    }),
}));

jest.mock('expo-av', () => ({
    Audio: {
        Sound: {
            createAsync: jest.fn().mockResolvedValue({
                sound: {
                    setOnPlaybackStatusUpdate: jest.fn(),
                    playAsync: jest.fn().mockResolvedValue({}),
                    pauseAsync: jest.fn().mockResolvedValue({}),
                    unloadAsync: jest.fn().mockResolvedValue({}),
                    setPositionAsync: jest.fn().mockResolvedValue({}),
                    getStatusAsync: jest.fn().mockResolvedValue({
                        isLoaded: true,
                        isPlaying: false,
                        positionMillis: 0,
                        durationMillis: 10000,
                    }),
                },
                status: {
                    isLoaded: true,
                    durationMillis: 10000,
                },
            }),
        },
        setAudioModeAsync: jest.fn().mockResolvedValue({}),
        Recording: {
            createAsync: jest.fn().mockResolvedValue({
                recording: {
                    setOnRecordingStatusUpdate: jest.fn(),
                    prepareToRecordAsync: jest.fn().mockResolvedValue({}),
                    startAsync: jest.fn().mockResolvedValue({}),
                    pauseAsync: jest.fn().mockResolvedValue({}),
                    stopAndUnloadAsync: jest.fn().mockResolvedValue({}),
                    getStatusAsync: jest.fn().mockResolvedValue({
                        isRecording: false,
                        durationMillis: 5000,
                    }),
                },
            }),
        },
    },
}));

// Mock para @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
    const iconMock = () => 'Icon';
    return {
        AntDesign: iconMock,
        Entypo: iconMock,
        EvilIcons: iconMock,
        Feather: iconMock,
        FontAwesome: iconMock,
        FontAwesome5: iconMock,
        Fontisto: iconMock,
        Foundation: iconMock,
        Ionicons: iconMock,
        MaterialCommunityIcons: iconMock,
        MaterialIcons: iconMock,
        Octicons: iconMock,
        SimpleLineIcons: iconMock,
        Zocial: iconMock,
    };
});

// Mocks para componentes personalizados de la aplicación
jest.mock('@/components/OptimizedImage', () => () => 'OptimizedImage', { virtual: true });
jest.mock('@/components/VoiceMessagePlayer', () => () => 'VoiceMessagePlayer', { virtual: true });

// Mock para Expo
jest.mock('expo-status-bar', () => ({
    StatusBar: () => 'StatusBar',
}));

// Mock para Expo SQLite (DB)
jest.mock('expo-sqlite', () => ({
    openDatabase: jest.fn(() => ({
        transaction: jest.fn(callback => {
            callback({
                executeSql: jest.fn((_, __, success) => success && success(_, [])),
            });
        }),
    })),
}));

// Mock para react-native-reanimated
jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');
    Reanimated.default.call = () => { };
    return Reanimated;
});

// Suprimir warnings de RN
jest.mock('react-native/Libraries/LogBox/LogBox', () => ({
    ignoreLogs: () => { },
    ignoreAllLogs: () => { },
}));

// Preparar variables globales
global.fetch = jest.fn();

// Mocks para timers y animaciones
jest.useFakeTimers();

// Limpiar mocks después de cada prueba
afterEach(() => {
    jest.clearAllMocks();
});

console.log('Jest setup complete!'); 