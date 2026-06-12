# Déploiement Koyeb

## 1. Compte Koyeb

1. Va sur https://app.koyeb.com
2. Inscris-toi avec ton compte **GitHub** (un clic, pas de carte)
3. Confirme ton email

## 2. Déployer le serveur

1. Clique **"Create App"**
2. **GitHub** → connecte ton compte → sélectionne `akaletekoffilevis/minichat-realtime`
3. **Builder** : sélectionne **"Dockerfile"**
4. **Dockerfile path** : `server/Dockerfile`
5. **Port** : `8080`
6. **App name** : `minichat` (ou autre)
7. Clique **"Deploy"**

⏳ Attends 2 minutes → tu obtiens `https://minichat.koyeb.app`

## 3. Déployer le frontend (Vercel)

1. Va sur https://vercel.com
2. **Add New → Project**
3. Importe `akaletekoffilevis/minichat-realtime`
4. **Root Directory** : `client`
5. **Framework Preset** : `Vite`
6. **Build Command** : `npm run build`
7. **Output Directory** : `dist`

Ajoute cette variable d'environnement :

| Variable | Valeur |
|----------|--------|
| `VITE_SERVER_URL` | `https://minichat.koyeb.app` |

→ **Deploy**

## 4. C'est prêt !

- **Chat** : `https://minichat.vercel.app`
- **Serveur** : `https://minichat.koyeb.app` (toujours allumé)
- **Coût** : **0€**, sans carte bancaire
