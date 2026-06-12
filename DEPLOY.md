# Déploiement

## Backend → Hugging Face Spaces (gratuit, toujours allumé)

1. Va sur https://huggingface.co → Crée un compte
2. Clique sur ton avatar → **New Space**
3. Configure :
   - **Space Name** : `minichat-server`
   - **License** : `MIT`
   - **Space SDK** : **Docker**
   - **Docker Template** : **Blank**
4. Clique **Create Space**
5. Dans l'onglet **Settings** → **Repository** → connecte GitHub
   - Ou upload les fichiers manuellement :
     - `Dockerfile` (à la racine)
     - `server/` (dossier complet)
6. Le build démarre automatiquement
7. Tu obtiens : `https://tonpseudo-minichat-server.hf.space`

## Frontend → Vercel

Va sur https://vercel.com → **Add New → Project** :

- Repo : `akaletekoffilevis/minichat-realtime`
- **Root Directory** : `client`
- **Build Command** : `npm run build`
- **Output Directory** : `dist`

Ajoute dans **Environment Variables** :

| Variable | Valeur |
|----------|--------|
| `VITE_SERVER_URL` | `https://tonpseudo-minichat-server.hf.space` |

## Test

1. Ouvre `https://discutons.vercel.app`
2. Tape un pseudo + `#salon`
3. Partage le lien à un ami
4. Vous discutez en temps réel (texte, audio, stickers, fichiers)
