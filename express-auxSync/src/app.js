const express = require('express');
const cors = require('cors');
const { createServer } = require('node:http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(cors());

app.get('/AuxSync/', (req, res) => {
  res.send('Hello World!');
});

server.listen(3001, () => {
  console.log('Server is running on port 3001');
});