import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';
import * as schema from '@/providers/database/schema';

// Open a database connection using the correct async API from Expo SQLite
const sqlite = SQLite.openDatabaseSync('chat-app.db');

// Create the Drizzle client
export const db = drizzle(sqlite, { schema });

// Initialize function to create tables if they don't exist
export async function initializeDatabase() {
  try {''
    console.log('Creating users table...');
    await sqlite.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        username TEXT NOT NULL,
        avatar TEXT,
        status TEXT NOT NULL
      );
    `);
    
    console.log('Creating chats table...');
    await sqlite.execAsync(`
      CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY, 
        last_message TEXT,
        chat_name TEXT NOT NULL,
        last_message_time INTEGER,
        unread_messages INTEGER,
        last_message_sender TEXT,
        last_message_sender_id TEXT,
        chat_status TEXT
      );
    `);
    
    console.log('Creating chat_participants table...');
    await sqlite.execAsync(`
      CREATE TABLE IF NOT EXISTS chat_participants (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        unreaded_messages INTEGER NOT NULL,
        FOREIGN KEY (chat_id) REFERENCES chats (id)
      );
    `);
    
    console.log('Creating messages table...');
    await sqlite.execAsync(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        sender_name TEXT NOT NULL,
        text TEXT,
        timestamp INTEGER NOT NULL,
        response_text TEXT,
        media_uri TEXT,
        readed INTEGER NOT NULL
      );
    `);

    // console.log('Creating messages read by table...');
    // await sqlite.execAsync(`
    //   CREATE TABLE IF NOT EXISTS messages_read_by (
    //     id TEXT PRIMARY KEY,
    //     message_id TEXT NOT NULL,
    //     user_id TEXT NOT NULL, 
    //     chat_id TEXT NOT NULL,
    //     readed INTEGER NOT NULL
    //   );
    // `);
    
    console.log('All tables created successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
} 