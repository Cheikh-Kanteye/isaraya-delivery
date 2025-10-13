# Configuration de l'application I-Saraya Delivery

## Variables d'environnement requises

Pour que l'application fonctionne correctement, vous devez configurer les variables d'environnement suivantes :

### 1. Créer un fichier `.env` à la racine du projet

```bash
# Configuration de l'API
EXPO_PUBLIC_API_URL=http://localhost:3000

# Clé API Google Places (optionnel)
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
```

### 2. Configuration de l'API

- **EXPO_PUBLIC_API_URL** : URL de votre API backend
  - Développement : `http://localhost:3000`
  - Production : `https://votre-api.com`

### 3. Configuration Google Places (optionnel)

- **EXPO_PUBLIC_GOOGLE_PLACES_API_KEY** : Clé API Google Places pour l'autocomplétion des adresses

## Problèmes courants

### L'application reste bloquée sur l'onboarding

Si l'application reste bloquée sur l'écran d'onboarding, vérifiez :

1. **API_URL configuré** : Assurez-vous que `EXPO_PUBLIC_API_URL` est défini dans votre fichier `.env`
2. **API accessible** : Vérifiez que votre API backend est en cours d'exécution
3. **Connexion réseau** : Vérifiez votre connexion internet

### Messages d'erreur dans la console

- `Configuration API manquante` : L'URL de l'API n'est pas configurée
- `Token expiré` : La session utilisateur a expiré
- `Session expirée` : L'utilisateur doit se reconnecter

## Démarrage rapide

1. Copiez le fichier `.env.example` vers `.env`
2. Modifiez les valeurs selon votre configuration
3. Redémarrez l'application Expo

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Modifier les valeurs dans .env
# Puis redémarrer
npx expo start --clear
```

## Support

Si vous rencontrez des problèmes, vérifiez les logs dans la console de développement pour plus d'informations.
