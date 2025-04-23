// NOTE: This is a mock API service for development purposes.
// It simulates the server (saving on local storage) and has the client interactions in the exported api object that mimic the api calls/responses with delays.
// Dont waste time implementing a real API.
// Dont waste time understanding this code unless you relly see a need for it

import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants
const NETWORK_DELAY = 500;
const SERVER_USERS_KEY = 'server_users';
const SERVER_CHATS_KEY = 'server_chats';
const SERVER_CHAT_PARTICIPANTS_KEY = 'server_chat_participants';
const SERVER_MESSAGES_KEY = 'server_messages';

// Types to mirror the database schema
interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
}

interface Chat {
  id: string;
}

interface ChatParticipant {
  id: string;
  chatId: string;
  userId: string;
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: number;
}

// In-memory cache of "server" data
const serverStore = {
  users: new Map<string, User>(),
  chats: new Map<string, Chat>(),
  chatParticipants: new Map<string, ChatParticipant>(),
  messages: new Map<string, Message>(),
  initialized: false
};

// Initialize the mock server with seed data
const initializeServer = async () => {
  if (serverStore.initialized) return;
  
  try {
    // Load data from AsyncStorage if available
    const usersData = await AsyncStorage.getItem(SERVER_USERS_KEY);
    const chatsData = await AsyncStorage.getItem(SERVER_CHATS_KEY);
    const participantsData = await AsyncStorage.getItem(SERVER_CHAT_PARTICIPANTS_KEY);
    const messagesData = await AsyncStorage.getItem(SERVER_MESSAGES_KEY);
    
    if (usersData) {
      const users = JSON.parse(usersData) as User[];
      users.forEach(user => serverStore.users.set(user.id, user));
    }
    
    if (chatsData) {
      const chats = JSON.parse(chatsData) as Chat[];
      chats.forEach(chat => serverStore.chats.set(chat.id, chat));
    }
    
    if (participantsData) {
      const participants = JSON.parse(participantsData) as ChatParticipant[];
      participants.forEach(participant => serverStore.chatParticipants.set(participant.id, participant));
    }
    
    if (messagesData) {
      const messages = JSON.parse(messagesData) as Message[];
      messages.forEach(message => serverStore.messages.set(message.id, message));
    }
    
    // If no data exists, seed with initial data
    if (serverStore.users.size === 0) {
      seedServerData();
    }
    
    serverStore.initialized = true;
  } catch (error) {
    console.error('Error initializing mock server:', error);
    seedServerData();
  }
};

// Default seed data for the "server"
const seedServerData = () => {
  // Seed users
  const mockUsers: User[] = [
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
  
  // Seed chats and related data
  const mockChats: Chat[] = [
    { id: 'chat1' },
    { id: 'chat2' }
  ];
  
  const mockParticipants: ChatParticipant[] = [
    { id: 'cp-chat1-1', chatId: 'chat1', userId: '1' },
    { id: 'cp-chat1-2', chatId: 'chat1', userId: '2' },
    { id: 'cp-chat2-1', chatId: 'chat2', userId: '1' },
    { id: 'cp-chat2-3', chatId: 'chat2', userId: '3' }
  ];
  
  const mockMessages: Message[] = [
    {
      id: 'msg1',
      chatId: 'chat1',
      senderId: '2',
      text: 'Hey, how are you?',
      timestamp: Date.now() - 3600000,
    },
    {
      id: 'msg2',
      chatId: 'chat1',
      senderId: '1',
      text: 'I\'m good, thanks for asking!',
      timestamp: Date.now() - 1800000,
    },
    {
      id: 'msg3',
      chatId: 'chat2',
      senderId: '3',
      text: 'Did you check the project?',
      timestamp: Date.now() - 86400000,
    },
  ];
  
  // Save to in-memory store
  mockUsers.forEach(user => serverStore.users.set(user.id, user));
  mockChats.forEach(chat => serverStore.chats.set(chat.id, chat));
  mockParticipants.forEach(participant => serverStore.chatParticipants.set(participant.id, participant));
  mockMessages.forEach(message => serverStore.messages.set(message.id, message));
  
  // Save to AsyncStorage
  saveServerData();
};

// Save server data to AsyncStorage
const saveServerData = async () => {
  try {
    await AsyncStorage.setItem(SERVER_USERS_KEY, JSON.stringify(Array.from(serverStore.users.values())));
    await AsyncStorage.setItem(SERVER_CHATS_KEY, JSON.stringify(Array.from(serverStore.chats.values())));
    await AsyncStorage.setItem(SERVER_CHAT_PARTICIPANTS_KEY, JSON.stringify(Array.from(serverStore.chatParticipants.values())));
    await AsyncStorage.setItem(SERVER_MESSAGES_KEY, JSON.stringify(Array.from(serverStore.messages.values())));
  } catch (error) {
    console.error('Error saving server data:', error);
  }
};

// Simulated network delay
const createResponse = async <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, NETWORK_DELAY);
  });
};

// Make sure server is initialized
initializeServer();

// API interface to mimic server interactions
export const api = {
  // User related endpoints
  users: {
    getAll: async () => {
      await initializeServer();
      return createResponse(Array.from(serverStore.users.values()));
    },
    getById: async (id: string) => {
      await initializeServer();
      const user = serverStore.users.get(id) || null;
      return createResponse(user);
    },
    update: async (id: string, data: Partial<User>) => {
      await initializeServer();
      const currentUser = serverStore.users.get(id);
      
      if (!currentUser) {
        throw new Error(`User not found: ${id}`);
      }
      
      const updatedUser = { ...currentUser, ...data };
      serverStore.users.set(id, updatedUser);
      await saveServerData();
      
      return createResponse(updatedUser);
    },
    sync: async () => {
      await initializeServer();
      return createResponse({ 
        synced: true, 
        users: Array.from(serverStore.users.values()) 
      });
    }
  },

  // Chat related endpoints
  chats: {
    getAll: async () => {
      await initializeServer();
      return createResponse(Array.from(serverStore.chats.values()));
    },
    getById: async (id: string) => {
      await initializeServer();
      const chat = serverStore.chats.get(id) || null;
      return createResponse(chat);
    },
    create: async (chatData: Chat) => {
      await initializeServer();
      serverStore.chats.set(chatData.id, chatData);
      await saveServerData();
      return createResponse({ success: true, id: chatData.id });
    },
    getParticipants: async (chatId: string) => {
      await initializeServer();
      const participants = Array.from(serverStore.chatParticipants.values())
        .filter(p => p.chatId === chatId)
        .map(p => p.userId);
      
      return createResponse(participants);
    },
    addParticipant: async (chatId: string, userId: string) => {
      await initializeServer();
      const participantId = `cp-${chatId}-${userId}`;
      
      if (!serverStore.chatParticipants.has(participantId)) {
        const newParticipant: ChatParticipant = {
          id: participantId,
          chatId,
          userId
        };
        
        serverStore.chatParticipants.set(participantId, newParticipant);
        await saveServerData();
      }
      
      return createResponse({ success: true });
    },
    sync: async () => {
      await initializeServer();
      return createResponse({ 
        synced: true, 
        chats: Array.from(serverStore.chats.values()) 
      });
    }
  },

  // Message related endpoints
  messages: {
    getByChatId: async (chatId: string) => {
      await initializeServer();
      const chatMessages = Array.from(serverStore.messages.values())
        .filter(m => m.chatId === chatId)
        .sort((a, b) => a.timestamp - b.timestamp);
      
      return createResponse(chatMessages);
    },
    send: async (messageData: Message) => {
      await initializeServer();
      serverStore.messages.set(messageData.id, messageData);
      await saveServerData();
      return createResponse({ success: true, id: messageData.id });
    },
    sync: async (chatId: string, lastSyncTimestamp: number) => {
      await initializeServer();
      const newMessages = Array.from(serverStore.messages.values())
        .filter(m => m.chatId === chatId && m.timestamp > lastSyncTimestamp);
      
      return createResponse({ 
        synced: true, 
        messages: newMessages,
        syncTimestamp: Date.now()
      });
    }
  }
}; 