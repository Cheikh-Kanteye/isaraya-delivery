# Configuration Firebase Cloud Messaging (FCM)

Ce document décrit comment configurer Firebase Cloud Messaging pour les notifications push dans l'application I-Saraya Delivery.

## Prérequis

1. Un compte Firebase
2. Les clés Firebase suivantes:
   - Firebase Server Key
   - Firebase Project ID
   - google-services.json (Android)
   - GoogleService-Info.plist (iOS)

## Installation des dépendances

Une fois les problèmes de dépendances résolus, installez les packages suivants:

```bash
npm install expo-notifications expo-device expo-constants --legacy-peer-deps
```

## Configuration Android

1. Téléchargez le fichier `google-services.json` depuis la console Firebase
2. Placez-le à la racine du projet
3. Ajoutez dans `app.json`:

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

## Configuration iOS

1. Téléchargez le fichier `GoogleService-Info.plist` depuis la console Firebase
2. Placez-le à la racine du projet
3. Ajoutez dans `app.json`:

```json
{
  "expo": {
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

## Configuration des variables d'environnement

Ajoutez dans votre fichier `.env`:

```
EXPO_PUBLIC_FIREBASE_SERVER_KEY=your_firebase_server_key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
```

## Utilisation dans le code

### 1. Initialiser le service de notifications

Dans `app/_layout.tsx` ou dans un contexte global:

```typescript
import { notificationService } from '@/services/notificationService';

useEffect(() => {
  notificationService.initialize({
    firebaseServerKey: process.env.EXPO_PUBLIC_FIREBASE_SERVER_KEY!,
    firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
  });
}, []);
```

### 2. Enregistrer l'appareil pour les notifications

```typescript
const token = await notificationService.registerForPushNotifications();
if (token) {
  await notificationService.sendTokenToServer(token, userId);
}
```

### 3. Gérer les notifications reçues

```typescript
notificationService.handleNotificationReceived(notification, (notif) => {
  console.log('Nouvelle notification:', notif);
  // Gérer la notification (afficher une alerte, mettre à jour l'UI, etc.)
});
```

## Backend - Envoi de notifications

Le backend doit envoyer les notifications aux livreurs dans les cas suivants:

1. **Nouvelle commande disponible**: Lorsqu'une nouvelle commande est créée et qu'elle est en attente d'attribution
2. **Commande acceptée**: Lorsqu'un client accepte une commande
3. **Commande annulée**: Lorsqu'une commande est annulée
4. **Messages**: Lorsqu'un client envoie un message

### Exemple d'endpoint backend pour l'envoi de notifications

```typescript
POST /notifications/send
{
  "userId": "livreur-id",
  "title": "Nouvelle commande disponible",
  "body": "Une nouvelle commande est disponible dans votre zone",
  "data": {
    "type": "NEW_ORDER",
    "orderId": "order-123",
    "screen": "orders"
  }
}
```

## Structure des notifications

### Notification de nouvelle commande

```json
{
  "title": "Nouvelle commande disponible",
  "body": "Une nouvelle commande à [adresse] attend d'être récupérée",
  "data": {
    "type": "NEW_ORDER",
    "orderId": "order-id",
    "pickupAddress": "address",
    "estimatedEarnings": "5000"
  }
}
```

### Notification de changement de statut

```json
{
  "title": "Mise à jour de commande",
  "body": "La commande #123 a été mise à jour",
  "data": {
    "type": "ORDER_STATUS_UPDATE",
    "orderId": "order-id",
    "newStatus": "IN_PROGRESS"
  }
}
```

## Tests

Pour tester les notifications push:

1. Utilisez l'outil de test de Firebase Console
2. Ou utilisez un outil comme Postman pour envoyer des requêtes à votre backend
3. Assurez-vous que l'appareil/émulateur est enregistré et a un token FCM valide

## Dépannage

### Les notifications ne s'affichent pas

1. Vérifiez que le token FCM est bien enregistré
2. Vérifiez les permissions de notification sur l'appareil
3. Consultez les logs Firebase pour voir si les messages sont bien envoyés
4. Sur Android, assurez-vous que les services Google Play sont installés

### Token invalide

1. Supprimez le token stocké localement
2. Redémarrez l'application pour obtenir un nouveau token
3. Assurez-vous que le token est envoyé au backend

## Liens utiles

- [Documentation Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Documentation Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Guide de configuration FCM avec Expo](https://docs.expo.dev/push-notifications/fcm-credentials/)
