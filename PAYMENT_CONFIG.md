# Configuration Actuelle du Système de Paiement Mobile

## ✅ Configuration en Production

### Backend (Variables d'environnement)

```env
PAYTECH_MOBILE_SUCCESS_URL=https://isaraya.sarayatechsenegal.com/api/orders/payment/webhook?redirect_to=isaraya://payment?status=success
PAYTECH_MOBILE_CANCEL_URL=https://isaraya.sarayatechsenegal.com/api/orders/payment/webhook?redirect_to=isaraya://payment?status=cancelled
```

### Frontend

#### app.json
```json
{
  "expo": {
    "scheme": "isaraya"
  }
}
```

#### app/_layout.tsx
```typescript
// ⚠️ NE PAS MODIFIER - Système d'écoute des deep links fonctionnel
useEffect(() => {
  const subscription = Linking.addEventListener('url', (event) => {
    console.log('Deep link received:', event.url);
  });

  Linking.getInitialURL().then((url) => {
    if (url) {
      console.log('App opened with deep link:', url);
    }
  });

  return () => subscription?.remove();
}, []);
```

#### app/payment.tsx
Écran qui reçoit les paramètres :
- `status`: success | cancelled | refunded | error
- `ref`: Référence de la commande
- `amount`: Montant du paiement
- `message`: Message descriptif

## Flux de Paiement

```
1. Client paie depuis l'app
   ↓
2. App → Backend avec origin="MOBILE_APP"
   ↓
3. Backend → PayTech avec URLs webhook configurées
   ↓
4. App ouvre PayTech dans navigateur (Linking.openURL)
   ↓
5. Client paie sur PayTech
   ↓
6. PayTech → Backend webhook
   ↓
7. Backend traite IPN et redirige vers:
   isaraya://payment?status=success&ref=XXX&amount=XXX
   ↓
8. App s'ouvre automatiquement sur l'écran de résultat
```

## ⚠️ Points Critiques

1. **Ne jamais modifier `app/_layout.tsx`** : Le système d'écoute Expo fonctionne
2. **Expo Router gère automatiquement** : La navigation vers `/payment` se fait automatiquement
3. **Backend contrôle les redirections** : Les URLs de webhook incluent le `redirect_to`

## Test Manuel

Pour tester le deep link manuellement :

```bash
# iOS
npx uri-scheme open "isaraya://payment?status=success&ref=test-123&amount=5000&message=Test" --ios

# Android  
npx uri-scheme open "isaraya://payment?status=success&ref=test-123&amount=5000&message=Test" --android
```

## Statuts Gérés

| Status | Affichage | Action |
|--------|-----------|--------|
| success | ✓ Vert | Voir ma commande |
| cancelled | ✗ Rouge | Réessayer |
| refunded | ↻ Orange | Voir ma commande |
| error | ! Rouge | Réessayer |
| pending | ! Gris | Voir mes commandes |

## Support

- Documentation complète : `PAYMENT_MOBILE.md`
- Backend webhook : `/api/orders/payment/webhook`
- Service frontend : `services/paiementService.ts`
