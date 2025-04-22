/**
 * Database Seed File
 * 
 * This file contains the initial data seeding functionality for the chat application.
 * It populates the database with mock users, chats, and messages for development
 * and testing purposes.
 * 
 * Features:
 * - Mock user data with avatars and status
 * - Initial chat conversations
 * - Group and private chat examples
 * - Sample messages with various states
 * - Conflict handling for existing data
 */

import { db } from './db';
import { users, chats, chatParticipants, messages } from './schema';

/**
 * Mock User Data
 * 
 * Sample user data for initial database population:
 * - Each user has a unique ID, name, avatar, and status
 * - Avatars are generated using a placeholder service
 * - Status indicates user's current availability
 */
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    avatar: 'https://i.pravatar.cc/150?img=1',
    status: 'online',
  },
  {
    id: '2',
    name: 'Jane Smith',
    avatar: 'https://i.pravatar.cc/150?img=2',
    status: 'offline',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    avatar: 'https://i.pravatar.cc/150?img=3',
    status: 'away',
  },
  {
    id: '4',
    name: 'Sarah Williams',
    avatar: 'https://i.pravatar.cc/150?img=4',
    status: 'online',
  },
];

/**
 * Initial Chat Data
 * 
 * Sample chat data including:
 * - Private and group chat examples
 * - Message history with various states
 * - Different delivery statuses
 * - Message reactions and edits
 */
const initialChats = [
  {
    id: 'chat1',
    isGroup: 0,
    groupName: null,
    participants: ['1', '2'],
    messages: [
      {
        id: 'msg1',
        senderId: '2',
        text: 'Hey, how are you?',
        timestamp: Date.now() - 3600000,
        deliveryStatus: 'read',
        isRead: 1,
        isEdited: 0,
        isForwarded: 0,
        isDeleted: 0,
        deletedFor: '[]',
        reactions: '{}',
      },
      {
        id: 'msg2',
        senderId: '1',
        text: 'I\'m good, thanks for asking!',
        timestamp: Date.now() - 1800000,
        deliveryStatus: 'read',
        isRead: 1,
        isEdited: 0,
        isDeleted: 0,
        deletedFor: '[]',
        reactions: '{}',
      },
    ],
  },
  {
    id: 'chat2',
    isGroup: 0,
    groupName: null,
    participants: ['1', '3'],
    messages: [
      {
        id: 'msg3',
        senderId: '3',
        text: 'Did you check the project?',
        timestamp: Date.now() - 86400000,
        deliveryStatus: 'read',
        isRead: 1,
        isEdited: 0,
        isForwarded: 0,
        isDeleted: 0,
        deletedFor: '[]',
        reactions: '{}',
      },
    ],
  },
  {
    id: 'chat3',
    isGroup: 1,
    groupName: 'Team Project',
    participants: ['1', '2', '3', '4'],
    messages: [
      {
        id: 'msg4',
        senderId: '1',
        text: 'Welcome to the team chat!',
        timestamp: Date.now() - 172800000,
        deliveryStatus: 'read',
        isRead: 1,
        isEdited: 0,
        isForwarded: 0,
        isDeleted: 0,
        deletedFor: '[]',
        reactions: '{}',
      },
      {
        id: 'msg5',
        senderId: '2',
        text: 'Thanks! Looking forward to working together.',
        timestamp: Date.now() - 172700000,
        deliveryStatus: 'read',
        isRead: 1,
        isEdited: 0,
        isForwarded: 0,
        isDeleted: 0,
        deletedFor: '[]',
        reactions: '{}',
      },
    ],
  },
];

/**
 * Checks if the database has already been seeded
 * 
 * @returns Promise<boolean> - True if data exists, false otherwise
 */
async function isDataSeeded() {
  try {
    const result = await db.select().from(users);
    return result.length > 0;
  } catch (error) {
    console.error('Error checking if database is seeded:', error);
    return false;
  }
}

/**
 * Seeds the database with initial data
 * 
 * This function:
 * 1. Checks if the database is already seeded
 * 2. Inserts mock users
 * 3. Creates chats and their relationships
 * 4. Adds initial messages
 * 5. Handles conflicts gracefully
 * 
 * @throws Error if seeding fails
 */
export async function seedDatabase() {
  try {
    // Check if database already has data
    const alreadySeeded = await isDataSeeded();
    if (alreadySeeded) {
      console.log('Database already seeded, skipping...');
      return;
    }
    
    console.log('Seeding database...');
    
    // Insert users
    console.log('Seeding users...');
    for (const user of mockUsers) {
      try {
        await db.insert(users).values({
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          status: user.status,
        });
        console.log(`User ${user.name} seeded successfully`);
      } catch (error) {
        console.error(`Error seeding user ${user.name}:`, error);
      }
    }
    
    // Insert chats and their relationships
    console.log('Seeding chats...');
    for (const chat of initialChats) {
      // Insert chat
      await db.insert(chats).values({
        id: chat.id,
        isGroup: chat.isGroup,
        groupName: chat.groupName,
      }).onConflictDoNothing();
      
      // Insert participants
      console.log(`Adding participants for chat ${chat.id}...`);
      for (const userId of chat.participants) {
        await db.insert(chatParticipants).values({
          id: `cp-${chat.id}-${userId}`,
          chatId: chat.id,
          userId,
        }).onConflictDoNothing();
      }
      
      // Insert messages
      console.log(`Adding messages for chat ${chat.id}...`);
      for (const message of chat.messages) {
        await db.insert(messages).values({
          id: message.id,
          chatId: chat.id,
          senderId: message.senderId,
          text: message.text,
          timestamp: message.timestamp,
          deliveryStatus: message.deliveryStatus,
          isRead: message.isRead,
          isEdited: message.isEdited,
          isForwarded: message.isForwarded,
          isDeleted: message.isDeleted,
          deletedFor: message.deletedFor,
          reactions: message.reactions,
        }).onConflictDoNothing();
      }
    }
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
} 