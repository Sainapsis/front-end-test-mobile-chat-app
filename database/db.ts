import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';
import * as schema from './schema';

// Verifica que openDatabaseSync existe antes de usarlo
if (!SQLite.openDatabaseSync) {
  throw new Error("expo-sqlite no soporta openDatabaseSync en esta versión.");
}

// Abre la base de datos
const sqlite = SQLite.openDatabaseSync('chat-app.db');

// Crea el cliente Drizzle
export const db = drizzle(sqlite, { schema });

// Función para inicializar la base de datos
export async function initializeDatabase() {
  try {
    if (!sqlite) {
      throw new Error('Database instance is not available.');
    }

    console.log('Creating users table...');
    await sqlite.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        avatar TEXT NOT NULL,
        status TEXT NOT NULL
      );
    `);

    console.log('Creating chats table...');
    await sqlite.execAsync(`
      CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY
      );
    `);

    console.log('All tables created successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
