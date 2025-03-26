import { initializeDatabase } from "@/database/db";
import * as SQLite from "expo-sqlite";

const sqlite = SQLite.openDatabaseSync("chat-app.db");

export async function resetDatabase() {
  try {
    console.log("Dropping all tables...");
    await sqlite.execAsync(`
      PRAGMA foreign_keys=off;
      
      DROP TABLE IF EXISTS messages;
      DROP TABLE IF EXISTS chat_participants;
      DROP TABLE IF EXISTS chats;
      DROP TABLE IF EXISTS users;
      
      PRAGMA foreign_keys=on;
    `);

    console.log("Tables dropped successfully!");

    await initializeDatabase();

    console.log("Database reset complete!");
  } catch (error) {
    console.error("Error resetting database:", error);
    throw error;
  }
}
