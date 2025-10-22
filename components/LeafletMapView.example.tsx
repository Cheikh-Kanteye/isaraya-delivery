/**
 * Exemple d'utilisation du composant LeafletMapView
 * 
 * Ce composant remplace react-native-webview-leaflet qui dépendait
 * de @unimodules/core (obsolète depuis Expo SDK 44+).
 */

import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { LeafletMapView } from './LeafletMapView';

export const LeafletMapExample = () => {
  const markers = [
    {
      lat: 14.6928,
      lng: -17.4467,
      title: 'Point de livraison 1',
      description: 'Plateau, Dakar',
    },
    {
      lat: 14.7167,
      lng: -17.4677,
      title: 'Point de livraison 2',
      description: 'Yoff, Dakar',
    },
  ];

  const handleMarkerPress = (marker: any) => {
    Alert.alert(
      marker.title || 'Marqueur',
      marker.description || 'Aucune description'
    );
  };

  return (
    <View style={styles.container}>
      <LeafletMapView
        center={{ lat: 14.6928, lng: -17.4467 }}
        zoom={12}
        markers={markers}
        onMarkerPress={handleMarkerPress}
        style={styles.map}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
