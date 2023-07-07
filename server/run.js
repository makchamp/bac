require('dotenv').config();
const session = require("express-session");
const express = require('express');
const setUpHandlers = require('./handlers');
const path = require('path');
const app = express();
const httpServer = require('http').createServer(app);
const store = require('./store')(session);

const {
  CLIENT_URL,
  SESSION_SECRET,
  CLIENT_BUILD_DIR,
} = process.env;

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || '4000'
const NODE_ENV = process.env.NODE_ENV || 'development';
const clientPath = CLIENT_BUILD_DIR || '../client/build';


const sessionMiddleware = session({
  store,
  secret: SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    sameSite: 'lax',
  }
});
const sessionRoute = (route) => {
  const routes = ['/', '/ping'];
  const inRoom = route.includes('/room');
  return routes.includes(route) || inRoom;
} 
const check = app.use((req, res, next) => {
  if (sessionRoute(req.url)) {
    sessionMiddleware(req, res, next);
  }
  else {
    next();
  }
});

// Used in development to set cross server session cookie
if (NODE_ENV === 'development') {
  app.set('trust proxy', 1);
  app.get("/ping", (req, res) => {
    res.sendStatus(200);
  });
}

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
  setUpHandlers(io, socket, store);
});

httpServer.listen(PORT, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
