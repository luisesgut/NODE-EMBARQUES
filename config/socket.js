// config/socket.js
const { Server } = require('socket.io');

let io = null;

exports.initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Puedes restringir a tu dominio
      methods: ["GET", "POST"]
    }
  });
  
  io.on('connection', (socket) => {
    console.log('🔌 Cliente conectado:', socket.id);
    
    socket.on('disconnect', () => {
      console.log('🔌 Cliente desconectado:', socket.id);
    });
  });
  
  return io;
};

exports.io = () => io;
