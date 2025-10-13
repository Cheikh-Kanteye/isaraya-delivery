import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import {
  ArrowLeft,
  Navigation,
  Package,
  MapPin,
  CheckCircle,
} from 'lucide-react-native';
import { Theme, createTextStyle } from '@/constants/theme';
import { useUserLocation } from '@/hooks/useUserLocation';
import { deliveryService } from '@/services/deliveryService';

// HTML content for the Leaflet map with Routing Machine
const mapHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Navigation</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css" />
  <style>
    body { margin: 0; padding: 0; }
    #map { height: 100vh; width: 100vw; }
    .leaflet-routing-container { display: none; }
    .leaflet-control-attribution { font-size: 10px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.js"></script>
  <script>
    var map = L.map('map').setView([14.6928, -17.4467], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19
    }).addTo(map);

    var routingControl = null;
    var userMarker = null;
    var destinationMarker = null;
    var allMarkers = [];

    // Custom icons
    var userIcon = L.icon({
      iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxMiIgZmlsbD0iIzAwN2JmZiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIzIi8+PC9zdmc+',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    var pickupIcon = L.icon({
      iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMiA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTYgNDhDMTYgNDggMzIgMjggMzIgMTZDMzIgNy4xNjM0NCAyNC44MzY2IDAgMTYgMEM3LjE2MzQ0IDAgMCA3LjE2MzQ0IDAgMTZDMCAyOCAxNiA0OCAxNiA0OFoiIGZpbGw9IiNmZjk4MDAiLz48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSI4IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==',
      iconSize: [32, 48],
      iconAnchor: [16, 48],
    });

    var deliveryIcon = L.icon({
      iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMiA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTYgNDhDMTYgNDggMzIgMjggMzIgMTZDMzIgNy4xNjM0NCAyNC44MzY2IDAgMTYgMEM3LjE2MzQ0IDAgMCA3LjE2MzQ0IDAgMTZDMCAyOCAxNiA0OCAxNiA0OFoiIGZpbGw9IiMxMGI5ODEiLz48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSI4IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==',
      iconSize: [32, 48],
      iconAnchor: [16, 48],
    });

    window.addEventListener('message', function(event) {
      try {
        const data = JSON.parse(event.data);
        console.log('Received data in webview:', data);
        
        // Update user location marker
        if (data.userLocation) {
          console.log('Updating user location:', data.userLocation);
          if (userMarker) {
            userMarker.setLatLng([data.userLocation.lat, data.userLocation.lng]);
          } else {
            userMarker = L.marker([data.userLocation.lat, data.userLocation.lng], {
              icon: userIcon
            }).addTo(map).bindPopup('Votre position');
          }
          
          // Only center on user if no route is active
          if (!routingControl) {
            map.setView([data.userLocation.lat, data.userLocation.lng], 15);
          }
        }
        
        // Create or update route
        if (data.route) {
          console.log('Creating route:', data.route);
          // Remove old routing control
          if (routingControl) {
            map.removeControl(routingControl);
            routingControl = null;
          }
          
          // Remove old destination marker
          if (destinationMarker) {
            map.removeLayer(destinationMarker);
            destinationMarker = null;
          }
          
          // Add destination marker with appropriate icon
          const icon = data.route.type === 'pickup' ? pickupIcon : deliveryIcon;
          const color = data.route.type === 'pickup' ? '#ff9800' : '#10b981';
          
          destinationMarker = L.marker([data.route.end.lat, data.route.end.lng], {
            icon: icon
          }).addTo(map).bindPopup(data.route.label || 'Destination');
          
          // Create routing control with dynamic waypoints
          routingControl = L.Routing.control({
            waypoints: [
              L.latLng(data.route.start.lat, data.route.start.lng),
              L.latLng(data.route.end.lat, data.route.end.lng)
            ],
            routeWhileDragging: false,
            show: false,
            addWaypoints: false,
            draggableWaypoints: false,
            lineOptions: {
              styles: [{
                color: color,
                weight: 5,
                opacity: 0.8
              }]
            },
            createMarker: function() { return null; } // Don't create default markers
          }).addTo(map);
          
          // Update route when it's calculated
          routingControl.on('routesfound', function(e) {
            const routes = e.routes;
            const summary = routes[0].summary;
            
            // Send route info back to React Native
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'routeInfo',
              distance: (summary.totalDistance / 1000).toFixed(1), // km
              duration: Math.round(summary.totalTime / 60) // minutes
            }));
          });
          
          // Fit bounds to show entire route with padding
          setTimeout(() => {
            const bounds = L.latLngBounds([
              [data.route.start.lat, data.route.start.lng],
              [data.route.end.lat, data.route.end.lng]
            ]);
            map.fitBounds(bounds, { 
              padding: [80, 80],
              maxZoom: 16
            });
          }, 500);
        }
        
        // Update route waypoints if position changed during navigation
        if (data.updateRoute && routingControl) {
          routingControl.setWaypoints([
            L.latLng(data.updateRoute.start.lat, data.updateRoute.start.lng),
            L.latLng(data.updateRoute.end.lat, data.updateRoute.end.lng)
          ]);
        }
      } catch (e) {
        console.error('Error:', e);
      }
    });

    window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'ready' }));
  </script>
</body>
</html>
`;

type NavigationPhase = 'to_pickup' | 'to_delivery';

export default function NavigationScreen() {
  const params = useLocalSearchParams<{ orderId: string }>();
  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId;
  const router = useRouter();
  
  console.log('OrderId from params:', orderId);
  const webViewRef = useRef<WebView>(null);
  const [phase, setPhase] = useState<NavigationPhase>('to_pickup');
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: number } | null>(null);
  const [currentAddress, setCurrentAddress] = useState<string>('Chargement de l\'adresse...');
  const [isRouteInitialized, setIsRouteInitialized] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const { location, startTracking, stopTracking } = useUserLocation();
  const lastLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  const lastPositionUpdateRef = useRef<number>(0);

  useEffect(() => {
    startTracking();
    fetchOrderData();
    return () => stopTracking();
  }, []);

  // Reverse geocoding to get current address
  const updateCurrentAddress = async (lat: number, lng: number) => {
    try {
      const addresses = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (addresses && addresses.length > 0) {
        const addr = addresses[0];
        const parts = [
          addr.name,
          addr.street,
          addr.district,
          addr.city,
          addr.region,
        ].filter(Boolean);
        setCurrentAddress(parts.join(', ') || 'Adresse non disponible');
      }
    } catch (error) {
      console.error('Error getting address:', error);
    }
  };

  // Update position to backend periodically
  const updatePositionToBackend = async (lat: number, lng: number) => {
    const now = Date.now();
    // Only update every 30 seconds to avoid too many requests
    if (now - lastPositionUpdateRef.current < 30000) return;
    
    try {
      await deliveryService.updateMissionPosition(orderId, {
        latitude: lat,
        longitude: lng,
      });
      lastPositionUpdateRef.current = now;
    } catch (error) {
      console.error('Error updating position to backend:', error);
    }
  };

  const fetchOrderData = async () => {
    try {
      console.log('Fetching order with ID:', orderId);
      if (!orderId) {
        throw new Error('Order ID is missing');
      }
      const response = await deliveryService.getMissionById(orderId);
      console.log('Order data:', response);
      setOrderData(response.payload);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails de la commande');
      router.back();
    }
  };

  // Initialize route when data is loaded and location is available
  useEffect(() => {
    if (!location || !webViewRef.current || !orderData || isRouteInitialized || !isMapReady) return;

    console.log('Initializing route with data:', {
      location,
      pickupLat: orderData.pickupLatitude,
      pickupLng: orderData.pickupLongitude,
      phase
    });

    const destination =
      phase === 'to_pickup'
        ? {
            lat: orderData.pickupLatitude,
            lng: orderData.pickupLongitude,
            label: orderData.pickupAddress,
          }
        : {
            lat: orderData.destinationLatitude,
            lng: orderData.destinationLongitude,
            label: orderData.destinationAddress,
          };

    // Initial route setup
    const routeData = {
      userLocation: location,
      route: {
        start: location,
        end: destination,
        type: phase === 'to_pickup' ? 'pickup' : 'delivery',
        label: destination.label
      }
    };

    webViewRef.current.injectJavaScript(`
      window.postMessage(${JSON.stringify(JSON.stringify(routeData))}, '*');
      true;
    `);

    lastLocationRef.current = location;
    setIsRouteInitialized(true);
  }, [location, orderData, isRouteInitialized, isMapReady]);

  // Reinitialize route when phase changes
  useEffect(() => {
    if (!location || !webViewRef.current || !orderData) return;
    if (phase === 'to_pickup') return; // Already initialized

    console.log('Changing phase to delivery');
    setIsRouteInitialized(false); // Trigger re-initialization
  }, [phase]);

  // Update user location in real-time
  useEffect(() => {
    if (!location || !webViewRef.current || !orderData || !isMapReady) return;

    // Update user marker position
    webViewRef.current.injectJavaScript(`
      window.postMessage(JSON.stringify({
        userLocation: ${JSON.stringify(location)}
      }), '*');
    `);

    // Update current address via reverse geocoding
    updateCurrentAddress(location.lat, location.lng);

    // Update position to backend
    updatePositionToBackend(location.lat, location.lng);

    // Update route waypoints if location changed significantly (> 10 meters)
    if (lastLocationRef.current && isRouteInitialized) {
      const distance = getDistance(lastLocationRef.current, location);
      if (distance > 0.01) { // ~10 meters
        const destination =
          phase === 'to_pickup'
            ? {
                lat: orderData.pickupLatitude,
                lng: orderData.pickupLongitude,
              }
            : {
                lat: orderData.destinationLatitude,
                lng: orderData.destinationLongitude,
              };

        webViewRef.current.injectJavaScript(`
          window.postMessage(JSON.stringify({
            updateRoute: {
              start: ${JSON.stringify(location)},
              end: ${JSON.stringify(destination)}
            }
          }), '*');
        `);

        lastLocationRef.current = location;
      }
    }
  }, [location]);

  // Helper function to calculate distance between two points
  const getDistance = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
    const dLng = ((point2.lng - point1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((point1.lat * Math.PI) / 180) *
        Math.cos((point2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handlePickupComplete = async () => {
    Alert.alert(
      'Colis récupéré',
      'Confirmez-vous avoir récupéré le colis ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              const resp = await deliveryService.updateMissionStatus({
                missionId: orderId,
                status: 'IN_PROGRESS',
              });
              console.log(resp)
              setPhase('to_delivery');
            } catch (error) {
              console.error('Error updating status:', error);
              Alert.alert('Erreur', 'Impossible de mettre à jour le statut');
            }
          },
        },
      ]
    );
  };

  const handleDeliveryComplete = async () => {
    Alert.alert(
      'Livraison terminée',
      'Confirmez-vous avoir livré le colis ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              const resp = await deliveryService.updateMissionStatus({
                missionId: orderId,
                status: 'DELIVERED',
              });
              console.log("Livraison terminé:", resp)
              Alert.alert('Succès', 'Livraison terminée avec succès !', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error) {
              console.error('Error updating status:', error);
              Alert.alert('Erreur', 'Impossible de mettre à jour le statut');
            }
          },
        },
      ]
    );
  };

  if (loading || !orderData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft
            size={Theme.layout.iconSize.md}
            color={Theme.colors.white}
            strokeWidth={2}
          />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            {phase === 'to_pickup' ? 'Vers le point de retrait' : 'Vers la livraison'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {phase === 'to_pickup'
              ? orderData.pickupAddress
              : orderData.destinationAddress}
          </Text>
        </View>
      </View>

      {/* Current Location Card */}
      <View style={styles.locationCard}>
        <View style={styles.locationIconContainer}>
          <Navigation
            size={Theme.layout.iconSize.sm}
            color={Theme.colors.primary[500]}
            strokeWidth={2}
          />
        </View>
        <View style={styles.locationInfo}>
          <Text style={styles.locationLabel}>Votre position actuelle</Text>
          <Text style={styles.locationAddress} numberOfLines={2}>
            {currentAddress}
          </Text>
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHtml }}
          style={styles.map}
          originWhitelist={['*']}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              console.log('Message from WebView:', data);
              
              if (data.status === 'ready') {
                console.log('Map is ready!');
                setIsMapReady(true);
              }
              
              if (data.type === 'routeInfo') {
                setRouteInfo({
                  distance: data.distance,
                  duration: data.duration,
                });
              }
            } catch (error) {
              console.error('Error parsing message:', error);
            }
          }}
        />
      </View>

      {/* Bottom Action Card */}
      <View style={styles.actionCard}>
        <View style={styles.phaseIndicator}>
          <View
            style={[
              styles.phaseStep,
              phase === 'to_pickup' && styles.phaseStepActive,
            ]}
          >
            <Package
              size={Theme.layout.iconSize.sm}
              color={
                phase === 'to_pickup'
                  ? Theme.colors.warning[500]
                  : Theme.colors.success[500]
              }
              strokeWidth={2}
            />
            <Text
              style={[
                styles.phaseText,
                phase === 'to_pickup' && styles.phaseTextActive,
              ]}
            >
              Récupération
            </Text>
          </View>

          <View style={styles.phaseLine} />

          <View
            style={[
              styles.phaseStep,
              phase === 'to_delivery' && styles.phaseStepActive,
            ]}
          >
            <MapPin
              size={Theme.layout.iconSize.sm}
              color={
                phase === 'to_delivery'
                  ? Theme.colors.success[500]
                  : Theme.colors.neutral[400]
              }
              strokeWidth={2}
            />
            <Text
              style={[
                styles.phaseText,
                phase === 'to_delivery' && styles.phaseTextActive,
              ]}
            >
              Livraison
            </Text>
          </View>
        </View>

        <View style={styles.orderInfo}>
          <Text style={styles.orderLabel}>Commande #{orderId.slice(0, 8)}</Text>
          <Text style={styles.orderAmount}>
            {orderData.deliveryFee?.toLocaleString('fr-FR')} FCFA
          </Text>
        </View>

        {phase === 'to_pickup' ? (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handlePickupComplete}
          >
            <CheckCircle
              size={Theme.layout.iconSize.sm}
              color={Theme.colors.white}
              strokeWidth={2}
            />
            <Text style={styles.actionButtonText}>Colis récupéré</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.deliveryButton]}
            onPress={handleDeliveryComplete}
          >
            <CheckCircle
              size={Theme.layout.iconSize.sm}
              color={Theme.colors.white}
              strokeWidth={2}
            />
            <Text style={styles.actionButtonText}>Livraison terminée</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.neutral[900],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...createTextStyle('base', 'medium', Theme.colors.neutral[600]),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Theme.colors.primary[500],
    gap: Theme.spacing.md,
  },
  backButton: {
    padding: Theme.spacing.sm,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    ...createTextStyle('lg', 'bold', Theme.colors.white),
    marginBottom: Theme.spacing.xs,
  },
  headerSubtitle: {
    ...createTextStyle('sm', 'normal', Theme.colors.white),
    opacity: 0.9,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
    width: Dimensions.get('window').width,
  },
  actionCard: {
    backgroundColor: Theme.colors.white,
    borderTopLeftRadius: Theme.borderRadius['2xl'],
    borderTopRightRadius: Theme.borderRadius['2xl'],
    padding: Theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  phaseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.xl,
  },
  phaseStep: {
    alignItems: 'center',
    gap: Theme.spacing.xs,
    opacity: 0.5,
  },
  phaseStepActive: {
    opacity: 1,
  },
  phaseText: {
    ...createTextStyle('xs', 'medium', Theme.colors.neutral[600]),
  },
  phaseTextActive: {
    ...createTextStyle('xs', 'semibold', Theme.colors.neutral[900]),
  },
  phaseLine: {
    flex: 1,
    height: 2,
    backgroundColor: Theme.colors.neutral[200],
    marginHorizontal: Theme.spacing.md,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    backgroundColor: Theme.colors.neutral[50],
    borderRadius: Theme.borderRadius.lg,
  },
  orderLabel: {
    ...createTextStyle('sm', 'medium', Theme.colors.neutral[600]),
  },
  orderAmount: {
    ...createTextStyle('lg', 'bold', Theme.colors.primary[500]),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.warning[500],
    paddingVertical: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    gap: Theme.spacing.sm,
  },
  deliveryButton: {
    backgroundColor: Theme.colors.success[500],
  },
  actionButtonText: {
    ...createTextStyle('base', 'bold', Theme.colors.white),
  },
  locationCard: {
    backgroundColor: Theme.colors.white,
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.md,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    ...createTextStyle('xs', 'medium', Theme.colors.neutral[500]),
    marginBottom: Theme.spacing.xs,
  },
  locationAddress: {
    ...createTextStyle('sm', 'semibold', Theme.colors.neutral[900]),
  },
});
