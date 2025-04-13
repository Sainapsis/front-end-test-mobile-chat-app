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

// Función para generar mensajes entre dos usuarios
function generateChatMessages(senderId: string, receiverId: string, count = 500) {
  const messages = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90); // Empezamos hace 90 días para más mensajes

  // No limitamos la cantidad de mensajes generados
  const actualCount = count;

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
    "¿Estás disponible esta semana?",
    "¿Pudiste solucionar ese problema?",
    "¿Te llegó mi email?",
    "¿Qué te pareció la presentación?",
    "Deberíamos hablar de los próximos pasos",
    "¿Has tenido algún avance con el cliente?",
    "El equipo está trabajando en esa funcionalidad",
    "Me encanta como avanza el proyecto",
    "¿Hay algo en lo que te pueda ayudar?",
    "Acabo de terminar la tarea que me asignaste",
    "¿Te parece si hacemos una llamada mañana?",
    "Recibí buenos comentarios del cliente",
    "Creo que deberíamos revisar el presupuesto",
    "¿Has hablado con el equipo de marketing?",
    "Tenemos que terminar esto para el lunes",
    "No estoy seguro si entendí bien el requerimiento"
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
    "Estoy disponible el jueves",
    "Sí, logré solucionar el problema",
    "Recibí tu email, te respondo pronto",
    "La presentación estuvo excelente",
    "De acuerdo, definamos los próximos pasos",
    "El cliente está satisfecho con el avance",
    "Ya terminé mi parte del desarrollo",
    "Me parece perfecto",
    "Voy a revisar eso ahora mismo",
    "Necesito un poco más de tiempo",
    "¿Podríamos ajustar el alcance?",
    "El equipo está trabajando a toda velocidad",
    "Deberíamos consultar con el departamento técnico",
    "¿Qué piensas de la nueva estrategia?",
    "Excelente trabajo con la presentación",
    "Hablé con los stakeholders y están contentos"
  ];

  // Generamos mensajes alternados
  for (let i = 0; i < actualCount; i++) {
    const messageDate = new Date(startDate);
    messageDate.setHours(messageDate.getHours() + i * 4); // Más frecuentes

    // Mensaje del remitente
    messages.push({
      id: `msg_${senderId}_${receiverId}_${i * 2 + 1}`,
      senderId: senderId,
      text: `${senderMessages[i % senderMessages.length]} (Chat ${receiverId} - Msg ${i + 1})`,
      timestamp: messageDate.getTime(),
    });

    // Respuesta del receptor (80% de probabilidad para simular conversaciones reales)
    // Aumentamos la probabilidad para que haya más mensajes
    if (Math.random() > 0.2) {
      messageDate.setMinutes(messageDate.getMinutes() + 15 + Math.floor(Math.random() * 60));
      messages.push({
        id: `msg_${receiverId}_${senderId}_${i * 2 + 2}`,
        senderId: receiverId,
        text: `${receiverMessages[i % receiverMessages.length]} (Respuesta ${i + 1})`,
        timestamp: messageDate.getTime(),
      });
    }
  }

  return messages;
}

// Función para generar chats adicionales para Jane
function generateAdditionalChats() {
  const additionalChats = [];

  // Crear 300 conversaciones entre Jane y otros usuarios
  // Usamos los usuarios existentes y, si son pocos, generamos conversaciones grupales
  const availableUserIds = mockUsers.map(user => user.id).filter(id => id !== '2'); // Todos menos Jane

  // Número total de chats a generar
  const totalChats = 300; // Aumentado de 100 a 300

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
      const messagesPerParticipant = 250; // 250 mensajes por participante = aproximadamente 500-1000 mensajes por chat grupal
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
      chatMessages = generateChatMessages('2', otherUserId, 500); // 500 mensajes por chat individual
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
    console.log(`Added ${mockUsers.length} users successfully`);

    // Insert chats and their relationships
    console.log(`Seeding ${initialChats.length} chats...`);

    // Procesar en lotes para evitar saturar la BD
    const BATCH_SIZE = 20;
    const totalBatches = Math.ceil(initialChats.length / BATCH_SIZE);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * BATCH_SIZE;
      const end = Math.min((batchIndex + 1) * BATCH_SIZE, initialChats.length);
      const currentBatch = initialChats.slice(start, end);

      console.log(`Processing batch ${batchIndex + 1}/${totalBatches} (chats ${start + 1}-${end})...`);

      for (const chat of currentBatch) {
        // Insert chat
        await db.insert(chats).values({ id: chat.id }).onConflictDoNothing();

        // Insert participants
        for (const userId of chat.participants) {
          await db.insert(chatParticipants).values({
            id: `cp-${chat.id}-${userId}`,
            chatId: chat.id,
            userId,
          }).onConflictDoNothing();
        }

        // Insert messages
        if (chat.messages.length > 0) {
          // Insertar mensajes en batch para mayor eficiencia
          const messageChunks = [];
          for (let i = 0; i < chat.messages.length; i += 50) {
            messageChunks.push(chat.messages.slice(i, i + 50));
          }

          for (const messageChunk of messageChunks) {
            await Promise.all(messageChunk.map(message =>
              db.insert(messages).values({
                id: message.id,
                chatId: chat.id,
                senderId: message.senderId,
                text: message.text,
                timestamp: message.timestamp,
              }).onConflictDoNothing()
            ));
          }
        }
      }
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
} 