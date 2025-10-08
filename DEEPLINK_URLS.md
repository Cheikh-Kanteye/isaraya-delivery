# URLs de Deep Linking pour I-Saraya Delivery

## Configuration Backend - URLs de Redirection

Lorsque le backend traite un paiement ou toute autre action nécessitant un retour vers l'application mobile, utilisez ces URLs:

---

## 1. Retour de Paiement

### URL Custom Scheme (Recommandée)
```
isaraya://payment?ref={payment_reference}&status={payment_status}
```

### URL HTTPS (Alternative)
```
https://isaraya.com/payment?ref={payment_reference}&status={payment_status}
```

### Exemples:

#### Paiement Réussi
```
isaraya://payment?ref=PAY-2025-001&status=success
```

#### Paiement Échoué
```
isaraya://payment?ref=PAY-2025-001&status=failed
```

#### Paiement En Attente
```
isaraya://payment?ref=PAY-2025-001&status=pending
```

---

## 2. Configuration PayTech

Dans la configuration PayTech, définissez l'URL de succès et d'échec comme suit:

### URL de Succès
```
isaraya://payment?ref={{ref}}&status=success
```

### URL d'Échec
```
isaraya://payment?ref={{ref}}&status=failed
```

### URL de Notification (IPN - Instant Payment Notification)
```
https://2a5bddae59ef.ngrok-free.app/api/orders/payment/webhook
```

---

## 3. Exemple d'Implémentation Backend (Node.js/NestJS)

```typescript
// services/payment.service.ts

async initiatePayment(orderId: string, amount: number): Promise<PaymentResponse> {
  const paymentRef = `PAY-${Date.now()}`;

  const paytechConfig = {
    item_name: `Commande #${orderId}`,
    item_price: amount,
    currency: 'XOF',
    ref_command: paymentRef,
    command_name: `Order-${orderId}`,

    // URLs de redirection deep linking
    success_url: `isaraya://payment?ref=${paymentRef}&status=success`,
    cancel_url: `isaraya://payment?ref=${paymentRef}&status=cancelled`,

    // URL de notification serveur
    ipn_url: `${process.env.API_URL}/orders/payment/webhook`,
  };

  const response = await this.paytechClient.createPayment(paytechConfig);

  return {
    paymentUrl: response.redirect_url,
    paymentRef: paymentRef,
    token: response.token,
  };
}
```

---

## 4. Gestion dans l'Application Mobile

L'application détecte automatiquement ces URLs et:

1. Parse les paramètres `ref` et `status`
2. Redirige vers l'écran approprié
3. Affiche le statut du paiement
4. Met à jour la commande si nécessaire

### Code de Gestion (app/_layout.tsx)

```typescript
const handleDeepLink = (event: { url: string }) => {
  const { hostname, path, queryParams } = Linking.parse(event.url);

  if (hostname === 'payment' || path?.includes('payment')) {
    const ref = queryParams?.ref;      // ex: "PAY-2025-001"
    const status = queryParams?.status; // ex: "success"

    if (ref) {
      router.push({
        pathname: '/(client)/(tabs)',
        params: { paymentRef: ref, paymentStatus: status }
      });
    }
  }
};
```

---

## 5. Tests de Deep Linking

### Sur Émulateur/Simulateur

#### iOS (Terminal)
```bash
xcrun simctl openurl booted "isaraya://payment?ref=TEST-001&status=success"
```

#### Android (Terminal)
```bash
adb shell am start -W -a android.intent.action.VIEW -d "isaraya://payment?ref=TEST-001&status=success" com.isaraya.delivery
```

### Sur Appareil Réel

1. Envoyer l'URL par email/SMS
2. Cliquer sur le lien depuis l'appareil
3. L'application devrait s'ouvrir automatiquement

### Via Browser Web

Créer une page HTML simple:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Test Deep Link</title>
</head>
<body>
    <h1>Test I-Saraya Deep Links</h1>
    <a href="isaraya://payment?ref=TEST-001&status=success">
        Paiement Réussi
    </a>
    <br><br>
    <a href="isaraya://payment?ref=TEST-002&status=failed">
        Paiement Échoué
    </a>
</body>
</html>
```

---

## 6. Statuts de Paiement Supportés

| Statut | Description | Action dans l'App |
|--------|-------------|-------------------|
| `success` | Paiement réussi | Affiche confirmation + met à jour commande |
| `failed` | Paiement échoué | Affiche erreur + propose de réessayer |
| `pending` | Paiement en attente | Affiche statut en attente |
| `cancelled` | Paiement annulé par l'utilisateur | Retour à la commande |

---

## 7. Sécurité

⚠️ **Important**:

1. **Ne jamais faire confiance uniquement au deep link**: Le client peut manipuler l'URL
2. **Toujours vérifier côté serveur**: Utilisez l'IPN webhook pour confirmer le paiement
3. **Valider le `ref`**: Vérifiez que la référence existe dans votre base de données
4. **Logs**: Enregistrez tous les retours de paiement pour audit

### Flux de Validation Recommandé

```
1. Utilisateur effectue le paiement sur PayTech
2. PayTech envoie IPN à votre backend (webhook)
3. Backend valide et met à jour la commande
4. PayTech redirige l'utilisateur via deep link
5. App affiche le statut (déjà validé côté serveur)
```

---

## 8. Dépannage

### Le deep link ne fonctionne pas

1. Vérifier que le scheme est bien configuré dans `app.json`
2. Reconstruire l'application native (`npx expo prebuild`)
3. Sur Android, vérifier les intent filters
4. Sur iOS, vérifier les URL Types dans Xcode

### L'app ne s'ouvre pas depuis le navigateur

1. Android: Activer "Ouverture des liens d'application" dans les paramètres
2. iOS: Vérifier les "Universal Links" si utilisation de HTTPS
3. Tester d'abord avec le custom scheme `isaraya://`

### Les paramètres ne sont pas reçus

1. Encoder les valeurs avec `encodeURIComponent()` si elles contiennent des caractères spéciaux
2. Vérifier le parsing dans `app/_layout.tsx`
3. Ajouter des logs pour débugger

---

## 9. Documentation Additionnelle

- [Expo Linking Documentation](https://docs.expo.dev/guides/linking/)
- [React Navigation Deep Linking](https://reactnavigation.org/docs/deep-linking/)
- [Android App Links](https://developer.android.com/training/app-links)
- [iOS Universal Links](https://developer.apple.com/ios/universal-links/)
