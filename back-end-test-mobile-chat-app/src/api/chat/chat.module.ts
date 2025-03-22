import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Chat, ChatSchema } from './model/chat.model';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Message, MessageSchema } from '../message/model/message.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }, { name: Message.name, schema: MessageSchema }]),
    forwardRef(() => AuthModule),
  ],

  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule { }