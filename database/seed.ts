import { db } from './db';
import { MessageStatus } from './interface/message';
import { UserStatus } from './interface/user';
import { users, chats, chatParticipants, messages } from './schema';

// Mock user data from the original useUser hook
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    avatar: 'https://i.pravatar.cc/150?img=1',
    status: UserStatus.ONLINE,
  },
  {
    id: '2',
    name: 'Jane Smith',
    avatar: 'https://i.pravatar.cc/150?img=2',
    status: UserStatus.OFFLINE,
  },
  {
    id: '3',
    name: 'Mike Johnson',
    avatar: 'https://i.pravatar.cc/150?img=3',
    status: UserStatus.AWAY,
  },
  {
    id: '4',
    name: 'Sarah Williams',
    avatar: 'https://i.pravatar.cc/150?img=4',
    status: UserStatus.ONLINE,
  },
];

// Initial chat data (similar to useChats)
const initialChats = [
  {
    id: 'chat1',
    participants: ['1', '2'],
    messages: [
      {
        id: 'msg1',
        senderId: '2',
        text: 'Hey, how are you?',
        imageUri: null,
        timestamp: Date.now() - 3600000,
        status: MessageStatus.SENT,
      },
      {
        id: 'msg2',
        senderId: '1',
        text: 'I\'m good, thanks for asking!',
        imageUri: null,
        timestamp: Date.now() - 1800000,
        status: MessageStatus.READ,
      },
    ],
  },
  {
    id: 'chat2',
    participants: ['1', '3'],
    messages: [
      {
        id: 'msg3',
        senderId: '3',
        text: 'Did you check the project?',
        imageUri: null,
        timestamp: Date.now() - 86400000,
        status: MessageStatus.SENT,
      },
    ],
  },
];

// Check if there's any data in the users table
async function isDataSeeded() {
  try {
    const result = await db.select().from(users);
    return result.length > 0;
  } catch (error) {
    console.error('Error checking if database is seeded:', error);
    return false;
  }
}

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
      await db.insert(users).values(user).onConflictDoNothing();
    }
    
    // Insert chats and their relationships
    console.log('Seeding chats...');
    for (const chat of initialChats) {
      // Insert chat
      await db.insert(chats).values({ id: chat.id }).onConflictDoNothing();
      
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
          status: message.status,
        }).onConflictDoNothing();
      }
    }
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
} 