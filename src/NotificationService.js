const { Expo } = require('expo-server-sdk');
let expo = new Expo();

async function sendPushNotification(receiverId, message) {
  const userRef = db.collection('users').doc(receiverId);
  const doc = await userRef.get();

  if (!doc.exists || !Expo.isExpoPushToken(doc.data().pushToken)) {
    console.error('No valid push token found for user:', receiverId);
    return;
  }

  let notifications = [{
    to: doc.data().pushToken,
    sound: 'default',
    body: message.text,
    data: { withSome: 'data' },
  }];

  let chunks = expo.chunkPushNotifications(notifications);
  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log('Notification ticket:', ticketChunk);
      // Additional logic for handling the tickets as needed
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }
}

module.exports = { sendPushNotification };