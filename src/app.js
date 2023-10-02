const express = require('express');
const app = express();
const cors = require('cors');
const puppeteer = require('puppeteer');
const merchRepo = require('./repositories/MerchRepo');
const http = require('http');
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { getCatalog } = require('merchnow-api-node');
const PORT = process.env.PORT || 8080;


app.get('/:artist', cors(), async (req, res) => {
  const results = await merchRepo.getHotTopicMerch(req.params.artist);
  res.json(results);
});

server.listen(PORT, () => {
  console.log(`app is listening on port ${PORT}`);
});