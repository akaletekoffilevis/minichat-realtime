# Tchato 💬

Mini chat en ligne temps réel, sans création de compte.

- 🔌 **Connexion** avec un pseudo, 0 inscription
- 🏠 **Salons** via `#nom` (ou aléatoire)
- 💬 **Texte**, 🎤 **Audio**, 📎 **Fichiers**, 😊 **Stickers**
- 🔗 **Lien d'invitation** à partager
- 👥 **Compteur en ligne**
- ♻️ **Messages persistants** après rechargement

| Frontend | Backend | Hébergement |
|----------|---------|-------------|
| React + Vite | Node.js + Socket.io | HF Spaces (backend) + Vercel (frontend) |

## Déploiement

Voir [DEPLOY.md](DEPLOY.md)

## Local

```bash
cd server && npm install && node index.js
cd client && npm install && npm run dev
```
