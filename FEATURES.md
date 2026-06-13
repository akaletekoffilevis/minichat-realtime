# Mini Chat → Discord-like

Plan d'évolution du projet vers un clone de Discord.

---

## Priorité 1 — Base (indispensable)

### Base de données
- [ ] Ajouter SQLite (ou PostgreSQL pour HF Space)
- [ ] Tables : `users`, `servers`, `channels`, `messages`, `dm_channels`, `dm_messages`
- [ ] ORM : Prisma ou Drizzle

### Comptes utilisateurs
- [ ] Inscription (email + mot de passe + pseudo)
- [ ] Connexion (JWT token)
- [ ] Page profil (avatar, pseudo, statut)
- [ ] Déconnexion

### Serveurs & salons persistants
- [ ] Créer un serveur (nom, icône, catégories)
- [ ] Créer des salons (textuels) dans un serveur
- [ ] Rejoindre un serveur (via invitation / liste publique)
- [ ] Naviguer entre serveurs et salons (sidebar)
- [ ] Tous les salons et messages sont stockés en BDD

### Historique illimité
- [ ] Charger les N derniers messages au join
- [ ] Bouton "charger plus anciens" (pagination)

---

## Priorité 2 — Communication

### Messages privés (DM)
- [ ] Ouvrir un DM avec un autre utilisateur
- [ ] Liste des DMs récents
- [ ] Salon DM persistant

### Édition / suppression
- [ ] Modifier un message (bouton éditer, mise à jour en temps réel)
- [ ] Supprimer un message (soft delete)
- [ ] Horodatage "modifié"

### Réactions
- [ ] Cliquer sur un emoji pour réagir à un message
- [ ] Liste des réactions (compteur + qui a réagi)
- [ ] Ajouter / retirer sa réaction en cliquant

### Reply / Thread
- [ ] Répondre à un message (citation + mention)
- [ ] Fil de discussion (thread) lié à un message

---

## Priorité 3 — Audio / Vidéo

### Appel vocal
- [ ] Salon vocal (rejoindre / quitter)
- [ ] WebRTC : audio peer-to-peer
- [ ] Indicateur "en vocal" dans la sidebar

### Appel vidéo
- [ ] WebRTC : caméra
- [ ] Grille des participants (1-9)
- [ ] Mute / sourdine / caméra off

### Partage d'écran
- [ ] Capturer un écran ou une fenêtre
- [ ] Diffuser via WebRTC (track vidéo)

### Serveur TURN
- [ ] Déployer coturn ou utiliser un service TURN public (pour NAT traversal)

---

## Priorité 4 — Social

### Statut / présence
- [ ] En ligne, occupé, absent, invisible
- [ ] Affiché à côté du pseudo
- [ ] Détecter inactivité

### Rôles & permissions
- [ ] Owner, admin, modérateur, membre
- [ ] Permissions : écrire, lire, gérer les messages, inviter, bannir
- [ ] Interface de gestion des rôles

### Invitations / liens
- [ ] Générer un lien d'invitation (avec code unique)
- [ ] Rejoindre un serveur via le lien
- [ ] Expiration / nombre d'utilisations max

### Notifications
- [ ] Son à la réception d'un message
- [ ] Notification navigateur (Notification API)
- [ ] Badge de messages non lus
- [ ] Mention @utilisateur (surbrillance + notification)

---

## Priorité 5 — Fichiers

### Upload permanent
- [ ] Upload d'images, vidéos, fichiers audio, documents
- [ ] Stockage : dossier `uploads/` sur le serveur ou S3
- [ ] Limite : adapter par type de fichier
- [ ] Affichage : prévisualisation image/vidéo, icône pour les autres

### Lecteur intégré
- [ ] Audio : lecteur avec waveform / controls
- [ ] Vidéo : lecteur inline
- [ ] Images : lightbox (clic pour agrandir)

---

## Stack

### Backend (existants → à modifier)
| Technologie | Usage |
|---|---|
| Node.js + Express | Serveur HTTP |
| Socket.io | Realtime (messages, notifications, WebRTC signaling) |
| SQLite / PostgreSQL | Base de données |
| Prisma / Drizzle | ORM |
| JWT | Authentification |
| WebRTC via Socket.io | Signaling pour appels |
| Multer / Busboy | Upload fichiers |
| bcrypt | Hash mots de passe |

### Frontend (existant → à étendre)
| Technologie | Usage |
|---|---|
| React + Vite | Interface |
| Socket.io-client | Realtime |
| React Router | Navigation (pages login, serveur, DM) |
| Zustand / Context | State management global |
| Tailwind CSS | Style (ou CSS modules) |

---

## Architecture HF Space

```
┌──────────────────────┐
│   HF Space Docker    │
│                      │
│  ┌────────────────┐  │
│  │   Express API    │  │
│  │   + Socket.io   │  │
│  └───────┬────────┘  │
│          │            │
│  ┌───────▼────────┐  │
│  │  SQLite / BDD   │  │
│  │ (fichier .db)   │  │
│  └────────────────┘  │
│          │            │
│  ┌───────▼────────┐  │
│  │  uploads/       │  │
│  │ (fichiers)      │  │
│  └────────────────┘  │
└──────────────────────┘

Frontend (Vercel) → API + WS → HF Space
```

⚠️ **Limitation HF Space** : Le stockage est volatil. Si le Space redémarre, SQLite et les fichiers uploadés sont perdus. Pour de la persistance réelle, il faudrait passer sur un VPS (Hetzner €3/mois) ou utiliser un service externe (Supabase pour la BDD, Cloudinary pour les fichiers).

---

## Priorité 6 — Recherche & Contenu

### Recherche de messages
- [ ] Barre de recherche full-text (par mot-clé, utilisateur, salon)
- [ ] Résultats filtrés par salon / serveur

### Messages épinglés
- [ ] Épingler un message (pin)
- [ ] Liste des pins du salon
- [ ] Salon "règles" / infos épinglées par défaut

### Markdown & formatting
- [ ] Gras, italique, barré
- [ ] Blocs de code inline et multilignes
- [ ] Listes à puces / numérotées
- [ ] Spoiler tags (texte caché, révélé au clic)

### Embed links
- [ ] Prévisualisation des liens (YouTube, Twitter/X, GitHub, images)
- [ ] Affichage titre, description, image du lien (OG metadata)

### Mentions
- [ ] Mention @utilisateur (notification + surbrillance)
- [ ] @here (tous les en ligne) et @everyone

---

## Priorité 7 — Social & Modération

### Friends
- [ ] Ajouter un ami par pseudo
- [ ] Accepter / refuser une demande
- [ ] Liste d'amis avec statut en ligne
- [ ] DM rapide depuis la liste d'amis

### Block / signaler
- [ ] Bloquer un utilisateur (messages cachés)
- [ ] Signaler un message (pour modération)

### Catégories de salons
- [ ] Créer des catégories dans un serveur
- [ ] Glisser / déposer les salons dans les catégories
- [ ] Réduire / dérouler une catégorie

### Slow mode
- [ ] Cooldown configurable entre chaque message (5s, 10s, 30s, 1min…)
- [ ] Compteur "réessayer dans X secondes"

### Salon vocal avancé
- [ ] Détection d'activité vocale (VAD)
- [ ] Push-to-talk (touche à maintenir pour parler)

---

## Priorité 8 — Extensibilité

### Bot API / Webhooks
- [ ] Endpoint HTTP pour envoyer des messages dans un salon (webhook)
- [ ] Token d'authentification par webhook
- [ ] Intégration GitHub, GitLab, etc. (notification de push / PR)

### Emojis & stickers personnalisés
- [ ] Upload d'emojis personnalisés (par serveur)
- [ ] Stickers animés ou statiques uploadés

### Serveur public / Discovery
- [ ] Liste des serveurs publics
- [ ] Système de tags / catégories (gaming, dev, musique…)
- [ ] Rejoindre depuis la découverte

---

## Ordre recommandé

1. **BDD + ORM** (Prisma + SQLite)
2. **Comptes utilisateurs** (JWT, login, register)
3. **Serveurs & salons** (CRUD, sidebar)
4. **Persistance des messages** (stocker + charger historique)
5. **DMs**
6. **Édition / suppression / réactions**
7. **Upload fichiers**
8. **Mentions & Markdown**
9. **Messages épinglés**
10. **Catégories de salons**
11. **Slow mode**
12. **Appels vocaux** (WebRTC)
13. **Appels vidéo + screen share**
14. **Rôles & permissions**
15. **Notifications**
16. **Recherche messages**
17. **Embed links**
18. **Friends**
19. **Block / signaler**
20. **Bot API / Webhooks**
21. **Emojis personnalisés**
22. **Serveur public / Discovery**
23. **Threads**
24. **Statut personnalisé** (libre : "En réunion", "AFK", "Joue à…")
25. **Surnoms par serveur** (pseudo différent par serveur)
26. **Dossiers de serveurs** (ranger les serveurs en dossiers dans la sidebar)
27. **Sondages** (créer un sondage, voter, résultats en temps réel)
28. **Accents & thèmes** (couleur d'accent, dark/light mode, thèmes customs)
29. **Raccourcis clavier** (Ctrl+K recherche, Ctrl+E éditer, flèches navigation)
30. **Salon "AFK"** (déplacer automatiquement les utilisateurs inactifs en vocal)
