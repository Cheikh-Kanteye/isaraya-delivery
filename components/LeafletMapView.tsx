import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import WebView from 'react-native-webview';

interface Marker {
  lat: number;
  lng: number;
  title?: string;
  description?: string;
}

interface LeafletMapViewProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Marker[];
  style?: object;
  onMarkerPress?: (marker: Marker) => void;
}

export const LeafletMapView: React.FC<LeafletMapViewProps> = ({
  center = { lat: 14.6928, lng: -17.4467 }, // Dakar par défaut
  zoom = 13,
  markers = [],
  style,
  onMarkerPress,
}) => {
  const webViewRef = useRef<WebView>(null);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'markerClick' && onMarkerPress) {
        onMarkerPress(data.marker);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const markersJson = JSON.stringify(markers);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body, html { 
            margin: 0; 
            padding: 0; 
            height: 100%; 
            width: 100%;
          }
          #map { 
            height: 100%; 
            width: 100%;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          // Initialiser la carte
          const map = L.map('map').setView([${center.lat}, ${center.lng}], ${zoom});
          
          // Ajouter la couche de tuiles OpenStreetMap
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);
          
          // Ajouter les marqueurs
          const markers = ${markersJson};
          markers.forEach((marker, index) => {
            const leafletMarker = L.marker([marker.lat, marker.lng]).addTo(map);
            
            if (marker.title || marker.description) {
              leafletMarker.bindPopup(\`
                <div>
                  \${marker.title ? '<strong>' + marker.title + '</strong><br/>' : ''}
                  \${marker.description || ''}
                </div>
              \`);
            }
            
            leafletMarker.on('click', () => {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'markerClick',
                marker: marker
              }));
            });
          });
          
          // Ajuster la vue pour montrer tous les marqueurs
          if (markers.length > 1) {
            const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
            map.fitBounds(bounds, { padding: [50, 50] });
          }
        </script>
      </body>
    </html>
  `;

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
