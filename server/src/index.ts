require('dotenv').config();
import session from 'express-session';
import express from 'express';
import setUpHandlers from './handlers';
import { Server, ServerOptions } from 'socket.io';
const app = express();
const httpServer = require('http').createServer(app);
const store = require('./store')(session);

const { PORT, CLIENT_PROTOCOL, CLIENT_DOMAIN, CLIENT_PORT, SESSION_SECRET } =
  process.env;

const CLIENT = CLIENT_PORT
  ? `${CLIENT_PROTOCOL}://${CLIENT_DOMAIN}:${CLIENT_PORT}`
  : `${CLIENT_PROTOCOL}://${CLIENT_DOMAIN}`;

const sessionMiddleware = session({
  store,
  secret: SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    sameSite: 'strict',
    secure: 'auto'
  },
});

const serverOptions : Partial<ServerOptions> = {
  cors: {
    origin: CLIENT,
    credentials: true,
  },
}
const io = new Server(httpServer, serverOptions);
app.use(sessionMiddleware);  
io.engine.use(sessionMiddleware);

io.on('connection', (socket) => {
  setUpHandlers(io, socket, store);
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}!`);
});
