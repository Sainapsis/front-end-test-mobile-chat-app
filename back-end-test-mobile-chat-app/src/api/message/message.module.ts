import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Message, MessageSchema } from './model/message.model';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    forwardRef(() => AuthModule),
  ],

  controllers: [],
  providers: [],
  exports: [],
})
export class MessageModule { }