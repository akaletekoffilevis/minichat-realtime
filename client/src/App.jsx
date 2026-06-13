import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "./App.css";

const serverUrl = import.meta.env.VITE_SERVER_URL || "";
const socket = io(serverUrl, {
  autoConnect: false,
  transports: ["websocket", "polling"],
  path: import.meta.env.VITE_SOCKET_PATH || "/socket.io",
});

const STICKERS = [
  "😊", "😂", "❤️", "🔥", "👍", "🎉", "😍", "💀",
  "🙏", "😭", "🥺", "😅", "👀", "✨", "💪", "🤣",
  "😎", "🤔", "🙌", "💯", "👋", "🎊", "⭐", "😈",
  "🫡", "🥳", "😴", "🤯", "🫠", "🗿",
];

const fileIcon = (name) => {
  const ext = name?.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext)) return "🖼️";
  if (["mp4", "webm", "mov", "avi", "mkv"].includes(ext)) return "🎬";
  if (["mp3", "wav", "ogg", "flac"].includes(ext)) return "🎵";
  if (["pdf"].includes(ext)) return "📄";
  if (["doc", "docx"].includes(ext)) return "📝";
  if (["txt"].includes(ext)) return "📃";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "🗜️";
  return "📎";
};

const genId = () => Math.random().toString(36).substring(2, 8);

export default function App() {
  const [joined, setJoined] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [availableRooms, setAvailableRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [users, setUsers] = useState([]);
  const [recording, setRecording] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const stickerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handle = (e) => {
      if (stickerRef.current && !stickerRef.current.contains(e.target)) {
        setShowStickers(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get("room");
    if (r) setRoom(r);
  }, []);

  useEffect(() => {
    socket.on("rooms-list", (rooms) => {
      setAvailableRooms(rooms);
    });
    socket.on("connect", () => {
      socket.emit("get-rooms");
    });
    if (socket.connected) {
      socket.emit("get-rooms");
    }
    return () => {
      socket.off("rooms-list");
    };
  }, []);

  const joinRoom = (roomName) => {
    if (!username.trim()) return;
    const name = roomName || room.trim().replace(/^#+/, "") || genId();
    setRoom(name);
    setConnecting(true);
    setError("");

    socket.on("connect", () => {
      socket.emit("join", { room: name, username: username.trim() });
    });

    socket.on("history", ({ messages: msgs, users: usrs }) => {
      setMessages(msgs || []);
      setUsers(usrs || []);
      setConnecting(false);
      setJoined(true);
    });

    socket.on("join-error", (msg) => {
      setError(msg);
      setConnecting(false);
    });

    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("user-joined", ({ username: u, users: usrs }) => {
      setUsers(usrs);
      setMessages((prev) => [...prev, { system: true, text: `👋 ${u} a rejoint le salon` }]);
    });

    socket.on("user-left", ({ username: u }) => {
      setUsers((prev) => prev.filter((x) => x !== u));
      setMessages((prev) => [...prev, { system: true, text: `🚪 ${u} a quitté le salon` }]);
    });

    socket.on("connect_error", (err) => {
      setError("Impossible de se connecter au serveur: " + err.message);
      setConnecting(false);
    });

    if (!socket.connected) socket.connect();
    else socket.emit("join", { room: name, username: username.trim() });
  };

  const shareLink = () => {
    const base = window.location.origin + window.location.pathname;
    return base + "?room=" + encodeURIComponent(room);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const sendMsg = (type, content) => {
    socket.emit("message", { room, type, content, username });
    setMessages((prev) => [...prev, { username, type, content, time: Date.now(), own: true }]);
  };

  const sendText = () => {
    if (!input.trim()) return;
    sendMsg("text", input);
    setInput("");
  };

  const sendSticker = (emoji) => {
    sendMsg("sticker", emoji);
    setShowStickers(false);
  };

  const sendFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("Fichier trop volumineux (max 10 Mo)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      sendMsg("file", { name: file.name, size: file.size, type: file.type, data: reader.result });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorder.current = recorder;
      chunks.current = [];
      setRecording(true);

      recorder.ondataavailable = (e) => chunks.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = () => {
          sendMsg("audio", reader.result);
          setRecording(false);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
    } catch (err) {
      alert("Erreur d'accès au microphone: " + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
    }
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0");
  };

  const fmtSize = (bytes) => {
    if (bytes < 1024) return bytes + " o";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " Ko";
    return (bytes / 1048576).toFixed(1) + " Mo";
  };

  if (!joined) {
    return (
      <div className="join-screen">
        <div className="join-card">
          <div className="join-logo">💬</div>
          <h1>Mini Chat</h1>
          <p>Entrez votre pseudo et un salon</p>
          <input
            placeholder="Votre pseudo"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && joinRoom()}
          />
          <input
            placeholder="#monsalon (laisser vide = aléatoire)"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && joinRoom()}
          />
          {error && <div className="join-error">{error}</div>}
          <button onClick={() => joinRoom()} disabled={connecting || !username.trim()}>
            {connecting ? "Connexion..." : "Créer / Rejoindre le salon"}
          </button>
          {!room.trim() && (
            <p className="join-hint">
              Laissez vide pour un salon aléatoire, ou tapez #nom
            </p>
          )}
          {availableRooms.length > 0 && (
            <div className="room-list">
              <p className="room-list-title">Salons actifs</p>
              {availableRooms.map((r) => (
                <button key={r.name} className="room-item" onClick={() => joinRoom(r.name)}>
                  <span className="room-item-name">#{r.name}</span>
                  <span className="room-item-users">{r.users} en ligne</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="chat-screen">
      <div className="chat-header">
        <div>
          <span className="room-label">Salon</span>
          <strong>#{room}</strong>
          <button className="btn-link-share" onClick={copyLink} title="Copier le lien d'invitation">
            {copied ? "✅ Lien copié !" : "🔗 Partager"}
          </button>
        </div>
        <div className="header-right">
          <span className="user-name">{username}</span>
          <span className="users-badge">{users.length} en ligne</span>
        </div>
      </div>

      {copied && <div className="toast">Lien copié dans le presse-papier !</div>}

      <div className="messages">
        {messages.map((msg, i) => {
          if (msg.system) {
            return (
              <div key={i} className="msg-system">
                <span>{msg.text}</span>
              </div>
            );
          }
          return (
            <div key={i} className={`msg ${msg.own ? "own" : "other"}`}>
              <div className="msg-header">
                <strong>{msg.username}</strong>
                <span className="time">{msg.time ? formatTime(msg.time) : ""}</span>
              </div>

              {msg.type === "text" && <p className="msg-text">{msg.content}</p>}

              {msg.type === "sticker" && <span className="msg-sticker">{msg.content}</span>}

              {msg.type === "audio" && <audio controls src={msg.content} className="msg-audio" />}

              {msg.type === "file" && (
                <div className="msg-file">
                  {(() => {
                    const fname = msg.content.name || "";
                    const ext = fname.split(".").pop()?.toLowerCase();
                    const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext);
                    const isVideo = ["mp4", "webm", "mov", "avi", "mkv"].includes(ext);
                    return (
                      <>
                        {isImage && <img src={msg.content.data} alt={fname} className="file-preview" />}
                        {isVideo && <video controls src={msg.content.data} className="file-preview" />}
                        <a href={msg.content.data} download={fname} className="file-link">
                          <span className="file-icon">{fileIcon(fname)}</span>
                          <span className="file-info">
                            <span className="file-name">{fname}</span>
                            <span className="file-size">{fmtSize(msg.content.size)}</span>
                          </span>
                          <span className="file-dl">⬇</span>
                        </a>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <button className="btn-icon" onClick={() => fileInputRef.current?.click()} title="Partager un fichier">
          📎
        </button>
        <input type="file" ref={fileInputRef} onChange={sendFile} hidden />

        <input
          placeholder="Écrivez un message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendText()}
        />

        <button className="btn-icon" onClick={() => setShowStickers(!showStickers)} title="Stickers">
          😊
        </button>

        {showStickers && (
          <div className="sticker-picker" ref={stickerRef}>
            {STICKERS.map((s) => (
              <button key={s} className="sticker-btn" onClick={() => sendSticker(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        {recording ? (
          <button className="btn-recording" onClick={stopRecording}>
            ⏹ Arrêter
          </button>
        ) : (
          <button className="btn-icon" onClick={startRecording} title="Enregistrer un audio">
            🎤
          </button>
        )}

        <button className="btn-send" onClick={sendText} disabled={!input.trim()}>
          Envoyer
        </button>
      </div>
    </div>
  );
}
