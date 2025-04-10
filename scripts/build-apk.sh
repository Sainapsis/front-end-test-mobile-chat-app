#!/bin/bash

echo "🚀 Iniciando build del APK..."

# Limpiar la caché de expo
echo "🧹 Limpiando caché..."
expo start --clear

# Generar el APK
echo "📦 Generando APK..."
eas build -p android --profile preview --local

# Verificar si el build fue exitoso
if [ $? -eq 0 ]; then
    echo "✅ APK generado exitosamente!"
    echo "📱 El APK se encuentra en: android/app/build/outputs/apk/release/app-release.apk"
else
    echo "❌ Error al generar el APK"
    exit 1
fi 