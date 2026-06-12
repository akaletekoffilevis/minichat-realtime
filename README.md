# Tchato 💬

Mini chat en ligne temps réel, sans création de compte. Connectez-vous avec un pseudo, partagez le lien, et discutez en toute simplicité.

- 🔌 **Connexion instantanée** — pas d'inscription, juste un pseudo
- 🏠 **Salons** — créez ou rejoignez un salon via `#nom`
- 💬 **Messages texte** en temps réel
- 🎤 **Messages audio** — enregistrement vocal
- 📎 **Partage de fichiers** — images, PDF, vidéos, documents (max 10 Mo)
- 😊 **Stickers** — 30 émojis stickers
- 🔗 **Lien d'invitation** — partagez l'URL du salon
- 👥 **Compteur en ligne** — voyez qui est connecté
- ♻️ **Persistance** — les messages survivent au rechargement de la page

## Stack

| Frontend | Backend | Hébergement |
|----------|---------|-------------|
| React + Vite | Node.js + Socket.io | Koyeb (serveur) + Vercel (frontend) |

## Déploiement

### Serveur → Koyeb (gratuit, sans carte)

1. Va sur https://app.koyeb.com → inscris-toi avec GitHub
2. **Create App** → sélectionne `minichat-realtime`
3. Builder: **Dockerfile** → path: `server/Dockerfile`
4. Port: **8080**
5. Déploie → tu obtiens `https://minichat.koyeb.app`

### Frontend → Vercel

1. Va sur https://vercel.com → New Project → `minichat-realtime`
2. Root Directory: `client`
3. Variables d'environnement :

| Variable | Valeur |
|----------|--------|
| `VITE_SERVER_URL` | `https://minichat.koyeb.app` |

## Développement local

```bash
# Terminal 1 - serveur
cd server && npm install && node index.js

# Terminal 2 - client
cd client && npm install && npm run dev
```

Ouvre http://localhost:5173 — le `VITE_SERVER_URL` du `.env` pointe vers localhost.

## Licence

MIT
