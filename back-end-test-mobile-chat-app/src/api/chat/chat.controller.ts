import {
  Controller,
  Post,
  Request,
  Logger,
  HttpException,
  HttpStatus,
  UseGuards,
  Get,
  Param,
  Query,
  DefaultValuePipe,
  ParseIntPipe,

} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/utils/authGuard';
import { Message } from '../message/model/message.model';


@Controller('chat')
export class ChatController {
  logger: Logger;
  constructor(private readonly chatService: ChatService) {
    this.logger = new Logger(ChatController.name);
  }

  @UseGuards(JwtAuthGuard)
  @Get('getChats')
  async find(@Request() req): Promise<any> {
    const user = req.user;
    try{
      const chatList = await this.chatService.findChats(user);
      return chatList;
    }catch (err){
      this.logger.error('Something went wrong in finding chats:', err);
      throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, name: err.name, message: err.message }, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  @UseGuards(JwtAuthGuard)
  @Post('createChat')
  async create(@Request() req): Promise<any> {
    const newChat = req.body;
    try {
      const chat = await this.chatService.create(newChat);
      return chat;
    } catch (err) {
      this.logger.error('Something went wrong in creating chat:', err);
      throw new HttpException({ status: HttpStatus.BAD_REQUEST, name: err.name, message: err.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('sendMessage')
  async sendMessage(@Request() req): Promise<any> {
    const newMessage = req.body;
    const createdBy = req.user;
    try {
      const message = await this.chatService.sendMessage(createdBy._id, newMessage)
      return message;
    } catch (err) {
      this.logger.error('Something went wrong at creating message', err);
      throw new HttpException({ status: HttpStatus.BAD_REQUEST, name: err.name, message: err.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('markAsRead')
  async marAsRead(@Request() req): Promise<any> {
    const chatData = req.body;
    const createdBy = req.user;
    try {
      const message = await this.chatService.markMessagesAsRead(chatData.chatId, createdBy._id);
      await this.chatService.markChatAsRead(chatData.chatId, createdBy._id);
      return message;
    } catch (err) {
      this.logger.error('Something went wrong at creating message', err);
      throw new HttpException({ status: HttpStatus.BAD_REQUEST, name: err.name, message: err.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':chatId/messages')
  async getMessagesPaginated(
    @Param('chatId') chatId: string,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<Message[]> {
    // Si page es 0, se usará la última página por defecto
    return this.chatService.getMessagesPaginated(chatId, page, limit);
  }
}