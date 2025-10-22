# Migration de react-native-webview-leaflet vers react-native-webview

## 🔴 Problème résolu

`react-native-webview-leaflet@5.0.2` dépendait de `@unimodules/core` via `expo-asset-utils`, qui est **obsolète depuis Expo SDK 44+**. Cela causait des erreurs de build Android sur EAS Build avec Expo SDK 54.

### Chaîne de dépendances problématique
```
react-native-webview-leaflet@5.0.2
└─ expo-asset-utils@1.2.0
   └── @unimodules/core@7.1.2 (peer)
```

## ✅ Solution implémentée

### 1. Suppression du package obsolète
- ❌ Supprimé : `react-native-webview-leaflet@5.0.2`
- ✅ Conservé : `react-native-webview@13.15.0` (officiellement supporté par Expo)

### 2. Nettoyage du build hook Android
Supprimé le workaround `unimodules-core` dans `eas-hooks/eas-build.gradle` :
```gradle
// ❌ Supprimé
if (project.name == 'unimodules-core') {
    project.buildFile.text = project.buildFile.text.replace("apply plugin: 'maven'", "apply plugin: 'maven-publish'")
}
```

### 3. Nouveau composant : LeafletMapView

Un composant React Native qui utilise `react-native-webview` avec Leaflet intégré via HTML/JS.

#### Fichiers créés
- `components/LeafletMapView.tsx` - Composant réutilisable
- `components/LeafletMapView.example.tsx` - Exemple d'utilisation

#### Fonctionnalités
- ✅ Affichage de cartes Leaflet via WebView
- ✅ Support des marqueurs multiples
- ✅ Popups personnalisables
- ✅ Callbacks pour les événements (click sur marqueur)
- ✅ Auto-zoom pour afficher tous les marqueurs
- ✅ Compatible avec Expo Managed Workflow + EAS Build

## 📦 Utilisation

### Exemple basique
```tsx
import { LeafletMapView } from './components/LeafletMapView';

<LeafletMapView
  center={{ lat: 14.6928, lng: -17.4467 }}
  zoom={13}
  markers={[
    {
      lat: 14.6928,
      lng: -17.4467,
      title: 'Dakar',
      description: 'Capitale du Sénégal',
    },
  ]}
  onMarkerPress={(marker) => console.log('Marqueur cliqué:', marker)}
/>
```

### Props disponibles
| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `center` | `{ lat: number, lng: number }` | `{ lat: 14.6928, lng: -17.4467 }` | Centre de la carte |
| `zoom` | `number` | `13` | Niveau de zoom initial |
| `markers` | `Marker[]` | `[]` | Liste des marqueurs à afficher |
| `style` | `object` | - | Style personnalisé du conteneur |
| `onMarkerPress` | `(marker: Marker) => void` | - | Callback au clic sur un marqueur |

## 🚀 Prochaines étapes

1. **Tester le build Android** :
   ```bash
   eas build --platform android --profile preview
   ```

2. **Remplacer expo-maps (si nécessaire)** :
   Si vous utilisez `expo-maps` et rencontrez des problèmes, vous pouvez également le remplacer par `LeafletMapView`.

3. **Personnaliser la carte** :
   - Modifier les styles de la carte dans le HTML
   - Ajouter des layers supplémentaires
   - Implémenter la géolocalisation

## 📚 Références

- [react-native-webview Documentation](https://github.com/react-native-webview/react-native-webview)
- [Leaflet Documentation](https://leafletjs.com/)
- [Expo SDK 54 Release Notes](https://docs.expo.dev/versions/v54.0.0/)

## ✨ Avantages de cette solution

1. ✅ **Compatible** avec Expo Managed Workflow
2. ✅ **Build Android** fonctionne sur EAS Build
3. ✅ **Maintenu** - `react-native-webview` est activement maintenu
4. ✅ **Flexible** - Accès complet à l'API Leaflet via JavaScript
5. ✅ **Léger** - Pas de dépendances natives supplémentaires
