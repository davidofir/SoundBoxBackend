// app.js

const express = require('express');
const app = express();
const cors = require('cors');
const puppeteer = require('puppeteer');
const merchRepo = require('./repositories/MerchRepo');
const http = require('http');
const server = http.createServer(app);
const setupSocket = require('./socket/socket');

const { admin, db } = require('./firebase');  // Import from your config file

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { getCatalog } = require('merchnow-api-node');
const PORT = process.env.PORT || 8080;

app.get('/merchnow/:artist', cors(), async (req, res) => {
  const results = await getCatalog(req.params.artist);
  console.log(results);
  await res.json(results);
});

app.get('/topic/:artist', cors(), async (req, res) => {
  const results = await merchRepo.getHotTopicMerch(req.params.artist);
  res.json(results);
});
app.get('/getPastMessages/:roomId', cors(), async (req, res) => {
  try {
    const { roomId } = req.params;
    const roomDocRef = db.collection('chat-rooms').doc(roomId);
    const doc = await roomDocRef.get();
    if (doc.exists) {
      const roomData = doc.data();
      const messages = roomData.messages || [];
      res.json(messages);
    } else {
      console.error('No such document!');
      res.status(404).send('Room Not Found');
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/createMessage', cors(), async (req, res) => {
  try {
    const { roomId, messageText } = req.body;
    console.log(roomId,messageText)
    if (!roomId || !messageText) {
      res.status(400).send('Bad Request: roomId and messageText required');
      return;
    }

    const messagesRef = db.collection('chatRooms').doc(roomId).collection('messages');
    const newMessageRef = messagesRef.doc();
    await newMessageRef.set({
      text: messageText,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    res.status(200).send('Message created successfully');
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).send('Internal Server Error');
  }
});

const io = setupSocket(server);

server.listen(PORT,'0.0.0.0', () => {
  console.log(`app is listening on port ${PORT}`);
});
