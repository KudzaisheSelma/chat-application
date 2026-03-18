import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors()); app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('user:join', ({ userId, username }) => {
    onlineUsers.set(userId, { socketId: socket.id, username });
    io.emit('users:online', Array.from(onlineUsers.entries()));
  });

  socket.on('message:send', ({ roomId, message, senderId, senderName }) => {
    const msg = { id: Date.now().toString(), roomId, message, senderId, senderName, timestamp: new Date() };
    io.to(roomId).emit('message:received', msg);
  });

  socket.on('room:join', (roomId) => { socket.join(roomId); });

  socket.on('disconnect', () => {
    for (const [userId, data] of onlineUsers.entries()) {
      if (data.socketId === socket.id) { onlineUsers.delete(userId); break; }
    }
    io.emit('users:online', Array.from(onlineUsers.entries()));
  });
});

httpServer.listen(3001, () => console.log('Chat server running on port 3001'));
