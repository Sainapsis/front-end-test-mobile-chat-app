module.exports = {
    preset: 'jest-expo',
    testEnvironment: 'jsdom',
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@testing-library)'
    ],
    setupFiles: [
        './jest-simple.setup.js'
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    collectCoverage: true,
    collectCoverageFrom: [
        '**/*.{js,jsx,ts,tsx}',
        '!**/node_modules/**',
        '!**/babel.config.js',
        '!**/metro.config.js',
        '!**/coverage/**',
        '!**/android/**',
        '!**/ios/**',
    ],
    testMatch: [
        '**/__tests__/**/*.test.ts?(x)',
        '**/__tests__/**/*.spec.ts?(x)'
    ],
}; 