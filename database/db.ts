import { drizzle } from "drizzle-orm/expo-sqlite";
import * as SQLite from "expo-sqlite";
import * as schema from "./schema";

// Open a database connection using the correct async API from Expo SQLite
const sqlite = SQLite.openDatabaseSync("chat-app.db");

// Create the Drizzle client
export const db = drizzle(sqlite, { schema });

// Initialize function to create tables if they don't exist
export async function initializeDatabase() {
  try {
    console.log("Creating users table...");
    await sqlite.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        avatar TEXT NOT NULL,
        status TEXT NOT NULL
      );
    `);

    console.log("Creating chats table...");
    await sqlite.execAsync(`
      CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY
      );
    `);

    console.log("Creating chat_participants table...");
    await sqlite.execAsync(`
      CREATE TABLE IF NOT EXISTS chat_participants (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        FOREIGN KEY (chat_id) REFERENCES chats (id)
      );
    `);

    // Eliminar las tablas si existen
    console.log("Dropping existing tables...");
    await sqlite.execAsync(`DROP TABLE IF EXISTS message_reactions;`);
    await sqlite.execAsync(`DROP TABLE IF EXISTS messages;`);

    // Crear la tabla de mensajes
    console.log("Creating messages table...");
    await sqlite.execAsync(`
      CREATE TABLE messages (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        text TEXT,
        media_url TEXT,
        media_type TEXT,
        media_thumbnail TEXT,
        voice_url TEXT,
        voice_duration INTEGER,
        is_voice_message INTEGER NOT NULL DEFAULT 0,
        timestamp INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'sent',
        is_edited INTEGER NOT NULL DEFAULT 0,
        edited_at INTEGER,
        FOREIGN KEY (chat_id) REFERENCES chats (id)
      );
    `);

    // Crear la tabla de reacciones
    console.log("Creating message_reactions table...");
    await sqlite.execAsync(`
      CREATE TABLE message_reactions (
        id TEXT PRIMARY KEY,
        message_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        emoji TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        FOREIGN KEY (message_id) REFERENCES messages (id)
      );
    `);

    // Verificar si las columnas multimedia existen
    const tableInfo = await sqlite.getFirstAsync(`
      SELECT name FROM pragma_table_info('messages') WHERE name = 'media_url';
    `);

    if (!tableInfo) {
      console.log("Adding media columns to messages table...");
      await sqlite.execAsync(`
        ALTER TABLE messages ADD COLUMN media_url TEXT;
        ALTER TABLE messages ADD COLUMN media_type TEXT;
        ALTER TABLE messages ADD COLUMN media_thumbnail TEXT;
      `);
    }

    console.log("All tables created successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}
