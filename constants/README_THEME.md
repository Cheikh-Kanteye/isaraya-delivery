# Système de Thème I-Saraya Delivery

## Vue d'ensemble

Le système de thème de l'application I-Saraya Delivery est basé sur une palette de couleurs cohérente centrée autour de la couleur principale **#fb8618** (orange vibrant).

---

## Structure des Fichiers

```
constants/
├── colors.ts          Palette de couleurs complète
├── theme.ts           Configuration du thème (typographie, espacement, ombres, etc.)
└── README_THEME.md    Ce fichier
```

---

## Couleurs

### Couleur Principale: Orange #fb8618

La couleur principale est déclinée en 10 nuances pour offrir flexibilité et cohérence:

```typescript
primary: {
  50: '#fff7ed',   // Très clair - Arrière-plans légers
  100: '#ffedd5',  // Clair - Hover states légers
  200: '#fed7aa',  // Clair moyen
  300: '#fdba74',  // Moyen clair
  400: '#fc9747',  // Moyen
  500: '#fb8618',  // PRINCIPAL - Boutons, liens, accents
  600: '#ea6d0f',  // Moyen foncé - Hover states
  700: '#c2570f',  // Foncé
  800: '#9a4515',  // Très foncé
  900: '#7c3a14',  // Ultra foncé - Texte sur fond clair
}
```

### Autres Palettes

#### Secondary (Rouge)
Utilisé pour les actions secondaires et alertes importantes
- 500: `#ef4444`

#### Accent (Jaune/Or)
Pour les highlights et éléments d'attention
- 500: `#f59e0b`

#### Success (Vert)
Pour les états de succès et confirmations
- 500: `#22c55e`

#### Warning (Jaune)
Pour les avertissements
- 500: `#eab308`

#### Error (Rouge)
Pour les erreurs et états négatifs
- 500: `#ef4444`

#### Neutral (Gris)
Pour le texte, bordures et arrière-plans neutres
- 50 à 900

---

## Utilisation

### Import

```typescript
import { Theme, Colors } from '@/constants/theme';
```

### Couleurs

```typescript
// Couleur principale
backgroundColor: Colors.primary[500]  // #fb8618

// Variantes
backgroundColor: Colors.primary[100]  // Très clair
backgroundColor: Colors.primary[700]  // Plus foncé

// Autres couleurs
color: Colors.neutral[900]            // Texte principal
borderColor: Colors.neutral[200]       // Bordures légères
backgroundColor: Colors.success[500]   // Vert de succès
```

### Typographie

```typescript
import { createTextStyle } from '@/constants/theme';

// Utilisation
const styles = StyleSheet.create({
  title: createTextStyle('2xl', 'bold', Colors.neutral[900]),
  subtitle: createTextStyle('lg', 'semibold', Colors.neutral[700]),
  body: createTextStyle('base', 'normal', Colors.neutral[600]),
  caption: createTextStyle('sm', 'normal', Colors.neutral[500]),
});
```

#### Tailles disponibles:
- `xs`: 12px
- `sm`: 14px
- `base`: 16px (par défaut)
- `lg`: 18px
- `xl`: 20px
- `2xl`: 24px
- `3xl`: 30px
- `4xl`: 36px
- `5xl`: 48px

#### Poids disponibles:
- `normal`: 400
- `medium`: 500
- `semibold`: 600
- `bold`: 700

### Espacement

```typescript
import { Theme } from '@/constants/theme';

const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing.lg,           // 16px
    marginBottom: Theme.spacing['2xl'],  // 24px
    gap: Theme.spacing.md,               // 12px
  },
});
```

#### Échelle d'espacement (basée sur 8px):
- `xs`: 4px
- `sm`: 8px
- `md`: 12px
- `lg`: 16px
- `xl`: 20px
- `2xl`: 24px
- `3xl`: 32px
- `4xl`: 40px
- `5xl`: 48px
- `6xl`: 64px
- `7xl`: 80px
- `8xl`: 96px

### Bordures

```typescript
import { Theme } from '@/constants/theme';

const styles = StyleSheet.create({
  card: {
    borderRadius: Theme.borderRadius.lg,    // 12px
  },
  button: {
    borderRadius: Theme.borderRadius.xl,    // 16px
  },
  avatar: {
    borderRadius: Theme.borderRadius.full,  // 9999px (cercle)
  },
});
```

### Ombres

```typescript
import { Theme } from '@/constants/theme';

const styles = StyleSheet.create({
  card: {
    ...Theme.shadows.md,
  },
  modal: {
    ...Theme.shadows.xl,
  },
});
```

### Helpers de Style

#### Boutons

```typescript
import { createButtonStyle } from '@/constants/theme';

const styles = StyleSheet.create({
  primaryButton: createButtonStyle('primary'),
  secondaryButton: createButtonStyle('secondary'),
  outlineButton: createButtonStyle('outline'),
  ghostButton: createButtonStyle('ghost'),
});
```

#### Cartes

```typescript
import { createCardStyle } from '@/constants/theme';

const styles = StyleSheet.create({
  card: createCardStyle('md'),
  elevatedCard: createCardStyle('lg'),
});
```

---

## Directives de Design

### 1. Utilisation de la Couleur Principale

La couleur orange `#fb8618` doit être utilisée pour:
- ✅ Boutons d'action principale
- ✅ Liens et éléments interactifs
- ✅ Indicateurs de progression
- ✅ Icônes importantes
- ✅ Tab bar active state
- ✅ États de focus

**Ne PAS surcharger**: Limitez l'utilisation à 10-20% de l'interface pour un impact maximal.

### 2. Hiérarchie Visuelle

```typescript
// Titre principal
createTextStyle('2xl', 'bold', Colors.neutral[900])

// Sous-titre
createTextStyle('lg', 'semibold', Colors.neutral[700])

// Corps de texte
createTextStyle('base', 'normal', Colors.neutral[600])

// Texte secondaire
createTextStyle('sm', 'normal', Colors.neutral[500])

// Caption/métadonnées
createTextStyle('xs', 'normal', Colors.neutral[400])
```

### 3. Contraste et Accessibilité

- ✅ Ratio de contraste minimum: 4.5:1 pour le texte normal
- ✅ Ratio de contraste minimum: 3:1 pour le texte large
- ✅ Toujours tester la lisibilité sur différents arrière-plans

```typescript
// BON - Contraste élevé
<Text style={{ color: Colors.neutral[900], backgroundColor: Colors.white }}>
  Texte lisible
</Text>

// ÉVITER - Contraste faible
<Text style={{ color: Colors.neutral[300], backgroundColor: Colors.neutral[200] }}>
  Difficile à lire
</Text>
```

### 4. États Interactifs

#### Boutons
```typescript
// Normal
backgroundColor: Colors.primary[500]

// Hover / Press
backgroundColor: Colors.primary[600]

// Disabled
backgroundColor: Colors.neutral[200]
color: Colors.neutral[400]
```

#### Liens
```typescript
// Normal
color: Colors.primary[500]

// Hover
color: Colors.primary[600]
textDecorationLine: 'underline'

// Visité
color: Colors.primary[700]
```

### 5. Feedback Visuel

```typescript
// Succès
backgroundColor: Colors.success[100]
color: Colors.success[700]

// Avertissement
backgroundColor: Colors.warning[100]
color: Colors.warning[700]

// Erreur
backgroundColor: Colors.error[100]
color: Colors.error[700]

// Information
backgroundColor: Colors.primary[100]
color: Colors.primary[700]
```

---

## Exemples Complets

### Bouton Principal

```typescript
import { StyleSheet } from 'react-native';
import { Theme, createButtonStyle, createTextStyle } from '@/constants/theme';

const styles = StyleSheet.create({
  button: {
    ...createButtonStyle('primary'),
    minWidth: 120,
  },
  buttonText: createTextStyle('base', 'semibold', Theme.colors.white),
});
```

### Carte de Produit

```typescript
import { StyleSheet } from 'react-native';
import { Theme, createCardStyle, createTextStyle } from '@/constants/theme';

const styles = StyleSheet.create({
  card: {
    ...createCardStyle('md'),
    marginBottom: Theme.spacing.md,
  },
  title: createTextStyle('lg', 'bold', Theme.colors.neutral[900]),
  price: createTextStyle('xl', 'bold', Theme.colors.primary[500]),
  description: createTextStyle('sm', 'normal', Theme.colors.neutral[600]),
});
```

### Header Personnalisé

```typescript
import { StyleSheet } from 'react-native';
import { Theme, createTextStyle } from '@/constants/theme';

const styles = StyleSheet.create({
  header: {
    backgroundColor: Theme.colors.white,
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[200],
    ...Theme.shadows.sm,
  },
  title: createTextStyle('2xl', 'bold', Theme.colors.neutral[900]),
  subtitle: createTextStyle('sm', 'normal', Theme.colors.neutral[500]),
});
```

---

## Mode Sombre (Future Extension)

Pour une future implémentation du mode sombre:

```typescript
// colors.ts
export const DarkColorPalette = {
  primary: ColorPalette.primary, // Même palette
  neutral: {
    50: '#1a1a1a',
    100: '#2a2a2a',
    // ... inversé
  },
  // ...
};
```

---

## Bonnes Pratiques

### ✅ À FAIRE

- Utiliser les constantes du thème plutôt que des valeurs codées en dur
- Maintenir la cohérence des espacements (multiples de 8px)
- Utiliser les helpers de style fournis
- Tester sur différentes tailles d'écran
- Vérifier le contraste pour l'accessibilité

### ❌ À ÉVITER

- Valeurs de couleur codées en dur: `color: '#fb8618'`
- Espacements arbitraires: `padding: 13px`
- Surcharge de la couleur principale
- Mélange de conventions de nommage
- Ignorer les ombres prédéfinies

---

## Support et Contribution

Pour toute question ou suggestion d'amélioration du système de thème:
1. Consultez d'abord cette documentation
2. Vérifiez les composants existants pour des exemples
3. Proposez des modifications via des pull requests

---

## Changelog

- **v1.0.0**: Système de thème initial avec couleur principale #fb8618
- Palette complète avec 10 nuances par couleur
- Helpers de style pour boutons et cartes
- Documentation complète
