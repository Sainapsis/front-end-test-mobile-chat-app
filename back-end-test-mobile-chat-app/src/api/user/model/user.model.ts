import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User {
  @Prop({required: true})
  firstName: string;

  @Prop({required: true})
  lastName: string;

  @Prop({ lowercase: true, unique: true, required: true })
  username: string;

  @Prop({ select: false, required: true })
  password: string;

  @Prop({enum: ["online", "offline", "away"], required: true, default: "online"})
  status: string;

  @Prop()
  avatar: string;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});