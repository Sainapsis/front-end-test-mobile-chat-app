console.log('Setting up Jest...');

// Crear mock global para TurboModuleRegistry antes que todo
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => {
    return {
        getEnforcing: jest.fn((name) => {
            if (name === 'SettingsManager') {
                return {
                    settings: {},
                    getConstants: () => ({})
                };
            }
            return {};
        }),
    };
});

// Crear mock para clearImageCache
const clearImageCache = jest.fn().mockImplementation(() => Promise.resolve());

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
        Settings: {
            get: jest.fn(),
            set: jest.fn(),
        },
        Image: jest.fn().mockImplementation(({ testID, source, style }) => {
            return { type: 'Image', props: { testID, source, style } };
        }),
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
    Link: ({ children }) => children,
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
    const iconMock = ({ name, size, color }) => null;
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

// Mock para paths con @ 
jest.mock('@/components/OptimizedImage', () => {
    const mockClearImageCache = jest.fn().mockImplementation(() => Promise.resolve());
    const mockComponent = jest.fn().mockImplementation(() => null);
    mockComponent.clearImageCache = mockClearImageCache;
    return mockComponent;
}, { virtual: true });

jest.mock('@/components/VoiceMessagePlayer', () => jest.fn().mockImplementation(() => null), { virtual: true });
jest.mock('@/components/MessageBubble', () => jest.fn().mockImplementation(() => null), { virtual: true });
jest.mock('@/components/ThemedText', () => jest.fn().mockImplementation(() => null), { virtual: true });
jest.mock('@/app/ChatList', () => jest.fn().mockImplementation(() => null), { virtual: true });
jest.mock('@/hooks/ChatsProvider', () => ({
    useChats: jest.fn().mockReturnValue({
        chats: [],
        loading: false,
        getChat: jest.fn(),
        addMessage: jest.fn(),
        editMessage: jest.fn(),
        deleteMessage: jest.fn()
    })
}), { virtual: true });

// Mock para Expo
jest.mock('expo-status-bar', () => ({
    StatusBar: () => null,
}));

// Solución para el problema participantData.map
jest.mock('@/hooks/db/useChatsDb', () => {
    const original = jest.requireActual('@/hooks/db/useChatsDb');
    return {
        ...original,
        useChatsDb: jest.fn().mockReturnValue({
            userChats: [],
            loading: false,
            createChat: jest.fn().mockResolvedValue({ id: 'new-chat-id' }),
            addMessage: jest.fn().mockResolvedValue(true),
            loadMoreMessages: jest.fn().mockResolvedValue([]),
            markMessageAsRead: jest.fn().mockResolvedValue(true),
            deleteMessage: jest.fn().mockResolvedValue(true),
            editMessage: jest.fn().mockResolvedValue(true),
            forwardMessage: jest.fn().mockResolvedValue(true)
        })
    };
}, { virtual: true });

// Limpiar todos los mocks después de cada prueba (esto es seguro en la configuración global)
afterEach(() => {
    jest.clearAllMocks();
});

console.log('Jest setup complete!'); 