require('dotenv').config();
const session = require("express-session");
const express = require('express');
const setUpHandlers = require('./handlers');
const path = require('path');
const app = express();
const httpServer = require('http').createServer(app);

const {
  PORT,
  HOST,
  CLIENT_URL,
  SESSION_SECRET,
  CLIENT_BUILD_DIR,z
} = process.env;
const NODE_ENV = process.env.NODE_ENV || 'development';

const sessionMiddleware = session({
  secret: SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    sameSite: 'lax',
  }
});
app.use(sessionMiddleware);

// Used in development to set cross server session cookie
if (NODE_ENV === 'development') {
  app.set('trust proxy', 1);
  app.get("/ping", (req, res) => {
    res.sendStatus(200);
  });
}
const clientPath = CLIENT_BUILD_DIR || '../client/build'; 
app.use(express.static(path.join(__dirname, clientPath)));
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, clientPath, 'index.html'));
});

const options = {
  cors: {
    origin: [CLIENT_URL, 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
};
const io = require('socket.io')(httpServer, options);
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(sessionMiddleware));

io.on('connection', (socket) => {
  setUpHandlers(io, socket);
});

httpServer.listen(PORT, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
