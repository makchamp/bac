require('dotenv').config()
const app = require('express')();
const httpServer = require('http').createServer(app);
const setUpHandlers = require('./handlers');

const {
  SERVER_URL,
  CLIENT_URL,
  SERVER_PORT,
} = process.env;

const options = {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST']
  }
};
const io = require('socket.io')(httpServer, options);

io.on('connection', socket => {
  setUpHandlers(io, socket);
});

httpServer.listen(SERVER_PORT, () => {
  console.log(`Server running at ${SERVER_URL}`);
});
