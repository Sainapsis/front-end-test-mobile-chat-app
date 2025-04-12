import { db } from './db';
import { users, chats, chatParticipants, messages } from './schema';

// Mock user data from the original useUser hook
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    avatar: 'https://i.pravatar.cc/150?img=1',
    status: 'online' as const,
  },
  {
    id: '2',
    name: 'Jane Smith',
    avatar: 'https://i.pravatar.cc/150?img=2',
    status: 'offline' as const,
  },
  {
    id: '3',
    name: 'Mike Johnson',
    avatar: 'https://i.pravatar.cc/150?img=3',
    status: 'away' as const,
  },
  {
    id: '4',
    name: 'Sarah Williams',
    avatar: 'https://i.pravatar.cc/150?img=4',
    status: 'online' as const,
  },
];

// Función para generar 500 mensajes de conversación entre John y Jane
function generateJohnJaneMessages() {
  const messages = [];
  // Simulamos una conversación de 30 días, con varios mensajes por día
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // Empezamos hace 30 días

  const johnMessages = [
    "¡Hola! ¿Cómo estás hoy?",
    "Estoy trabajando en el proyecto nuevo",
    "¿Tienes tiempo para una llamada?",
    "Vi tus cambios, me parecen geniales",
    "¿Cómo va el informe?",
    "Acabo de enviar un email con los detalles",
    "¿Viste las noticias?",
    "¿Te parece si nos reunimos mañana?",
    "Tengo una duda sobre el documento",
    "Ya terminé mi parte del proyecto",
    "¿Qué opinas de la nueva política?",
    "Feliz día, espero que estés bien",
    "¿Has probado la nueva actualización?",
    "Necesito tu opinión sobre algo",
    "¿Vamos a almorzar juntos?",
    "El cliente está muy contento con el trabajo",
    "¿Podemos revisar el calendario?",
    "Acabo de leer tu propuesta, es excelente",
    "Estoy disponible esta tarde si quieres hablar",
    "¿Puedes enviarme ese archivo cuando tengas tiempo?"
  ];

  const janeMessages = [
    "Todo bien, gracias. ¿Y tú?",
    "Claro, tengo tiempo a las 3 PM",
    "Sí, ya vi tu email, te respondo en breve",
    "Me parece bien reunirnos mañana",
    "Todavía no he terminado el informe, pero voy por buen camino",
    "Sí, vi las noticias, ¡increíble!",
    "Ya revisé el documento, tengo algunos comentarios",
    "La nueva actualización tiene algunos bugs",
    "Esa política parece interesante, pero hay que analizarla más",
    "Podemos almorzar juntos, ¿dónde quieres ir?",
    "El calendario está bastante ocupado este mes",
    "Gracias por tu comentario sobre mi propuesta",
    "Esta tarde tengo una reunión, ¿podemos hablar mañana?",
    "Te enviaré el archivo en cuanto lo tenga listo",
    "Estoy trabajando en ello ahora mismo",
    "¿Qué piensas de la presentación?",
    "Acabo de hablar con el equipo, están de acuerdo",
    "Necesito más información para completar mi parte",
    "¿Has visto el nuevo diseño?",
    "Me encantaría escuchar tus ideas para el proyecto"
  ];

  // Generamos mensajes alternados con timestamps progresivos
  for (let i = 0; i < 250; i++) {
    // Calculamos la fecha y hora para este mensaje
    const messageDate = new Date(startDate);
    // Añadimos progresivamente tiempo para simular una conversación real
    messageDate.setHours(messageDate.getHours() + i * 3); // Cada mensaje espaciado por 3 horas aprox

    // Mensaje de John (ID: 1)
    messages.push({
      id: `msg_john_${i + 1}`,
      senderId: '1',
      text: `${johnMessages[i % johnMessages.length]} (Mensaje ${i + 1})`,
      timestamp: messageDate.getTime(),
    });

    // Añadimos un pequeño incremento para la respuesta de Jane
    messageDate.setMinutes(messageDate.getMinutes() + 15 + Math.floor(Math.random() * 45));

    // Mensaje de Jane (ID: 2)
    messages.push({
      id: `msg_jane_${i + 1}`,
      senderId: '2',
      text: `${janeMessages[i % janeMessages.length]} (Respuesta ${i + 1})`,
      timestamp: messageDate.getTime(),
    });
  }

  return messages;
}

// Initial chat data (similar to useChats)
const initialChats = [
  {
    id: 'chat1',
    participants: ['1', '2'],
    messages: generateJohnJaneMessages(),
  },
  {
    id: 'chat2',
    participants: ['1', '3'],
    messages: [
      {
        id: 'msg3',
        senderId: '3',
        text: 'Did you check the project?',
        timestamp: Date.now() - 86400000,
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
        }).onConflictDoNothing();
      }
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
} 