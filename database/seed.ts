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
  // Añadir más usuarios para poder crear suficientes chats
  {
    id: '5',
    name: 'Alex Thompson',
    avatar: 'https://i.pravatar.cc/150?img=5',
    status: 'online' as const,
  },
  {
    id: '6',
    name: 'Lisa Garcia',
    avatar: 'https://i.pravatar.cc/150?img=6',
    status: 'away' as const,
  },
  {
    id: '7',
    name: 'David Wilson',
    avatar: 'https://i.pravatar.cc/150?img=7',
    status: 'offline' as const,
  },
  {
    id: '8',
    name: 'Emily Brown',
    avatar: 'https://i.pravatar.cc/150?img=8',
    status: 'online' as const,
  },
  {
    id: '9',
    name: 'James Martin',
    avatar: 'https://i.pravatar.cc/150?img=9',
    status: 'offline' as const,
  },
  {
    id: '10',
    name: 'Sophia Lee',
    avatar: 'https://i.pravatar.cc/150?img=10',
    status: 'away' as const,
  },
  {
    id: '11',
    name: 'Robert Taylor',
    avatar: 'https://i.pravatar.cc/150?img=11',
    status: 'online' as const,
  },
  {
    id: '12',
    name: 'Olivia Clark',
    avatar: 'https://i.pravatar.cc/150?img=12',
    status: 'away' as const,
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
    "Ya terminé mi parte del proyecto"
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
    "Podemos almorzar juntos, ¿dónde quieres ir?"
  ];

  // Generamos mensajes alternados con timestamps progresivos
  // Reducimos de 250 a 25 iteraciones para generar 50 mensajes en total
  for (let i = 0; i < 25; i++) {
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

// Función para generar mensajes entre dos usuarios
function generateChatMessages(senderId: string, receiverId: string, count = 500) {
  const messages = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // Reducido de 90 a 30 días

  // Limitamos al count especificado
  const actualCount = Math.min(count, 20); // Añadimos límite máximo de 20 mensajes

  const senderMessages = [
    "Hola, ¿cómo va todo?",
    "¿Cuándo podemos reunirnos?",
    "¿Revisaste el documento que te envié?",
    "Me gustaría hablar sobre el proyecto",
    "¿Tienes un momento para charlar?",
    "¿Qué opinas de la nueva propuesta?",
    "Necesito tu feedback para avanzar",
    "Quería preguntarte sobre la reunión de ayer",
    "¿Te parece bien el enfoque que tomamos?",
    "¿Estás disponible esta semana?"
  ];

  const receiverMessages = [
    "Todo bien, gracias por preguntar",
    "Podemos reunirnos el martes a las 10",
    "Sí, revisé el documento y me parece bien",
    "Claro, hablemos sobre el proyecto",
    "Tengo tiempo esta tarde",
    "La propuesta parece interesante",
    "Te envío mis comentarios mañana",
    "La reunión fue muy productiva",
    "El enfoque me parece adecuado",
    "Estoy disponible el jueves"
  ];

  // Generamos mensajes alternados
  for (let i = 0; i < actualCount; i++) {
    // Calculamos la fecha y hora para este mensaje
    const messageDate = new Date(startDate);
    // Espaciamos los mensajes en un período de tiempo para simular conversación real
    messageDate.setHours(messageDate.getHours() + i * 6); // Cada mensaje separado por 6 horas aprox

    // Alternamos entre mensajes del remitente y el receptor
    if (i % 2 === 0) {
      messages.push({
        id: `msg_${senderId}_${receiverId}_${i}`,
        senderId,
        text: `${senderMessages[i % senderMessages.length]} (${i + 1})`,
        timestamp: messageDate.getTime(),
      });
    } else {
      messageDate.setMinutes(messageDate.getMinutes() + 10 + Math.floor(Math.random() * 30));
      messages.push({
        id: `msg_${receiverId}_${senderId}_${i}`,
        senderId: receiverId,
        text: `${receiverMessages[i % receiverMessages.length]} (${i + 1})`,
        timestamp: messageDate.getTime(),
      });
    }
  }

  return messages;
}

// Función para generar chats adicionales para Jane
function generateAdditionalChats() {
  const additionalChats = [];

  // Crear 20 conversaciones entre Jane y otros usuarios (reducido de 300)
  // Usamos los usuarios existentes y, si son pocos, generamos conversaciones grupales
  const availableUserIds = mockUsers.map(user => user.id).filter(id => id !== '2'); // Todos menos Jane

  // Número total de chats a generar
  const totalChats = 20; // Reducido de 300 a 20

  for (let i = 0; i < totalChats; i++) {
    // Usamos un ID basado en el índice para asegurar unicidad
    const chatId = `chat_jane_${i + 3}`; // Empezamos en 3 porque ya hay chat1 y chat2

    let participants = ['2']; // Jane siempre es participante

    // Decidir si es una conversación individual o grupal
    const isGroup = Math.random() > 0.7; // 30% de probabilidad de ser grupo

    if (isGroup) {
      // Seleccionar 2-4 participantes aleatorios además de Jane
      const numParticipants = Math.floor(Math.random() * 3) + 2; // 2-4 participantes
      const shuffledUsers = [...availableUserIds].sort(() => 0.5 - Math.random());
      participants = ['2', ...shuffledUsers.slice(0, numParticipants)];
    } else {
      // Conversación individual: Jane + otro usuario
      // Seleccionamos usuarios cíclicamente para asegurar distribución
      const otherUserId = availableUserIds[i % availableUserIds.length];
      participants = ['2', otherUserId];
    }

    // Generar mensajes para este chat
    // Si es un grupo, podríamos tener mensajes de varios participantes
    let chatMessages: Array<{
      id: string;
      senderId: string;
      text: string;
      timestamp: number;
    }> = [];

    if (isGroup) {
      // En grupos, cada participante envía mensajes
      const messagesPerParticipant = 10; // Reducido de 250 a 10 mensajes por participante
      participants.forEach((participantId) => {
        // Cada participante interactúa principalmente con Jane
        if (participantId !== '2') { // No es Jane
          const participantMessages = generateChatMessages(participantId, '2', messagesPerParticipant);
          chatMessages = [...chatMessages, ...participantMessages];
        }
      });
    } else {
      // Chat individual entre Jane y el otro participante
      const otherUserId = participants.find(id => id !== '2')!;
      chatMessages = generateChatMessages('2', otherUserId, 20); // Reducido de 500 a 20 mensajes por chat individual
    }

    // Ordenar mensajes por timestamp
    chatMessages.sort((a, b) => a.timestamp - b.timestamp);

    additionalChats.push({
      id: chatId,
      participants: participants,
      messages: chatMessages,
    });
  }

  return additionalChats;
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
  // Añadir los chats adicionales que generamos
  ...generateAdditionalChats(),
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
  console.log("Verificando si la base de datos ya está poblada...");

  try {
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      console.log("La base de datos ya contiene datos. Omitiendo la población.");
      return;
    }
  } catch (e) {
    console.error("Error al verificar la base de datos:", e);
  }

  console.log("Poblando la base de datos con datos de prueba...");

  // Insertar usuarios
  try {
    await db.insert(users).values(mockUsers);
    console.log(`${mockUsers.length} usuarios insertados.`);
  } catch (e) {
    console.error("Error al insertar usuarios:", e);
  }

  // Generar chats entre John y Jane
  const chat1 = {
    id: 'chat1',
    participants: ['1', '2'], // John y Jane
    messages: generateJohnJaneMessages(),
  };

  // Generar chat grupal con John, Jane y Alice
  const chat2 = {
    id: 'chat2',
    participants: ['1', '2', '3'], // John, Jane y Alice
    messages: [
      ...generateChatMessages('1', '2', 10), // John a Jane
      ...generateChatMessages('3', '2', 10), // Alice a Jane
      ...generateChatMessages('1', '3', 5),  // John a Alice
    ],
  };

  // Generar chats adicionales para Jane
  const additionalChats = generateAdditionalChats();

  // Combinar todos los chats
  const allChats = [chat1, chat2, ...additionalChats];

  // Insertar chats en la base de datos de forma eficiente
  try {
    // Procesar chats en lotes para evitar sobrecargar el navegador
    const BATCH_SIZE = 5; // Reducido de 20 a 5 chats por lote

    for (let i = 0; i < allChats.length; i += BATCH_SIZE) {
      const chatBatch = allChats.slice(i, i + BATCH_SIZE);

      // Insertar chats
      await db.insert(chats).values(
        chatBatch.map(chat => ({
          id: chat.id
        }))
      );

      // Insertar participantes de los chats
      const allParticipants = chatBatch.flatMap(chat =>
        chat.participants.map(userId => ({
          id: `${chat.id}_${userId}`,
          chatId: chat.id,
          userId: userId
        }))
      );

      await db.insert(chatParticipants).values(allParticipants);

      // Insertar mensajes asociados a los chats
      const allMessages = chatBatch.flatMap(chat =>
        chat.messages.map(msg => ({
          ...msg,
          chatId: chat.id
        }))
      );

      // Procesar mensajes en lotes más pequeños si hay muchos
      const MESSAGE_BATCH_SIZE = 100; // Reducido de 500 a 100 mensajes por lote

      for (let j = 0; j < allMessages.length; j += MESSAGE_BATCH_SIZE) {
        const messageBatch = allMessages.slice(j, j + MESSAGE_BATCH_SIZE);
        await db.insert(messages).values(messageBatch);
        console.log(`${messageBatch.length} mensajes insertados (lote ${Math.floor(j / MESSAGE_BATCH_SIZE) + 1} de ${Math.ceil(allMessages.length / MESSAGE_BATCH_SIZE)}).`);
      }

      console.log(`${chatBatch.length} chats procesados (lote ${Math.floor(i / BATCH_SIZE) + 1} de ${Math.ceil(allChats.length / BATCH_SIZE)}).`);
    }

    console.log(`Total: ${allChats.length} chats insertados con sus mensajes.`);
  } catch (e) {
    console.error("Error al insertar chats y mensajes:", e);
  }
} 