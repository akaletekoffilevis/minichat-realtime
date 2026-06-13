<p align="center">
  <br>
  <h1 align="center">💬 Discutons</h1>
  <p align="center">
    Chat instantané sans inscription, gratuit et en temps réel
    <br>
    <a href="https://discutons.vercel.app"><strong>discutons.vercel.app »</strong></a>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React 18">
    <img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white" alt="Vite 5">
    <img src="https://img.shields.io/badge/Socket.io-4-010101?logo=socket.io&logoColor=white" alt="Socket.io 4">
    <img src="https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white" alt="Node.js 20">
    <img src="https://img.shields.io/badge/Vercel-000?logo=vercel&logoColor=white" alt="Vercel">
    <img src="https://img.shields.io/badge/HuggingFace_Space-FFD21E?logo=huggingface&logoColor=black" alt="HF Spaces">
  </p>
</p>

---

**Discutons** est une application de chat en temps réel minimaliste, sans création de compte. Choisissez un pseudo, rejoignez ou créez un salon (#general, #dev, #random…), et discutez instantanément avec d'autres personnes.

---

## ✨ Fonctionnalités

- **🔌 Zéro inscription** — Un pseudo suffit, pas d'email ni de mot de passe
- **🏠 Salons multiples** — Créez ou rejoignez n'importe quel salon avec `#nom`
- **👥 Compteur en ligne** — Voyez qui est connecté dans le salon
- **💬 Texte en temps réel** — Messages instantanés via WebSocket
- **🎤 Enregistrement audio** — Capturez et envoyez un message vocal
- **📎 Partage de fichiers** — Images, PDF, TXT…
- **😊 Stickers** — Sélectionnez un emoji réactif
- **🔗 Lien d'invitation** — Copiez un lien pour inviter quelqu'un dans votre salon
- **♻️ Messages persistants** — L'historique reste après rechargement
- **📱 Responsive** — Fonctionne sur mobile, tablette et desktop
- **🎨 UI moderne** — Design glassmorphism, gradients animés, dark mode

## 🚀 Stack

| Couche | Technologie |
|--------|-------------|
| **Frontend** | React 18 + Vite |
| **Backend** | Node.js + Socket.io |
| **Hébergement** | [Vercel](https://vercel.com) (frontend) + [Hugging Face Spaces](https://huggingface.co/spaces/akalete/discutons) (backend) |
| **Temps réel** | WebSocket (Socket.io) |

## 📦 Déploiement

Le frontend est automatiquement déployé sur **Vercel** à chaque push GitHub.
Le backend est déployé sur **Hugging Face Spaces** via Docker.

Voir [DEPLOY.md](DEPLOY.md) pour les détails.

## 🛠️ Développement local

```bash
# Backend
cd server
npm install
node index.js
# → http://localhost:4000

# Frontend (dans un autre terminal)
cd client
npm install
npm run dev
# → http://localhost:5173
```

## 🗺️ Roadmap

Consultez [FEATURES.md](FEATURES.md) pour la liste complète des fonctionnalités prévues.

## 📬 Contact

- **Email** : [koffilevis21@gmail.com](mailto:koffilevis21@gmail.com)
- **GitHub** : [@akaletekoffilevis](https://github.com/akaletekoffilevis)
