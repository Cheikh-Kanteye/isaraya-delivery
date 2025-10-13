# Système de Filtres pour les Commandes

## Fonctionnalité

Lorsqu'un utilisateur clique sur "Express" ou "Standard" depuis la page d'accueil, il est redirigé vers la page des commandes avec le filtre correspondant **automatiquement activé**.

## Flux utilisateur

```
Page d'accueil
   ↓
Clic sur "Express" ou "Standard"
   ↓
Redirection vers /orders?filter=express (ou standard)
   ↓
Page Commandes affichée avec filtre actif
   ↓
Seules les commandes du type sélectionné sont affichées
```

## Implémentation

### 1. Page d'accueil (`app/(client)/(tabs)/index.tsx`)

Les boutons redirigent vers la page orders avec un paramètre de filtre :

```typescript
// Bouton Express
<TouchableOpacity
  onPress={() => router.push('/(client)/(tabs)/orders?filter=express')}
>
  <Text>Express</Text>
</TouchableOpacity>

// Bouton Standard
<TouchableOpacity
  onPress={() => router.push('/(client)/(tabs)/orders?filter=standard')}
>
  <Text>Standard</Text>
</TouchableOpacity>
```

### 2. Page des commandes (`app/(client)/(tabs)/orders.tsx`)

#### a. Récupération du paramètre URL

```typescript
const params = useLocalSearchParams<{ filter?: string }>();
const [activeFilter, setActiveFilter] = useState<DeliveryFilter>('ALL');

// Définir le filtre initial depuis les paramètres URL
useEffect(() => {
  if (params.filter) {
    const filter = params.filter.toUpperCase() as DeliveryFilter;
    if (filter === 'EXPRESS' || filter === 'STANDARD') {
      setActiveFilter(filter);
    }
  }
}, [params.filter]);
```

#### b. Barre de filtres

Trois boutons sont affichés en haut de la page :
- **Tous** - Affiche toutes les commandes
- **Express** - Filtre uniquement les commandes Express
- **Standard** - Filtre uniquement les commandes Standard

```typescript
<View style={styles.filtersContainer}>
  <TouchableOpacity
    style={[
      styles.filterButton,
      activeFilter === 'ALL' && styles.filterButtonActive,
    ]}
    onPress={() => setActiveFilter('ALL')}
  >
    <Text>Tous</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[
      styles.filterButton,
      activeFilter === 'EXPRESS' && styles.filterButtonActive,
    ]}
    onPress={() => setActiveFilter('EXPRESS')}
  >
    <Zap size={16} />
    <Text>Express</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[
      styles.filterButton,
      activeFilter === 'STANDARD' && styles.filterButtonActive,
    ]}
    onPress={() => setActiveFilter('STANDARD')}
  >
    <Truck size={16} />
    <Text>Standard</Text>
  </TouchableOpacity>
</View>
```

#### c. Filtrage des commandes

```typescript
const filteredOrders = orders.filter((order) => {
  if (activeFilter === 'ALL') return true;
  if (activeFilter === 'EXPRESS') return order.deliveryType === 'EXPRESS';
  if (activeFilter === 'STANDARD') return order.deliveryType === 'STANDARD';
  return true;
});
```

#### d. Badge de type sur chaque commande

Chaque commande affiche son type avec une icône :

```typescript
<View style={styles.deliveryTypeBadge}>
  {order.deliveryType === 'EXPRESS' ? (
    <Zap size={12} color={Theme.colors.primary[600]} />
  ) : (
    <Truck size={12} color={Theme.colors.secondary[600]} />
  )}
  <Text>{order.deliveryType === 'EXPRESS' ? 'Express' : 'Standard'}</Text>
</View>
```

## Interface utilisateur

### Barre de filtres

```
┌─────────────────────────────────────────────────┐
│  [Tous]  [⚡ Express]  [🚛 Standard]           │
└─────────────────────────────────────────────────┘
```

- **Tous** : Fond gris, texte noir
- **Filtre actif** : Fond bleu (primary), texte blanc
- **Icônes** : Éclair pour Express, Camion pour Standard

### Badge sur les commandes

Chaque carte de commande affiche :

```
┌──────────────────────────────────────────┐
│ [En cours]          Il y a 5 minutes     │
│ [⚡ Express]                             │
│ [✓ Payé]                                 │
│                                          │
│ 📍 Récupération                          │
│    Rue 10, Sicap Liberté, Dakar         │
│    │                                     │
│    ↓                                     │
│ 📍 Livraison                             │
│    Avenue Cheikh Anta Diop, Fann        │
│                                          │
│ Montant: 2 000 FCFA                     │
└──────────────────────────────────────────┘
```

## Couleurs des badges

### Type de livraison

| Type     | Fond                        | Texte/Icône                |
|----------|-----------------------------|-----------------------------|
| Express  | `Theme.colors.primary[100]` | `Theme.colors.primary[600]` |
| Standard | `Theme.colors.secondary[100]`| `Theme.colors.secondary[600]`|

### Boutons de filtre

| État   | Fond                        | Texte                       |
|--------|-----------------------------|-----------------------------|
| Inactif| `Theme.colors.neutral[100]` | `Theme.colors.neutral[700]` |
| Actif  | `Theme.colors.primary[500]` | `Theme.colors.white`        |

## États vides

### Filtre actif sans commandes

Si un utilisateur active un filtre mais n'a aucune commande de ce type :

```
         📦
  Aucune commande Express
  Vous n'avez pas encore de
  commande de ce type
```

### Aucune commande

Si l'utilisateur n'a aucune commande :

```
         📦
    Aucune commande
  Vous n'avez pas encore
   passé de commande
```

## Exemples d'utilisation

### Scénario 1 : Navigation depuis la page d'accueil

```typescript
// Page d'accueil
1. Utilisateur clique sur "Express"
2. router.push('/(client)/(tabs)/orders?filter=express')
3. Page orders s'ouvre avec filtre Express activé
4. Seules les commandes Express sont affichées
```

### Scénario 2 : Changement de filtre manuel

```typescript
// Sur la page orders
1. Utilisateur voit toutes ses commandes (filtre "Tous" actif)
2. Utilisateur clique sur "Express"
3. setActiveFilter('EXPRESS')
4. filteredOrders recalculé automatiquement
5. Seules les commandes Express sont affichées
```

### Scénario 3 : Navigation directe

```typescript
// Navigation depuis une autre partie de l'app
1. router.push('/(client)/(tabs)/orders?filter=standard')
2. Page orders s'ouvre avec filtre Standard activé
3. Seules les commandes Standard sont affichées
```

## Paramètres d'URL supportés

| Paramètre | Valeurs acceptées | Description |
|-----------|-------------------|-------------|
| `filter`  | `express`, `standard` | Active le filtre correspondant |

**Note :** La valeur est insensible à la casse (EXPRESS, express, Express fonctionnent).

## Types TypeScript

```typescript
type DeliveryFilter = 'ALL' | 'EXPRESS' | 'STANDARD';

interface DeliveryRequest {
  id: string;
  deliveryType: 'EXPRESS' | 'STANDARD';
  status: string;
  paymentStatus: string;
  pickupAddress: string;
  destinationAddress: string;
  deliveryFee: number;
  createdAt: string;
  // ... autres champs
}
```

## Tests

### Test 1 : Navigation depuis la page d'accueil

```bash
1. Ouvrir la page d'accueil
2. Cliquer sur "Express"
3. Vérifier que la page orders s'ouvre
4. Vérifier que le filtre "Express" est actif (bouton bleu)
5. Vérifier que seules les commandes Express sont affichées
```

### Test 2 : Changement de filtre

```bash
1. Ouvrir la page orders
2. Cliquer sur "Express"
3. Vérifier que seules les commandes Express sont affichées
4. Cliquer sur "Standard"
5. Vérifier que seules les commandes Standard sont affichées
6. Cliquer sur "Tous"
7. Vérifier que toutes les commandes sont affichées
```

### Test 3 : État vide

```bash
1. Utilisateur n'a que des commandes Standard
2. Cliquer sur "Express"
3. Vérifier que le message "Aucune commande Express" s'affiche
```

### Test 4 : URL directe

```bash
1. Naviguer vers /(client)/(tabs)/orders?filter=express
2. Vérifier que le filtre Express est activé
```

## Améliorations futures

### 1. Persistance du filtre

Sauvegarder le filtre sélectionné dans AsyncStorage :

```typescript
useEffect(() => {
  AsyncStorage.setItem('lastOrderFilter', activeFilter);
}, [activeFilter]);
```

### 2. Compteur de commandes

Afficher le nombre de commandes pour chaque filtre :

```
[Tous (5)]  [⚡ Express (3)]  [🚛 Standard (2)]
```

### 3. Animation de transition

Ajouter une animation lors du changement de filtre :

```typescript
<Animated.View style={{ opacity: fadeAnim }}>
  {filteredOrders.map(...)}
</Animated.View>
```

### 4. Filtres combinés

Permettre de filtrer par type ET statut :

```
Type: [Express] [Standard]
Statut: [En cours] [Livré] [En attente]
```

## Fichiers modifiés

- ✅ `app/(client)/(tabs)/index.tsx` - Redirection vers orders avec filtre
- ✅ `app/(client)/(tabs)/orders.tsx` - Système de filtres et badges
- 📄 `FILTERS_ORDERS.md` - Cette documentation

## Support

En cas de problème :
1. Vérifier que `deliveryType` est bien dans les données des commandes
2. Vérifier les logs console pour les paramètres URL
3. Vérifier que les valeurs sont en majuscules ('EXPRESS', 'STANDARD')
