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
  if (["pdf"].includes(ext)) return "📄";
  if (["doc", "docx"].includes(ext)) return "📝";
  if (["txt"].includes(ext)) return "📃";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "🗜️";
  if (["mp3", "wav", "ogg", "flac"].includes(ext)) return "🎵";
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

  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesRef = useRef(null);
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    const handleScroll = () => {
      setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 200);
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

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
    socket.connect();
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
    const ext = file.name.split(".").pop()?.toLowerCase();
    const videos = ["mp4", "webm", "mov", "avi", "mkv", "m4v"];
    if (videos.includes(ext)) {
      alert("Les vidéos ne sont pas supportées");
      return;
    }
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
      <div className="landing">
        <nav className="nav">
          <div className="nav-inner">
            <div className="nav-brand">
              <span className="nav-logo">💬</span>
              <span className="nav-name">Discutons</span>
            </div>
            <div className="nav-right">
              <span className="nav-badge">{availableRooms.reduce((s, r) => s + r.users, 0)} en ligne</span>
            </div>
          </div>
        </nav>

        <section className="hero">
          <div className="hero-bg" />
          <div className="hero-glow" />
          <div className="hero-content">
            <div className="hero-badge">Gratuit • Sans inscription • Temps réel</div>
            <h1 className="hero-title">
              Discutez <span className="gradient-text">instantanément</span>
              <br />avec qui vous voulez
            </h1>
            <p className="hero-sub">
              Créez ou rejoignez un salon en 5 secondes. Zéro inscription, zéro email, zéro publicité.
            </p>
            <button className="hero-cta" onClick={() => document.getElementById("join-form")?.scrollIntoView({ behavior: "smooth" })}>
              Commencer à discuter
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
        </section>

        <section className="how-it-works">
          <div className="section-label">Fonctionnement</div>
          <h2 className="section-title">Trois étapes, pas une de plus</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Choisissez un pseudo</h3>
              <p>Un nom unique pour vous identifier dans le salon</p>
            </div>
            <div className="step-connector" />
            <div className="step">
              <div className="step-number">2</div>
              <h3>Créez ou rejoignez</h3>
              <p>Tapez #nom ou cliquez sur un salon actif</p>
            </div>
            <div className="step-connector" />
            <div className="step">
              <div className="step-number">3</div>
              <h3>Discutez !</h3>
              <p>Messages, stickers, audios et fichiers en temps réel</p>
            </div>
          </div>
        </section>

        <section className="features">
          <div className="section-label">Fonctionnalités</div>
          <h2 className="section-title">Tout ce dont vous avez besoin</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-card-glow" />
              <span className="feature-icon">💬</span>
              <h3>Messages en direct</h3>
              <p>Texte en temps réel, instantané, sans latence. Propulsé par Socket.io.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-glow" />
              <span className="feature-icon">😊</span>
              <h3>Stickers & emojis</h3>
              <p>Exprimez-vous avec notre sélection de 30 stickers animés.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-glow" />
              <span className="feature-icon">🎤</span>
              <h3>Messages audio</h3>
              <p>Enregistrez et envoyez un message vocal directement depuis le navigateur.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-glow" />
              <span className="feature-icon">📎</span>
              <h3>Fichiers & images</h3>
              <p>Partagez des images, PDFs, documents texte, et archives.</p>
            </div>
          </div>
        </section>

        {availableRooms.length > 0 && (
          <section className="rooms-section">
            <div className="section-label">En direct</div>
            <h2 className="section-title">Salons actifs</h2>
            <p className="rooms-sub">Cliquez sur un salon pour le rejoindre instantanément</p>
            <div className="rooms-grid">
              {availableRooms.map((r) => (
                <button key={r.name} className="room-card" onClick={() => { setRoom(r.name); document.getElementById("join-form")?.scrollIntoView({ behavior: "smooth" }); }}>
                  <span className="room-card-icon">#</span>
                  <span className="room-card-name">{r.name}</span>
                  <span className="room-card-users">{r.users} en ligne</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="join-section" id="join-form">
          <div className="join-card-landing">
            <div className="join-card-glow" />
            <h2>Rejoindre la conversation</h2>
            <p className="join-sub">Entrez votre pseudo et choisissez un salon</p>
            <div className="join-fields">
              <div className="join-input-group">
                <label className="join-label">Pseudo</label>
                <input
                  placeholder="Votre pseudo"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && joinRoom()}
                />
              </div>
              <div className="join-input-group">
                <label className="join-label">Salon</label>
                <input
                  placeholder="#salon (ou laissez vide pour un salon aléatoire)"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && joinRoom()}
                />
              </div>
              {error && <div className="join-error-landing">{error}</div>}
              <button className="join-btn" onClick={() => joinRoom()} disabled={connecting || !username.trim()}>
                {connecting ? (
                  <span className="join-btn-loading">
                    <span className="spinner" />
                    Connexion...
                  </span>
                ) : "Rejoindre le salon"}
              </button>
            </div>
          </div>
        </section>

        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-brand">
              <span className="footer-logo">💬</span>
              <span className="footer-name">Discutons</span>
              <span className="footer-version">v1.0</span>
            </div>
            <div className="footer-links">
              <a href="mailto:koffilevis21@gmail.com" className="footer-link" title="Envoyer un email">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                koffilevis21@gmail.com
              </a>
              <a href="https://github.com/akaletekoffilevis/minichat-realtime" target="_blank" rel="noopener noreferrer" className="footer-link" title="Voir sur GitHub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                GitHub
              </a>
            </div>
          </div>
          <p className="footer-copy">© {new Date().getFullYear()} Discutons — Projet open source</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="chat-screen">
      <div className="chat-header">
        <div>
          <span className="chat-header-brand">💬 Discutons</span>
          <span className="room-label">Salon</span>
          <strong>#{room}</strong>
          <button className="btn-link-share" onClick={copyLink} title="Copier le lien d'invitation">
            {copied ? "✅ Copié !" : "🔗 Partager"}
          </button>
        </div>
        <div className="header-right">
          <span className="user-name">{username}</span>
          <span className="users-badge">{users.length} en ligne</span>
        </div>
      </div>

      {copied && <div className="toast">✓ Lien copié !</div>}

      <div className="messages" ref={messagesRef}>
        {messages.length === 0 && (
          <div className="msg-empty">
            <span className="msg-empty-icon">💬</span>
            <p>Aucun message pour l'instant</p>
            <span>Soyez le premier à écrire !</span>
          </div>
        )}
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
                    return (
                      <>
                        {isImage && <img src={msg.content.data} alt={fname} className="file-preview" />}
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
        {showScrollBtn && (
          <button className="scroll-bottom" onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}>
            ↓
          </button>
        )}
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
