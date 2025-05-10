import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

@Schema()
export class Message {
  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  timestamp: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  sender: mongoose.Types.ObjectId;

  @Prop()
  response: string;

  @Prop()
  responseTo: string;

  @Prop()
  responseId: string;

  @Prop()
  media: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true })
  chatId: mongoose.Types.ObjectId;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] })
  readBy: mongoose.Types.ObjectId[];
}

export type MessageDocument = Message & Document;
export const MessageSchema = SchemaFactory.createForClass(Message);