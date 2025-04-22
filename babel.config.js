module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ["inline-import", { "extensions": [".sql"] }],
      // Soporte para módulos que podrían ser cargados dinámicamente
      ["module-resolver", {
        "alias": {
          "@": "./",
          "@/app": "./app",
          "@/components": "./components",
          "@/hooks": "./hooks",
          "@/database": "./database"
        }
      }]
    ]
  };
}; 