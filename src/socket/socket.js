const { Server } = require('socket.io');
const { admin, db } = require('../firebase');  // Import from your config file
const crypto = require('crypto');
function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);  // Log new user connection

    socket.on('join-room', (roomId, userId) => {
      socket.join(roomId);

      console.log(`User ${userId} joined room ${roomId}`);  // Log user joining room

      // Emit a message to the room that a new user has joined
      socket.to(roomId).emit('user-connected', userId);

      // Listen for incoming messages from the room
      socket.on('message', async (message) => {
        console.log('Received message:', message);
      
        const messagesCollection = db.collection('chat-rooms').doc(roomId).collection('messages');
        
        try {
          // Check if the message ID already exists to prevent duplicates
          const existingDoc = await messagesCollection.doc(message._id).get();
          
          if (!existingDoc.exists) {
            await messagesCollection.doc(message._id).set({
              message: message.text,
              timestamp: admin.firestore.FieldValue.serverTimestamp(),
              senderID: message.user._id,
              receiverID: roomId.replace(message.user._id,'').replace('-','')
            });
      
            // Broadcast the message to all users in the room EXCEPT the sender
            socket.to(roomId).emit('message', message);
            
            // Acknowledge the sender only, without emitting it to the room
            socket.emit('message-ack', { id: message._id });
          } else {
            console.log(`Duplicate message received with ID: ${message._id}`);
            // Acknowledge the sender to confirm receipt
            socket.emit('message-ack', { id: message._id });
          }
        } catch (error) {
          console.error('Error handling message:', error);
        }
      });
    
    

      // Leave the chat room when the user disconnects
      socket.on('disconnect', () => {
        console.log(`User ${userId} disconnected`);  // Log user disconnection

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
