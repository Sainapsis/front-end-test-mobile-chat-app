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
    
    console.log('Creating chat_participants table...');
    await sqlite.execAsync(`
      CREATE TABLE IF NOT EXISTS chat_participants (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        FOREIGN KEY (chat_id) REFERENCES chats (id)
      );
    `);
    
    console.log('Creating messages table...');
    await sqlite.execAsync(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        text TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        FOREIGN KEY (chat_id) REFERENCES chats (id)
      );
    `);
    
    console.log('Creating chat_participants_history table...');
    await sqlite.execAsync(`
      CREATE TABLE IF NOT EXISTS chat_participants_history (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        left_at INTEGER NOT NULL,
        FOREIGN KEY (chat_id) REFERENCES chats (id)
      );
    `);
    
    console.log('Creating deleted_messages table...');
    await sqlite.execAsync(`
      CREATE TABLE IF NOT EXISTS deleted_messages (
        id TEXT PRIMARY KEY,
        message_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        chat_id TEXT NOT NULL,
        deleted_at INTEGER NOT NULL,
        FOREIGN KEY (message_id) REFERENCES messages (id),
        FOREIGN KEY (chat_id) REFERENCES chats (id)
      );
    `);

    console.log('Creating message_reactions table...');
    await sqlite.execAsync(`
      CREATE TABLE IF NOT EXISTS message_reactions (
        id TEXT PRIMARY KEY,
        message_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        emoji TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (message_id) REFERENCES messages (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `);

    console.log('All tables created successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
