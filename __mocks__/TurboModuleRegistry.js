/**
 * Mock para TurboModuleRegistry usado en los tests
 */
const TurboModuleRegistry = {
    get: jest.fn(() => {
        return {};
    }),
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

module.exports = TurboModuleRegistry; 