import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './api/auth/auth.module';
import { UserModule } from './api/user/user.module';
import { DBModule } from './api/db/db.module';
import { ChatModule } from './api/chat/chat.module';
import { MessageModule } from './api/message/message.module';

@Module({
  imports: [
    DBModule,
    AuthModule,
    UserModule, 
    ChatModule,
    MessageModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
