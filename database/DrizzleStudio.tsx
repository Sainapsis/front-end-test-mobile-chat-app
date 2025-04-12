import React from 'react';
import { View } from 'react-native';
import * as SQLite from 'expo-sqlite';

// We'll use this as a placeholder in case the plugin isn't available
const NoopStudio = () => null;

// Import only in development
let useDrizzleStudio: any = () => null;
let isStudioAvailable = false;
let studioLoadError: string | null = null;

// Only try to load the plugin in development mode
if (__DEV__) {
  try {
    // Define el path específico del módulo para evitar problemas de resolución
    const expoDrizzleStudioPlugin = require('expo-drizzle-studio-plugin');

    if (expoDrizzleStudioPlugin && expoDrizzleStudioPlugin.useDrizzleStudio) {
      useDrizzleStudio = expoDrizzleStudioPlugin.useDrizzleStudio;
      isStudioAvailable = true;
      console.log('Drizzle Studio plugin loaded successfully');
    } else {
      studioLoadError = 'Plugin found but useDrizzleStudio is not available';
      console.warn('Drizzle Studio plugin found but useDrizzleStudio is not available');
    }
  } catch (error: any) {
    studioLoadError = error?.message || 'Unknown error loading Drizzle Studio';
    console.warn('Drizzle Studio plugin not available:', error?.message || 'Unknown error');
    // Asignar la función noop para mantener la consistencia
    useDrizzleStudio = NoopStudio;
  }
}

// Componente contenedor para el hook
const DrizzleStudioWrapper = ({ db }: { db: any }) => {
  // Solo intentamos importar en modo dev
  if (__DEV__) {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { useDrizzleStudio } = require('expo-drizzle-studio-plugin');
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useDrizzleStudio(db);
    } catch (error) {
      // Solo registrar en consola, sin mostrar nada en UI
      console.warn('Error using Drizzle Studio hook:', error);
    }
  }
  return null;
};

/**
 * Componente invisible que proporciona acceso a Drizzle Studio durante desarrollo.
 * No muestra ninguna interfaz para no interferir con la experiencia del usuario.
 */
export function DrizzleStudioDevTool() {
  // Solo cargar en desarrollo
  if (!__DEV__) return null;

  try {
    // Intentar conectar con la base de datos
    const db = SQLite.openDatabaseSync('chat-app.db');
    return <DrizzleStudioWrapper db={db} />;
  } catch (err) {
    // En caso de error, no mostrar nada en la UI
    console.warn('Failed to initialize Drizzle Studio:', err);
    return null;
  }
} 