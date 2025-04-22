const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Agregar soporte para extensiones SQL
config.resolver.sourceExts.push('sql');

// Asegurar que manejamos correctamente los módulos de Drizzle
config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
};

// Asegurar que la memoria caché de Metro incluye todos los módulos necesarios
config.resetCache = false;

module.exports = config; 