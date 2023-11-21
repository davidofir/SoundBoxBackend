const { Server } = require('socket.io');
const { admin, db } = require('../firebase');  // Import from your config file
const crypto = require('crypto');
const { sendPushNotification } = require('../NotificationService');
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
      socket.on('message', async (message) => {  // Made async to allow await
        console.log('Received message:', message);  // Log the received message
        console.log(`To room`, roomId);
    
        // Save the message to Firestore
        const messagesCollection = db.collection('chat-rooms').doc(roomId).collection('messages');
        try {
          let receiverID = roomId.replace(message.user._id,'');
          receiverID = receiverID.replace('-','');
            await messagesCollection.add({
                //id:crypto.randomBytes(16).toString('hex'),
                id:message.id,
                message: message.text,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                senderID: message.user._id,
                receiverID: receiverID
            });
    
            // Broadcast the message to all users in the room
            socket.to(roomId).emit('message', message);
            await sendPushNotification(receiverID,message);
            // Check message count and trim old messages if necessary
            const maxMessages = 50;  // Adjust as needed
            const snapshot = await messagesCollection.orderBy('timestamp').get();
            if (snapshot.size > maxMessages) {
                const oldMessagesSnapshot = await messagesCollection.orderBy('timestamp').limit(snapshot.size - maxMessages).get();
                const batch = db.batch();
                oldMessagesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
                await batch.commit();
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
