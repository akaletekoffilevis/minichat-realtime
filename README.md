# Mini Chat 💬

Un mini chat en ligne temps réel, sans création de compte. Connectez-vous avec un pseudo, créez ou rejoignez un salon, et discutez en toute simplicité.

## Fonctionnalités

- 🔌 **Connexion instantanée** — pas d'inscription, juste un pseudo
- 🏠 **Salons** — créez un salon ou rejoignez-en un existant
- 💬 **Messages texte** en temps réel
- 🎤 **Messages audio** — enregistrez et envoyez un message vocal
- 📎 **Partage de fichiers** — images, PDF, vidéos MP4, documents, etc.
- 😊 **Stickers** — 30 émojis stickers intégrés
- 🔗 **Lien d'invitation** — partagez le lien du salon pour inviter quelqu'un
- 👥 **Compteur en ligne** — voyez qui est connecté
- ♻️ **Persistance** — les messages survivent au rechargement de la page (tant que le serveur tourne)

## Stack technique

| Frontend | Backend | Déploiement |
|----------|---------|-------------|
| React 18 + Vite | Node.js + Express + Socket.io | Vercel (frontend) + Render (backend) |

## Démarrage rapide en local

### Prérequis

- Node.js 18+
- npm

### 1. Lancer le serveur

```bash
cd server
npm install
node index.js
```

Le serveur démarre sur `http://localhost:4000`.

### 2. Lancer le client

```bash
cd client
npm install
npm run dev
```

Le client démarre sur `http://localhost:5173`.

### 3. Tester

- Ouvre `http://localhost:5173` dans deux navigateurs différents
- Entre un pseudo différent dans chaque (ex: "Alice" et "Bob")
- Utilise le **même nom de salon** ou laisse vide pour un salon aléatoire
- Clique sur 🔗 **Partager** pour copier le lien et l'envoyer à l'autre personne

## Structure du projet

```
mini-chat/
├── server/                  # Serveur Socket.io
│   ├── index.js             # Point d'entrée du serveur
│   └── package.json
├── client/                  # Frontend React + Vite
│   ├── src/
│   │   ├── App.jsx          # Composant principal
│   │   ├── App.css          # Styles
│   │   └── main.jsx         # Point d'entrée React
│   ├── index.html
│   ├── vite.config.js       # Configuration Vite
│   ├── .env                 # Variables d'environnement locales
│   └── package.json
├── api/                     # Fonction Vercel (déploiement)
│   └── socket.js
├── vercel.json              # Configuration Vercel
└── package.json             # Racine monorepo
```

## Architecture

### Communication en temps réel (Socket.io)

1. Le client se connecte au serveur via Socket.io (WebSocket + fallback HTTP)
2. L'utilisateur émet un événement `join` avec son pseudo et le nom du salon
3. Le serveur stocke les infos en mémoire et notifie les autres membres
4. Les messages sont diffusés à tout le salon via `broadcast`
5. Les messages sont conservés en mémoire sur le serveur (array)

### Types de messages supportés

| Type | Description | Affichage |
|------|-------------|-----------|
| `text` | Texte brut | Bulle de message |
| `sticker` | Émoji sticker | Grande taille |
| `audio` | Enregistrement vocal WebM | Lecteur audio |
| `file` | Fichier (image, PDF, vidéo, etc.) | Prévisualisation + lien de téléchargement |

### Stockage

- **Aucune base de données** — messages stockés en mémoire RAM sur le serveur
- Les messages persistent tant que le serveur ne redémarre pas
- Un rechargement de page côté client ne perd pas les messages
- Un redémarrage du serveur efface tout (volontaire)

## Déploiement

### Frontend → Vercel

```bash
cd client
npm run build
```

Déploie le dossier `client/dist` sur Vercel.

### Backend → Render

1. Va sur [render.com](https://render.com) → New Web Service
2. Connecte ton repo GitHub
3. Root directory: `server`
4. Start command: `node index.js`
5. Ajoute `VITE_SERVER_URL=https://ton-app.onrender.com` dans les env vars du frontend Vercel

### Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `VITE_SERVER_URL` | URL du serveur Socket.io | `http://localhost:4000` |
| `VITE_SOCKET_PATH` | Chemin Socket.io (nécessaire pour Vercel) | `/socket.io` |
| `PORT` | Port du serveur | `4000` |

## Licence

MIT
