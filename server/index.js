import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  transports: ["websocket", "polling"],
});

const messages = {};
const users = {};
const usedUsernames = new Set();

const getRoomUsers = (room) =>
  Object.values(users)
    .filter((u) => u.room === room)
    .map((u) => u.username);

const getRooms = () => {
  const roomMap = {};
  Object.values(users).forEach((u) => {
    if (!roomMap[u.room]) roomMap[u.room] = 0;
    roomMap[u.room]++;
  });
  Object.keys(messages).forEach((room) => {
    if (!roomMap[room]) roomMap[room] = 0;
  });
  return Object.entries(roomMap).map(([name, count]) => ({ name, users: count }));
};

const broadcastRooms = () => {
  io.emit("rooms-list", getRooms());
};

io.on("connection", (socket) => {
  console.log("Connecté:", socket.id);

  socket.on("get-rooms", () => {
    socket.emit("rooms-list", getRooms());
  });

  socket.on("join", ({ room, username }) => {
    const name = username.trim();
    const prev = users[socket.id];
    if (prev && prev.username !== name) {
      if (usedUsernames.has(name)) {
        socket.emit("join-error", "Ce pseudo est déjà utilisé");
        return;
      }
    }
    if (prev) {
      if (prev.username === name && prev.room === room) {
        socket.emit("join-error", "Vous êtes déjà dans ce salon");
        return;
      }
      socket.leave(prev.room);
      socket.to(prev.room).emit("user-left", { username: prev.username });
      usedUsernames.delete(prev.username);
    }
    if (usedUsernames.has(name) && (!prev || prev.username !== name)) {
      socket.emit("join-error", "Ce pseudo est déjà utilisé");
      return;
    }
    socket.join(room);
    users[socket.id] = { username: name, room };
    usedUsernames.add(name);
    if (!messages[room]) messages[room] = [];
    const usersInRoom = getRoomUsers(room);
    socket.emit("history", { messages: messages[room], users: usersInRoom });
    socket.to(room).emit("user-joined", { username: name, users: usersInRoom });
    broadcastRooms();
    console.log(`${name} a rejoint ${room}`);
  });

  socket.on("message", ({ room, type, content, username }) => {
    const msg = { username, type, content, time: Date.now() };
    if (!messages[room]) messages[room] = [];
    messages[room].push(msg);
    socket.broadcast.to(room).emit("message", msg);
  });

  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      socket.to(user.room).emit("user-left", { username: user.username });
      usedUsernames.delete(user.username);
      delete users[socket.id];
      broadcastRooms();
      console.log(`${user.username} a quitté`);
    }
  });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => console.log("Serveur démarré sur le port", PORT));
