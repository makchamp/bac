require("dotenv").config();
const session = require("express-session");
const express = require("express");
const setUpHandlers = require("./handlers");
const app = express();
const httpServer = require("http").createServer(app);
const store = require("./store")(session);

const {
  PORT,
  CLIENT_PROTOCOL,
  CLIENT_DOMAIN,
  CLIENT_PORT,
  SESSION_SECRET
} = process.env;

const CLIENT = CLIENT_PORT ? `${CLIENT_PROTOCOL}://${CLIENT_DOMAIN}:${CLIENT_PORT}` : `${CLIENT_PROTOCOL}://${CLIENT_DOMAIN}`;

const sessionMiddleware = session({
  store,
  secret: SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    sameSite: "strict",
  },
});

const sessionRoute = (route) => {
  const routes = ["/", "/ping"];
  const inRoom = route.includes("/room");
  return routes.includes(route) || inRoom;
};

app.use((req, res, next) => {
  if (sessionRoute(req.url)) {
    sessionMiddleware(req, res, next);
  } else {
    next();
  }
});

const options = {
  cors: {
    origin: [CLIENT],
    methods: ["GET", "POST"],
    credentials: true,
  },
};

const io = require("socket.io")(httpServer, options);
const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);
io.use(wrap(sessionMiddleware));

io.on("connection", (socket) => {
  setUpHandlers(io, socket, store);
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}!`);
});
