require("dotenv").config();
const session = require("express-session");
const express = require("express");
const setUpHandlers = require("./handlers");
const path = require("path");
const app = express();
const httpServer = require("http").createServer(app);
const store = require("./store")(session);

const { SESSION_SECRET, CLIENT_BUILD_DIR } = process.env;

const PORT = process.env.PORT || "4000";
const HOST = process.env.HOST || `http://localhost:${PORT}`;
const clientPath = CLIENT_BUILD_DIR || "../client/build";

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

app.use(express.static(path.join(__dirname, clientPath)));
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, clientPath, "index.html"));
});

const options = {
  cors: {
    origin: [HOST, "http://localhost:3000"],
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
