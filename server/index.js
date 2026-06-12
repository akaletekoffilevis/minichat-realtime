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

io.on("connection", (socket) => {
  console.log("Connecté:", socket.id);

  socket.on("join", ({ room, username }) => {
    socket.join(room);
    users[socket.id] = { username, room };
    if (!messages[room]) messages[room] = [];
    const usersInRoom = Object.values(users)
      .filter((u) => u.room === room)
      .map((u) => u.username);
    socket.emit("history", { messages: messages[room], users: usersInRoom });
    socket.to(room).emit("user-joined", { username, users: usersInRoom });
    console.log(`${username} a rejoint ${room}`);
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
      delete users[socket.id];
      console.log(`${user.username} a quitté`);
    }
  });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => console.log("Serveur démarré sur le port", PORT));
