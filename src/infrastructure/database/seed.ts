import { UserStatus } from "@/src/domain/entities/user";
import { db } from "../queries/db";
import { users, chats, chatParticipants, messages } from "../schema";
import { MessageStatus } from "@/src/domain/entities/message";

// Mock user data from the original useUser hook
const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    avatar: "",
    status: UserStatus.Online,
  },
  {
    id: "2",
    name: "Jane Smith",
    avatar: "https://i.pravatar.cc/150?img=2",
    status: UserStatus.Offline,
  },
  {
    id: "3",
    name: "Mike Johnson",
    avatar: "https://i.pravatar.cc/150?img=3",
    status: UserStatus.Away,
  },
  {
    id: "4",
    name: "Sarah Williams",
    avatar: "https://i.pravatar.cc/150?img=4",
    status: UserStatus.Online,
  },
  {
    id: "5",
    name: "Alice Brown",
    avatar: "https://i.pravatar.cc/150?img=5",
    status: UserStatus.Offline,
  },
  {
    id: "6",
    name: "Bob White",
    avatar: "https://i.pravatar.cc/150?img=6",
    status: UserStatus.Away,
  },
  {
    id: "7",
    name: "Carol Green",
    avatar: "https://i.pravatar.cc/150?img=7",
    status: UserStatus.Online,
  },
  {
    id: "8",
    name: "David Black",
    avatar: "https://i.pravatar.cc/150?img=8",
    status: UserStatus.Offline,
  },
  {
    id: "9",
    name: "Eve Red",
    avatar: "https://i.pravatar.cc/150?img=9",
    status: UserStatus.Away,
  },
  {
    id: "10",
    name: "Frank Blue",
    avatar: "https://i.pravatar.cc/150?img=10",
    status: UserStatus.Online,
  },
  {
    id: "11",
    name: "Grace Yellow",
    avatar: "https://i.pravatasdgsr.cc/150?img=11",
    status: UserStatus.Offline,
  },
  {
    id: "12",
    name: "Hank Purple",
    avatar: "https://i.pravatar.cc/150?img=12",
    status: UserStatus.Away,
  },
  {
    id: "13",
    name: "Ivy Gray",
    avatar: "https://i.pravatar.cc/150?img=13",
    status: UserStatus.Online,
  },
  {
    id: "14",
    name: "Jack Silver",
    avatar: "https://i.pravatar.cc/150?img=14",
    status: UserStatus.Offline,
  },
  {
    id: "15",
    name: "Kay Gold",
    avatar: "https://i.pravatar.cc/150?img=15",
    status: UserStatus.Away,
  },
  {
    id: "16",
    name: "Leo Cyan",
    avatar: "https://i.pravatar.cc/150?img=16",
    status: UserStatus.Online,
  },
  {
    id: "17",
    name: "Mona Lime",
    avatar: "https://i.pravatar.cc/150?img=17",
    status: UserStatus.Offline,
  },
  {
    id: "18",
    name: "Nina Magenta",
    avatar: "https://i.pravatar.cc/150?img=18",
    status: UserStatus.Away,
  },
  {
    id: "19",
    name: "Oscar Olive",
    avatar: "https://i.pravatar.cc/150?img=19",
    status: UserStatus.Online,
  },
  {
    id: "20",
    name: "Paul Pink",
    avatar: "https://i.pravatar.cc/150?img=20",
    status: UserStatus.Offline,
  },
  {
    id: "21",
    name: "Quinn Teal",
    avatar: "https://i.pravatar.cc/150?img=21",
    status: UserStatus.Away,
  },
  {
    id: "22",
    name: "Ruth Orange",
    avatar: "https://i.pravatar.cc/150?img=22",
    status: UserStatus.Online,
  },
  {
    id: "23",
    name: "Sam Indigo",
    avatar: "https://i.pravatar.cc/150?img=23",
    status: UserStatus.Offline,
  },
  {
    id: "24",
    name: "Tina Violet",
    avatar: "https://i.pravatar.cc/150?img=24",
    status: UserStatus.Away,
  },
];

const initialChats = [
  {
    id: "chat1",
    participants: ["1", "2"],
  },
  {
    id: "chat2",
    participants: ["1", "3"],
  },
];

const initialMessages = [
  {
    id: "msg1",
    chatId: "chat1",
    senderId: "2",
    text: "Hey, how are you?",
    imageUri: null,
    timestamp: Date.now() - 3600000,
    status: MessageStatus.Read,
  },
  {
    id: "msg2",
    chatId: "chat1",
    senderId: "1",
    text: "I'm good, thanks for asking!",
    imageUri: null,
    timestamp: Date.now() - 1800000,
    status: MessageStatus.Read,
  },
  {
    id: "msg3",
    chatId: "chat2",
    senderId: "3",
    text: "Did you check the project?",
    imageUri: null,
    timestamp: Date.now() - 86400000,
    status: MessageStatus.Read,
  },
];

// Check if there's any data in the users table
async function isDataSeeded() {
  try {
    const result = await db.select().from(users);
    return result.length > 0;
  } catch (error) {
    console.error("Error checking if database is seeded:", error);
    return false;
  }
}

export async function seedDatabase() {
  try {
    // Check if database already has data
    const alreadySeeded = await isDataSeeded();
    if (alreadySeeded) {
      console.log("Database already seeded, skipping...");
      return;
    }

    console.log("Seeding database...");

    // Insert users
    console.log("Seeding users...");
    for (const user of mockUsers) {
      await db.insert(users).values(user).onConflictDoNothing();
    }

    // Insert chats and their relationships
    console.log("Seeding chats...");
    for (const chat of initialChats) {
      // Insert chat
      await db.insert(chats).values({ id: chat.id }).onConflictDoNothing();

      // Insert participants
      console.log(`Adding participants for chat ${chat.id}...`);
      for (const userId of chat.participants) {
        await db
          .insert(chatParticipants)
          .values({
            id: `cp-${chat.id}-${userId}`,
            chatId: chat.id,
            userId,
          })
          .onConflictDoNothing();
      }

      // Insert messages
      console.log(`Adding messages for chat ${chat.id}...`);
      for (const message of initialMessages) {
        if (message.chatId !== chat.id) continue;

        await db
          .insert(messages)
          .values({
            id: message.id,
            chatId: chat.id,
            senderId: message.senderId,
            text: message.text,
            timestamp: message.timestamp,
            status: message.status,
          })
          .onConflictDoNothing();
      }
    }

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}
