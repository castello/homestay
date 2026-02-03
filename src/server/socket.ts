import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

export function initSocket(httpServer: HTTPServer) {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join', (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined`);
    });

    socket.on('join-room', (roomId: string) => {
      socket.join(`room:${roomId}`);
    });

    socket.on('leave-room', (roomId: string) => {
      socket.leave(`room:${roomId}`);
    });

    socket.on('send-message', (data: { roomId: number; content: string; senderId: number }) => {
      io?.to(`room:${data.roomId}`).emit('new-message', {
        roomId: data.roomId,
        content: data.content,
        senderId: data.senderId,
        createdAt: new Date().toISOString(),
      });
    });

    socket.on('typing', (data: { roomId: number; userId: number; isTyping: boolean }) => {
      socket.to(`room:${data.roomId}`).emit('user-typing', {
        userId: data.userId,
        isTyping: data.isTyping,
      });
    });

    socket.on('mark-read', (data: { roomId: number; userId: number }) => {
      socket.to(`room:${data.roomId}`).emit('messages-read', {
        roomId: data.roomId,
        userId: data.userId,
      });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });

  return io;
}

export function getIO() {
  return io;
}

export function emitToUser(userId: number, event: string, data: unknown) {
  io?.to(`user:${userId}`).emit(event, data);
}

export function emitToRoom(roomId: number, event: string, data: unknown) {
  io?.to(`room:${roomId}`).emit(event, data);
}
