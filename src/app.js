const express = require('express');
const app = express();
const cors = require('cors');
const merchRepo = require('./repositories/MerchRepo');
const http = require('http');
const server = http.createServer(app);

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


server.listen(PORT,'0.0.0.0', () => {
  console.log(`app is listening on port ${PORT}`);
});