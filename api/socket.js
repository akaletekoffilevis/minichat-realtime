import { Server } from "socket.io";

const messages = {};
const users = {};

export default function handler(req, res) {
  if (res.socket?.server?.io) {
    res.end();
    return;
  }

  if (res.socket?.server) {
    const io = new Server(res.socket.server, {
      path: "/api/socket",
      cors: { origin: "*", methods: ["GET", "POST"] },
      transports: ["websocket", "polling"],
    });
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      socket.on("join", ({ room, username }) => {
        socket.join(room);
        users[socket.id] = { username, room };
        if (!messages[room]) messages[room] = [];
        const usersInRoom = Object.values(users)
          .filter((u) => u.room === room)
          .map((u) => u.username);
        socket.emit("history", { messages: messages[room], users: usersInRoom });
        socket.to(room).emit("user-joined", { username, users: usersInRoom });
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
          io.to(user.room).emit("user-left", { username: user.username });
          delete users[socket.id];
        }
      });
    });
  }

  res.end();
}
