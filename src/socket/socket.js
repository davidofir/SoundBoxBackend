const { Server } = require('socket.io');

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`); // Log new user connection

    socket.on('join-room', (roomId, userId) => {
      socket.join(roomId);

      console.log(`User ${userId} joined room ${roomId}`); // Log user joining room

      // Emit a message to the room that a new user has joined
      socket.to(roomId).emit('user-connected', userId);

      // Listen for incoming messages from the room
      socket.on('message', (message) => {
        console.log('Received message:', message); // Log the received message
        console.log(`To room`,roomId)
        // Broadcast the message to all users in the room
        socket.to(roomId).emit('message', message);
      });

      // Leave the chat room when the user disconnects
      socket.on('disconnect', () => {
        console.log(`User ${userId} disconnected`); // Log user disconnection

        socket.to(roomId).emit('user-disconnected', userId);
        socket.leave(roomId);
      });
    });

    // Log socket errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Log server errors
  io.on('error', (error) => {
    console.error('Server error:', error);
  });

  return io;
}

module.exports = setupSocket;