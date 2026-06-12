# Déploiement Vercel (100% gratuit, 0 carte)

Le backend Socket.io tourne en tant que **Serverless Function** sur Vercel (support WebSocket activé).

## 1. Config Vercel (déjà fait)

Le repo est prêt :
- `api/socket.js` → fonction Socket.io
- `vercel.json` → build + configuration fonction
- `client/` → frontend React

## 2. Variables d'environnement

Dans les **Settings** du projet Vercel → **Environment Variables** :

| Variable | Valeur |
|----------|--------|
| `VITE_SOCKET_PATH` | `/api/socket` |

⚠️ **Ne pas** mettre `VITE_SERVER_URL` (elle doit être vide pour que le client se connecte au même domaine).

## 3. Root Directory

Dans **Project Settings → General** :
- **Root Directory** → laisse **vide** (racine du repo)
- **Build & Development Settings** → laisser les valeurs du `vercel.json`

## 4. Redéployer

Va dans **Deployments** → clique sur **"Redeploy"** du dernier déploiement.

## 5. Tester

1. Ouvre `https://discutons.vercel.app` dans 2 onglets
2. Entre le même nom de salon (`#test`)
3. Envoie un message → il doit apparaître chez l'autre

---

**Important** : Vercel Serverless peut avoir plusieurs instances. Parfois les utilisateurs atterrissent sur des instances différentes et ne se voient pas. Si ça arrive, un simple rechargement des deux pages les synchronise (elles tombent sur la même instance).
