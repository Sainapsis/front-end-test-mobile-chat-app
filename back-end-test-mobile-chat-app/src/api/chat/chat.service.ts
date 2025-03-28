import { Injectable, forwardRef, Inject, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model } from 'mongoose';
import { Chat, ChatDocument } from './model/chat.model';
import { AuthService } from '../auth/auth.service';
import { Message, MessageDocument } from '../message/model/message.model';
import { ChatGateway } from './chat.gateway';

@Injectable()
export class ChatService {
  logger: Logger;
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway) {
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


  async sendMessage(userId: string, createdMessage: any): Promise<Message> {
    
    if (!createdMessage.media && !createdMessage.content) {
      throw new Error('Se debe proporcionar contenido o createdMessage.media');
    }

    const message = {
      content:createdMessage.content,
      media: createdMessage.media,
      response: createdMessage.response,
      responseTo: createdMessage.responseTo,
      responseId: createdMessage.responseId,
      timestamp: new Date(),
      sender: new mongoose.Types.ObjectId(userId),
      chatId: new mongoose.Types.ObjectId(createdMessage.chatId),
      readBy: [new mongoose.Types.ObjectId(userId)], 
    }
    
    const newMessage = await this.messageModel.create(message);
    

    const chatData = await this.chatModel.findById(createdMessage.chatId);
    if (!chatData) {
      throw new NotFoundException('Chat no encontrado');
    }
    

    chatData.lastMessage = newMessage;
    chatData.recentMessages.push(newMessage);
    const maxRecentMessages = 10;
    if (chatData.recentMessages.length > maxRecentMessages) {
      chatData.recentMessages = chatData.recentMessages.slice(-maxRecentMessages);
    }
    

    if (!chatData.unreadCounts) {
      chatData.unreadCounts = {};
    }
    for (const member of chatData.members) {
      if (member.toString() !== userId.toString()) {
        chatData.unreadCounts[member.toString()] = (chatData.unreadCounts[member.toString()] || 0) + 1;
      }
    }
    chatData.markModified('unreadCounts');
    await chatData.save();
    for (const member of chatData.members) {
      if (member.toString() !== userId.toString()) {
        this.chatGateway.notifyNewMessage(createdMessage.chatId, newMessage, member.toString());
      }
    }
    return newMessage;
  }

  async getMessages(chatId: string): Promise<Message[]> {

    return this.messageModel
      .find({ chatId })
      .sort({ timestamp: -1 })
      .populate('sender', 'firstName lastName username status')
      .populate('readBy', 'firstName lastName')
  }

  async markMessagesAsRead(chatId: string, userId: string): Promise<any> {

    await this.messageModel.updateMany(
      { 
        chatId: new mongoose.Types.ObjectId(chatId),
        readBy: { $ne: userId } 
      },
      { $addToSet: { readBy: userId } }
    );

    return { "readBy": userId };
  }


  async markChatAsRead(chatId: string, userId: string): Promise<Chat> {
    const chatData = await this.chatModel.findById(chatId);
    if (!chatData) {
      throw new NotFoundException('Chat no encontrado');
    }

    if (chatData.unreadCounts && chatData.unreadCounts[userId]) {
      chatData.unreadCounts[userId] = 0;
    }
    chatData.markModified('unreadCounts');
    await chatData.save();
    return chatData;
  }
}