// Mock para AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => require('./__mocks__/@react-native-async-storage/async-storage'));

// Otros mocks globales que puedas necesitar
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');