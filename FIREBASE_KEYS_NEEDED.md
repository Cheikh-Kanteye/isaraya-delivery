# Clés Firebase Nécessaires pour I-Saraya Delivery

## Informations Requises

Pour activer les notifications push Firebase Cloud Messaging (FCM) dans l'application, vous devez fournir les éléments suivants:

---

## 1. Variables d'Environnement

Ajoutez ces variables dans votre fichier `.env`:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_SERVER_KEY=AAAA...votre_server_key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=votre-project-id
```

### Où trouver ces valeurs:

#### Firebase Server Key (Cloud Messaging Server Key)
1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet
3. Cliquez sur l'icône ⚙️ (Paramètres) → **Paramètres du projet**
4. Onglet **Cloud Messaging**
5. Copiez la **Clé du serveur** (Server key)

#### Firebase Project ID
1. Même écran que ci-dessus
2. Onglet **Général**
3. Le **Project ID** est affiché en haut
4. Format: `nom-projet-12345`

---

## 2. Fichiers de Configuration

### Pour Android: `google-services.json`

1. Dans Firebase Console → Paramètres du projet
2. Section **Vos applications** → Cliquez sur l'icône Android
3. Téléchargez le fichier `google-services.json`
4. **Placement**: Racine du projet `/google-services.json`

**Exemple de structure**:
```json
{
  "project_info": {
    "project_number": "123456789",
    "project_id": "isaraya-delivery",
    "storage_bucket": "isaraya-delivery.appspot.com"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:123456789:android:abcdef",
        "android_client_info": {
          "package_name": "com.isaraya.delivery"
        }
      },
      "api_key": [
        {
          "current_key": "AIza..."
        }
      ]
    }
  ]
}
```

### Pour iOS: `GoogleService-Info.plist`

1. Dans Firebase Console → Paramètres du projet
2. Section **Vos applications** → Cliquez sur l'icône iOS
3. Téléchargez le fichier `GoogleService-Info.plist`
4. **Placement**: Racine du projet `/GoogleService-Info.plist`

**Exemple de structure**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CLIENT_ID</key>
    <string>123456789-abc.apps.googleusercontent.com</string>
    <key>REVERSED_CLIENT_ID</key>
    <string>com.googleusercontent.apps.123456789-abc</string>
    <key>API_KEY</key>
    <string>AIza...</string>
    <key>GCM_SENDER_ID</key>
    <string>123456789</string>
    <key>PLIST_VERSION</key>
    <string>1</string>
    <key>BUNDLE_ID</key>
    <string>com.isaraya.delivery</string>
    <key>PROJECT_ID</key>
    <string>isaraya-delivery</string>
</dict>
</plist>
```

---

## 3. Configuration dans Firebase Console

### Étape 1: Créer/Accéder au Projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur **Ajouter un projet** ou sélectionnez un projet existant
3. Suivez les étapes de création si nouveau projet

### Étape 2: Activer Cloud Messaging

1. Dans votre projet Firebase
2. Menu latéral → **Engagement** → **Cloud Messaging**
3. Activez l'API Cloud Messaging si ce n'est pas déjà fait

### Étape 3: Ajouter les Applications

#### Pour Android:
1. Cliquez sur **Ajouter une application** → Android
2. **Nom du package Android**: `com.isaraya.delivery`
3. **Surnom de l'application**: I-Saraya Delivery Android
4. Téléchargez `google-services.json`

#### Pour iOS:
1. Cliquez sur **Ajouter une application** → iOS
2. **Bundle ID iOS**: `com.isaraya.delivery`
3. **Surnom de l'application**: I-Saraya Delivery iOS
4. Téléchargez `GoogleService-Info.plist`

---

## 4. Checklist de Configuration

Cochez les éléments une fois fournis/configurés:

- [ ] Firebase Server Key ajouté dans `.env`
- [ ] Firebase Project ID ajouté dans `.env`
- [ ] Fichier `google-services.json` téléchargé et placé à la racine
- [ ] Fichier `GoogleService-Info.plist` téléchargé et placé à la racine
- [ ] Cloud Messaging activé dans Firebase Console
- [ ] Application Android enregistrée dans Firebase
- [ ] Application iOS enregistrée dans Firebase
- [ ] Permissions de notification configurées (se fera automatiquement au runtime)

---

## 5. Structure Finale du Projet

```
project/
├── .env                        [Variables Firebase ajoutées]
├── google-services.json        [À FOURNIR - Android]
├── GoogleService-Info.plist    [À FOURNIR - iOS]
├── FIREBASE_KEYS_NEEDED.md    [Ce fichier]
└── FIREBASE_SETUP.md          [Documentation technique]
```

---

## 6. Sécurité et Bonnes Pratiques

### ⚠️ Important:

1. **Ne jamais committer les fichiers de configuration Firebase** dans Git
2. Ajouter dans `.gitignore`:
   ```
   google-services.json
   GoogleService-Info.plist
   .env
   ```

3. **Variables d'environnement sensibles**:
   - Ne jamais exposer la Server Key publiquement
   - Utiliser des secrets GitHub/GitLab pour CI/CD
   - Renouveler les clés régulièrement

4. **Permissions minimales**:
   - Accorder uniquement les permissions nécessaires
   - Restreindre l'accès aux clés API par IP si possible

---

## 7. Test de Configuration

Une fois toutes les clés fournies et configurées, testez:

### Test Backend:
```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "DEVICE_TOKEN",
    "notification": {
      "title": "Test",
      "body": "Test notification"
    }
  }'
```

### Test Application:
1. Lancez l'application
2. Vérifiez que le token FCM est généré
3. Envoyez une notification de test depuis Firebase Console
4. Vérifiez la réception

---

## 8. Ressources Utiles

- [Firebase Console](https://console.firebase.google.com/)
- [Documentation FCM](https://firebase.google.com/docs/cloud-messaging)
- [Guide Expo + Firebase](https://docs.expo.dev/push-notifications/fcm-credentials/)
- [Tutoriel Configuration FCM](https://firebase.google.com/docs/cloud-messaging/android/client)

---

## 9. Support

En cas de problème:

1. Vérifiez que tous les fichiers sont au bon emplacement
2. Consultez les logs Firebase Console
3. Vérifiez les permissions de notification sur l'appareil
4. Testez d'abord avec l'outil de notification Firebase Console
5. Consultez le fichier `FIREBASE_SETUP.md` pour la documentation technique complète

---

## 10. Contact

Pour obtenir de l'aide sur la configuration:
- Consultez la documentation dans `FIREBASE_SETUP.md`
- Vérifiez les exemples de code dans `services/notificationService.ts`
- Référez-vous aux logs de l'application pour le débogage
