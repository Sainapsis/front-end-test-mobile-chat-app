// chat.gateway.ts
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/socket' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    handleConnection(client: Socket) {
        const userId = client.handshake.query.userId as string;
        if (userId) {
          client.join(userId); // Join personal room using userId
          console.log(`Client connected: ${client.id}, user: ${userId}`);
        }
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('sendMessage')
    async handleSendMessage(
        @MessageBody() payload: { roomId: string; message: any },
        @ConnectedSocket() client: Socket,
    ) {
        this.server.to(payload.roomId).emit('newMessage', payload.message);
    }

    // New method to notify a specific user about a new message
    notifyNewMessage(roomId: string, message: any, targetUserId: string) {
        console.log("here", targetUserId)
        // Emit a 'newMessage' event to the target user's personal room
        this.server.to(targetUserId).emit('newMessage', message);
    }
}
