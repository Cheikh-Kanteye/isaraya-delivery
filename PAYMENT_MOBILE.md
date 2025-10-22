# Système de Paiement Mobile - Isaraya Delivery App

## ⚠️ IMPORTANT

**Le système d'écoute des deep links Expo dans `app/_layout.tsx` fonctionne correctement et NE DOIT PAS être modifié ou supprimé.**

Le backend gère également la redirection via les URLs de webhook :
- Success: `https://isaraya.sarayatechsenegal.com/api/orders/payment/webhook?redirect_to=isaraya://payment?status=success`
- Cancel: `https://isaraya.sarayatechsenegal.com/api/orders/payment/webhook?redirect_to=isaraya://payment?status=cancelled`

## Vue d'ensemble

L'application mobile Isaraya Delivery utilise un système de paiement avec redirection via deep linking pour gérer les paiements mobiles (Orange Money, Wave, Free Money).

## Architecture du flux de paiement

```
1. Client initie un paiement depuis l'app
   ↓
2. App envoie une requête au backend avec origin: "MOBILE_APP"
   ↓
3. Backend configure les URLs de redirection vers le webhook + deep link
   ↓
4. App ouvre l'URL PayTech dans le navigateur externe
   ↓
5. Client complète le paiement sur PayTech
   ↓
6. PayTech redirige vers le webhook backend
   ↓
7. Webhook traite l'IPN et redirige vers l'app via deep link
   ↓
8. App s'ouvre sur l'écran payment.tsx avec les résultats
```

## Configuration

### 1. Deep Linking (app.json)

Le scheme `isaraya://` est configuré pour permettre les redirections vers l'app :

```json
{
  "expo": {
    "scheme": "isaraya",
    "ios": {
      "bundleIdentifier": "com.isaraya.delivery"
    },
    "android": {
      "package": "com.isaraya.delivery"
    }
  }
}
```

**⚠️ Important :** En développement avec Expo Go, utilisez :
- Format : `exp://IP:PORT/--/payment`
- Exemple : `exp://192.168.1.6:8081/--/payment`

En production (standalone app), utilisez :
- Format : `isaraya://payment`

### 2. Variables d'environnement

#### Frontend (.env)
```env
EXPO_PUBLIC_API_URL=https://your-api-url.com
```

#### Backend - Développement avec Expo Go (.env)
```env
# Remplacez 192.168.1.6:8081 par votre IP locale et port Expo
PAYTECH_MOBILE_SUCCESS_URL=https://your-api.com/api/orders/payment/webhook?redirect_to=exp://192.168.1.6:8081/--/payment
PAYTECH_MOBILE_CANCEL_URL=https://your-api.com/api/orders/payment/webhook?redirect_to=exp://192.168.1.6:8081/--/payment
```

#### Backend - Production (.env)
```env
PAYTECH_MOBILE_SUCCESS_URL=https://isaraya.sarayatechsenegal.com/api/orders/payment/webhook?redirect_to=isaraya://payment?status=success
PAYTECH_MOBILE_CANCEL_URL=https://isaraya.sarayatechsenegal.com/api/orders/payment/webhook?redirect_to=isaraya://payment?status=cancelled
```

## Implémentation Frontend

### 1. Hook de paiement (hooks/useDeliveryOrder.ts)

Le hook `useDeliveryOrder` gère l'initiation du paiement :

```typescript
const processPayment = async (onSuccess: () => void) => {
  const paymentData = {
    orderId: deliveryRequest.id,
    item_price: deliveryRequest.deliveryFee,
    command_name: 'Commande Isaraya',
    currency: 'XOF',
    target_payment: 'Orange Money',
    origin: 'MOBILE_APP', // ← Important pour les redirections mobiles
    user: {
      phone_number: client.phoneNumber,
      first_name: client.firstName,
      last_name: client.lastName,
    }
  };
  
  const result = await paymentService.initiatePayment(paymentData);
  await Linking.openURL(result.redirectUrl); // Ouvre dans le navigateur
};
```

**Points clés :**
- `origin: "MOBILE_APP"` indique au backend d'utiliser les URLs de redirection mobile
- Utilise `Linking.openURL()` au lieu de `WebBrowser` pour permettre le retour vers l'app

### 2. Service de paiement (services/paiementService.ts)

```typescript
async initiatePayment(paymentData: InitiatePaymentDto) {
  const response = await fetch(`${API_URL}/orders/initiate-payment`, {
    method: 'POST',
    headers: await this.getHeaders(),
    body: JSON.stringify(paymentData),
  });
  
  const result = await response.json();
  return result.payload || result; // { redirectUrl: string }
}
```

### 3. Écran de résultat (app/payment.tsx)

L'écran `payment.tsx` gère l'affichage des résultats après redirection :

**Paramètres reçus via deep link :**
- `status` : `success` | `cancelled` | `refunded` | `error`
- `ref` : Référence de la commande
- `amount` : Montant du paiement
- `message` : Message descriptif

**Exemple d'URLs générées par le backend :**

**Développement (Expo Go) :**
```
Succès :
exp://192.168.1.6:8081/--/payment?status=success&ref=order-123&amount=15000&message=Paiement%20réussi

Annulation :
exp://192.168.1.6:8081/--/payment?status=cancelled&ref=order-123&amount=15000&message=Paiement%20annulé

Erreur :
exp://192.168.1.6:8081/--/payment?status=error&ref=order-123&message=Erreur%20webhook
```

**Production (Standalone) :**
```
Succès :
isaraya://payment?status=success&ref=order-123&amount=15000&message=Paiement%20réussi

Annulation :
isaraya://payment?status=cancelled&ref=order-123&amount=15000&message=Paiement%20annulé

Erreur :
isaraya://payment?status=error&ref=order-123&message=Erreur%20webhook
```

### 4. Configuration du deep linking (app/_layout.tsx)

Le layout principal écoute les deep links :

```typescript
useEffect(() => {
  // Écouter les deep links quand l'app est ouverte
  const subscription = Linking.addEventListener('url', (event) => {
    console.log('Deep link received:', event.url);
  });

  // Vérifier si l'app a été ouverte via un deep link
  Linking.getInitialURL().then((url) => {
    if (url) {
      console.log('App opened with deep link:', url);
    }
  });

  return () => subscription?.remove();
}, []);
```

Le routing Expo automatique navigue vers `/payment` avec les query params.

## Backend - Configuration requise

### Variables d'environnement backend (.env)

**Développement avec Expo Go :**
```env
# ⚠️ Utilisez votre IP locale visible dans le terminal Expo
# Format : exp://IP:PORT/--/payment
PAYTECH_MOBILE_SUCCESS_URL=https://your-ngrok-url.ngrok-free.app/api/orders/payment/webhook?redirect_to=exp://192.168.1.6:8081/--/payment
PAYTECH_MOBILE_CANCEL_URL=https://your-ngrok-url.ngrok-free.app/api/orders/payment/webhook?redirect_to=exp://192.168.1.6:8081/--/payment

# URLs de redirection web (pour référence)
PAYTECH_SUCCESS_URL=https://your-web-app.com/payment/status/success
PAYTECH_CANCEL_URL=https://your-web-app.com/payment/status/cancel
```

**Production (standalone app) :**
```env
# URLs de redirection mobiles
PAYTECH_MOBILE_SUCCESS_URL=https://isaraya.sarayatechsenegal.com/api/orders/payment/webhook?redirect_to=isaraya://payment?status=success
PAYTECH_MOBILE_CANCEL_URL=https://isaraya.sarayatechsenegal.com/api/orders/payment/webhook?redirect_to=isaraya://payment?status=cancelled

# URLs de redirection web
PAYTECH_SUCCESS_URL=https://your-web-app.com/payment/status/success
PAYTECH_CANCEL_URL=https://your-web-app.com/payment/status/cancel
```

### 📱 Comment obtenir votre IP et port Expo

1. Démarrez Expo : `npx expo start`
2. Dans le terminal, vous verrez quelque chose comme :
   ```
   Metro waiting on exp://192.168.1.6:8081
   ```
3. Utilisez cette URL dans vos variables d'environnement backend

### Webhook Backend (order.controller.ts)

Le webhook doit :
1. Traiter la notification IPN de PayTech
2. Construire l'URL de redirection avec les paramètres
3. Rediriger vers l'app mobile

```typescript
@Post("payment/webhook")
async handlePaytechWebhook(
  @Body() ipnData: any,
  @Query("redirect_to") redirectTo: string,
  @Res() res: any
) {
  // Traiter l'IPN
  await this.paymentService.handleIpnWebhook(ipnData);
  
  if (redirectTo) {
    let status = "pending";
    let message = "";
    
    switch (ipnData.type_event) {
      case "sale_complete":
        status = "success";
        message = "Paiement réussi";
        break;
      case "sale_canceled":
        status = "cancelled";
        message = "Paiement annulé";
        break;
      case "refund_complete":
        status = "refunded";
        message = "Paiement remboursé";
        break;
      default:
        status = "error";
        message = "Erreur de traitement";
    }
    
    const separator = redirectTo.includes("?") ? "&" : "?";
    const redirectUrl = `${redirectTo}${separator}status=${status}&ref=${ipnData.ref_command}&amount=${ipnData.item_price}&message=${encodeURIComponent(message)}`;
    
    return res.redirect(redirectUrl);
  }
  
  return res.status(200).send("OK");
}
```

## Utilisation dans l'application

### Écran de création de commande (app/(client)/(tabs)/search.tsx)

```typescript
const { processPayment } = useDeliveryOrder(client);

<TouchableOpacity
  onPress={() => processPayment(() => router.push('/(client)/(tabs)/orders'))}
>
  <Text>Payer maintenant</Text>
</TouchableOpacity>
```

## Gestion des statuts de paiement

| Status | Icône | Couleur | Action principale |
|--------|-------|---------|-------------------|
| `success` | ✓ CheckCircle | Vert | Voir ma commande |
| `cancelled` | ✗ XCircle | Rouge | Réessayer |
| `refunded` | ↻ RefreshCw | Orange | Voir ma commande |
| `error` | ! AlertCircle | Rouge | Réessayer |
| `pending` | ! AlertCircle | Gris | Voir mes commandes |

## Tests en développement

### 1. Test avec Expo Go

```bash
# Démarrer l'app
npx expo start

# Tester un deep link manuellement
npx uri-scheme open "isaraya://payment?status=success&ref=test-123&amount=5000&message=Test" --ios
npx uri-scheme open "isaraya://payment?status=success&ref=test-123&amount=5000&message=Test" --android
```

### 2. Simuler un retour de paiement

Utilisez cette URL pour tester l'écran de paiement :

```
isaraya://payment?status=success&ref=abc123&amount=15000&message=Paiement%20r%C3%A9ussi
```

## URLs de test complètes

```bash
# Succès
isaraya://payment?status=success&ref=order-123&amount=15000&message=Paiement%20réussi

# Annulation
isaraya://payment?status=cancelled&ref=order-123&amount=15000&message=Paiement%20annulé

# Remboursement
isaraya://payment?status=refunded&ref=order-123&amount=15000&message=Paiement%20remboursé

# Erreur
isaraya://payment?status=error&ref=order-123&message=Erreur%20de%20traitement
```

## Différences Développement vs Production

| Environnement | Deep Link Format | Exemple |
|---------------|------------------|----------|
| **Développement (Expo Go)** | `exp://IP:PORT/--/route` | `exp://192.168.1.6:8081/--/payment` |
| **Production (Standalone)** | `scheme://route` | `isaraya://payment` |

### ⚠️ Important
- En développement, l'IP et le port peuvent changer
- Mettez à jour les variables d'environnement backend si nécessaire
- En production, utilisez toujours le scheme personnalisé

## Production

### Configuration pour la production

1. **Mettre à jour les URLs backend** :
   ```env
   PAYTECH_MOBILE_SUCCESS_URL=https://isaraya.sarayatechsenegal.com/api/orders/payment/webhook?redirect_to=isaraya://payment?status=success
   PAYTECH_MOBILE_CANCEL_URL=https://isaraya.sarayatechsenegal.com/api/orders/payment/webhook?redirect_to=isaraya://payment?status=cancelled
   ```

2. **Build l'application** :
   ```bash
   # iOS
   eas build --platform ios
   
   # Android
   eas build --platform android
   ```

3. **Vérifier les bundle identifiers** dans `app.json` :
   - iOS: `com.isaraya.delivery`
   - Android: `com.isaraya.delivery`

## Dépannage

### Le deep link ne fonctionne pas

1. Vérifier que le scheme est bien configuré dans `app.json`
2. Relancer l'app après modification de `app.json`
3. Sur Android, vérifier les permissions dans AndroidManifest.xml
4. Utiliser `adb logcat` (Android) ou Console.app (iOS) pour voir les logs

### L'app ne se rouvre pas après paiement

1. Vérifier que le backend utilise bien `origin: "MOBILE_APP"`
2. S'assurer que les URLs de webhook incluent le paramètre `redirect_to`
3. Vérifier les logs du webhook backend
4. Tester manuellement avec `npx uri-scheme open`

### Les paramètres ne sont pas reçus

1. Vérifier l'encodage des paramètres URL (utiliser `encodeURIComponent()`)
2. Consulter les logs dans `app/_layout.tsx`
3. Utiliser `useLocalSearchParams()` dans `payment.tsx` pour débugger

## Sécurité

- ✅ Les paiements sont traités via PayTech (PCI-DSS compliant)
- ✅ Le webhook valide l'authenticité des notifications (HMAC)
- ✅ Les URLs sont en HTTPS
- ✅ Les tokens ne sont jamais exposés dans les deep links
- ✅ Les redirections sont contrôlées par le backend

## Support

Pour toute question ou problème :
- Consulter la documentation PayTech
- Vérifier les logs du backend
- Tester avec les URLs de simulation ci-dessus
