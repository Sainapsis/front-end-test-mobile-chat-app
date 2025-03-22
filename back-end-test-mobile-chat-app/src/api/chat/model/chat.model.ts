import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { Message, MessageSchema } from 'src/api/message/model/message.model';


@Schema()
export class Chat {
  @Prop()
  chatAlias: string;

  @Prop({ 
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
    required: true,
  })
  members: mongoose.Types.ObjectId[];

  // Último mensaje (puede usarse para mostrar un resumen)
  @Prop({ type: MessageSchema })
  lastMessage: Message;

  // Almacena los mensajes recientes (por ejemplo, los últimos 10)
  @Prop({ type: [MessageSchema], default: [] })
  recentMessages: Message[];

  @Prop({ type: Object, default: {} })
  unreadCounts: Record<string, number>;

}

export type ChatDocument = Chat & Document;
export const ChatSchema = SchemaFactory.createForClass(Chat);