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
/**
 * Initializes the database by creating all necessary tables
 * @throws Error if database initialization fails
 */
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
        text TEXT,
        timestamp INTEGER NOT NULL,
        edited_at INTEGER,
        has_multimedia INTEGER DEFAULT 0,
        multimedia_type TEXT,
        multimedia_url TEXT,
        thumbnail_url TEXT,
        duration INTEGER,
        size INTEGER,
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

/**
 * Searches messages in the database based on search term and user ID
 * @param searchTerm - Text to search for in messages
 * @param userId - ID of the user performing the search
 * @returns Array of matching messages
 * @throws Error if search fails
 */
export async function searchMessages(searchTerm: string, userId: string) {
  try {
    console.log('Search params:', { searchTerm, userId });

    const query = `
      SELECT 
        m.*,
        c.id AS chat_id,
        (SELECT COALESCE(u.name, cph.user_id) 
         FROM users u
         LEFT JOIN chat_participants_history cph ON u.id = cph.user_id
         WHERE (cph.chat_id = m.chat_id OR u.id IN (
           SELECT user_id FROM chat_participants WHERE chat_id = m.chat_id
         ))
         AND u.id != ?
         ORDER BY cph.left_at DESC LIMIT 1) AS chat_partner_name,
        (SELECT GROUP_CONCAT(COALESCE(u2.name, cph2.user_id), ', ') 
         FROM users u2
         LEFT JOIN chat_participants_history cph2 ON u2.id = cph2.user_id
         WHERE cph2.chat_id = m.chat_id OR u2.id IN (
           SELECT user_id FROM chat_participants WHERE chat_id = m.chat_id
         )) AS participant_names
      FROM messages m
      INNER JOIN chats c ON m.chat_id = c.id
      INNER JOIN chat_participants cp ON c.id = cp.chat_id
      INNER JOIN users u ON cp.user_id = u.id
      LEFT JOIN deleted_messages dm ON m.id = dm.message_id AND dm.user_id = ?
      WHERE cp.user_id = ?
        AND m.text LIKE ?
        AND dm.id IS NULL
      GROUP BY m.id, c.id
      ORDER BY m.timestamp DESC
      LIMIT 50
    `;

    const stmt = await sqlite.prepareAsync(query);
    const params = [userId, userId, userId, `%${searchTerm}%`];
    const statement = await stmt.executeAsync(params);
    const results = await statement.getAllAsync();
    
    await stmt.finalizeAsync();
    return results;
  } catch (error) {
    console.error('Error searching messages:', error);
    throw error;
  }
}

/**
 * Edits an existing message in the database
 * @param messageId - ID of the message to edit
 * @param newText - New text content for the message
 * @throws Error if message editing fails
 */
export async function editMessage(messageId: string, newText: string) {
  try {
    console.log('Editing message:', { messageId, newText });

    const query = `
      UPDATE messages
      SET text = ?, edited_at = ?
      WHERE id = ?
    `;

    const stmt = await sqlite.prepareAsync(query);
    const params = [newText, Date.now(), messageId];
    await stmt.executeAsync(params);
    await stmt.finalizeAsync();

    console.log('Message edited successfully!');
  } catch (error) {
    console.error('Error editing message:', error);
    throw error;
  }
}

/**
 * Drops all tables in the database (for development/testing purposes)
 * @throws Error if table dropping fails
 */
export async function dropTables() {
  try {
    console.log('Dropping existing tables...');
    await sqlite.execAsync(`DROP TABLE IF EXISTS message_reactions;`);
    await sqlite.execAsync(`DROP TABLE IF EXISTS deleted_messages;`);
    await sqlite.execAsync(`DROP TABLE IF EXISTS chat_participants_history;`);
    await sqlite.execAsync(`DROP TABLE IF EXISTS messages;`);
    await sqlite.execAsync(`DROP TABLE IF EXISTS chat_participants;`);
    await sqlite.execAsync(`DROP TABLE IF EXISTS chats;`);
    await sqlite.execAsync(`DROP TABLE IF EXISTS users;`);
    console.log('All tables dropped successfully!');
  } catch (error) {
    console.error('Error dropping tables:', error);
    throw error;
  }
}





