import { Injectable, forwardRef, Inject, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model } from 'mongoose';
import { Chat, ChatDocument } from './model/chat.model';
import { AuthService } from '../auth/auth.service';
import { Message, MessageDocument } from '../message/model/message.model';

@Injectable()
export class ChatService {
  logger: Logger;
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>) {
    this.logger = new Logger(ChatService.name);
  }

  // async findOne(query: any): Promise<any> {
  //   return await this.chatModel.findOne(query).select('+password');
  // }

  async findChats(userInfo: FilterQuery<Chat>): Promise<Chat[]> {
    return this.chatModel.find({members: userInfo._id})
    .populate('members', 'firstName lastName username status')
    .populate('recentMessages.sender', 'firstName lastName username status')
    .populate('lastMessage.sender', 'firstName lastName username status');
  }

  async create(chat: Chat): Promise<Chat> {
    this.logger.log('Creating Chat.');
    const newChat = new this.chatModel(chat);
    return newChat.save();
  }

  async findOneAndUpdate(query: any, payload: any): Promise<Chat> {
    this.logger.log('Updating Chat.');
    return this.chatModel.findOneAndUpdate(query, payload, {
      new: true,
      upsert: true,
    });
  }

  async findOneAndRemove(query: any): Promise<any> {
    return this.chatModel.findOneAndDelete(query);
  }

  // Método para enviar un mensaje (similar al anterior)
  async sendMessage(userId: string, createdMessage: any): Promise<Message> {
    
    if (!createdMessage.media && !createdMessage.content) {
      throw new Error('Se debe proporcionar contenido o createdMessage.media');
    }

    const message = {
      content:createdMessage.content,
      media: createdMessage.media,
      response: createdMessage.response,
      timestamp: new Date(),
      sender: new mongoose.Types.ObjectId(userId),
      chatId: new mongoose.Types.ObjectId(createdMessage.chatId),
      readBy: [new mongoose.Types.ObjectId(userId)], // El remitente ya ha leído su mensaje
    }
    
    // Crear el mensaje; el remitente se marca automáticamente como "leído" agregándolo a readBy.
    const newMessage = await this.messageModel.create(message);
    
    // Encuentra el chat al que se envió el mensaje
    const chatData = await this.chatModel.findById(createdMessage.chatId);
    if (!chatData) {
      throw new NotFoundException('Chat no encontrado');
    }
    
    // Actualiza el chat con el nuevo mensaje:
    chatData.lastMessage = newMessage;
    chatData.recentMessages.push(newMessage);
    const maxRecentMessages = 10;
    if (chatData.recentMessages.length > maxRecentMessages) {
      chatData.recentMessages = chatData.recentMessages.slice(-maxRecentMessages);
    }
    
    // Actualiza el contador de mensajes no leídos para cada miembro
    // Se incrementa el contador para cada miembro distinto del remitente
    if (!chatData.unreadCounts) {
      chatData.unreadCounts = {};
    }
    for (const member of chatData.members) {
      console.log(member.toString(), userId.toString())
      if (member.toString() !== userId.toString()) {
        chatData.unreadCounts[member.toString()] = (chatData.unreadCounts[member.toString()] || 0) + 1;
      }
    }
    
    await chatData.save();
    return newMessage;
  }

  async getMessagesPaginated(chatId: string, page: number, limit: number = 10): Promise<Message[]> {
  // Obtener el total de mensajes del chat
  const totalMessages = await this.messageModel.countDocuments({ chatId });
  // Calcular la última página (mínimo 1)
  const lastPage = Math.max(Math.ceil(totalMessages / limit), 1);
  // Si no se envía page o se envía 0, usamos la última página
  const currentPage = page && page > 0 ? page : lastPage;

    return this.messageModel
      .find({ chatId })
      .sort({ timestamp: -1 })
      .skip((currentPage - 1) * limit)
      .limit(limit)
      .populate('sender', 'firstName lastName username status')
      .populate('readBy', 'firstName lastName')
  }

  async markMessagesAsRead(chatId: string, userId: string): Promise<any> {
    // Actualiza los mensajes del chat que aún no hayan sido leídos por el usuario
    await this.messageModel.updateMany(
      { 
        chatId: new mongoose.Types.ObjectId(chatId),
        readBy: { $ne: userId } 
      },
      { $addToSet: { readBy: userId } }
    );

    return { "readBy": userId };
  }

  // Método para obtener el count de mensajes no leídos para cada miembro del chat
  async markChatAsRead(chatId: string, userId: string): Promise<Chat> {
    const chatData = await this.chatModel.findById(chatId);
    if (!chatData) {
      throw new NotFoundException('Chat no encontrado');
    }
    // Reinicia el contador para el usuario
    if (chatData.unreadCounts && chatData.unreadCounts[userId]) {
      chatData.unreadCounts[userId] = 0;
    }
    await chatData.save();
    return chatData;
  }
}