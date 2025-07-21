import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { orders as ConstantOrders } from '@/constants/orders';
import OrderCard from '@/components/orders/OrderCard';
import { Theme, createTextStyle } from '@/constants/theme';
import { Order } from '@/types/orders';
import { useUserLocation } from '@/hooks/useUserLocation';
import { X } from 'lucide-react-native';

// HTML content for the Leaflet map with Routing Machine
const mapHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Leaflet Map</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css" />
  <style>
    body { margin: 0; padding: 0; }
    #map { height: 100vh; width: 100vw; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.js"></script>
  <script>
    var map = L.map('map');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var routingControl = null;
    var userMarker = null;

    // Listen for messages from React Native
    window.addEventListener('message', function(event) {
      try {
        const data = JSON.parse(event.data);
        if (data.center) {
          map.setView([data.center.lat, data.center.lng], 13);
        }
        if (data.markers) {
          data.markers.forEach(marker => {
            L.marker([marker.lat, marker.lng])
              .addTo(map)
              .bindPopup(\`<b>\${marker.name}</b><br>\${marker.address}\`);
          });
        }
        if (data.userLocation) {
          if (userMarker) {
            userMarker.setLatLng([data.userLocation.lat, data.userLocation.lng]);
          } else {
            userMarker = L.marker([data.userLocation.lat, data.userLocation.lng], {
              icon: L.icon({
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [0, -41]
              })
            })
              .addTo(map)
              .bindPopup('You are here');
          }
          map.panTo([data.userLocation.lat, data.userLocation.lng]);
        }
        if (data.route) {
          if (routingControl) {
            map.removeControl(routingControl);
            routingControl = null;
          }
          routingControl = L.Routing.control({
            waypoints: [
              L.latLng(data.route.start.lat, data.route.start.lng),
              L.latLng(data.route.end.lat, data.route.end.lng)
            ],
            routeWhileDragging: false,
            show: false,
            addWaypoints: false,
            lineOptions: { styles: [{ color: '#007bff', weight: 4 }] }
          }).addTo(map);
        }
        if (data.route === null) {
          if (routingControl) {
            map.removeControl(routingControl);
            routingControl = null;
          }
        }
      } catch (e) {
        console.error('Error parsing message:', e);
      }
    });

    // Notify React Native that the map is loaded
    window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'mapLoaded' }));
  </script>
</body>
</html>
`;

const Map: React.FC = () => {
  const webViewRef = useRef<WebView>(null);
  const [orders, setOrders] = useState<Order[]>(ConstantOrders);
  const [navigatingOrderId, setNavigatingOrderId] = useState<string | null>(
    null
  );
  const { location, isLoading, error, startTracking, stopTracking } =
    useUserLocation();

  // Send map center, markers, and user location to WebView when not navigating
  useEffect(() => {
    if (!location || !webViewRef.current || navigatingOrderId) return;

    const markers = orders.map((order) => ({
      lat: order.lat,
      lng: order.lng,
      name: order.restaurant,
      address: order.address,
    }));

    const timer = setTimeout(() => {
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          window.postMessage(JSON.stringify({
            center: ${JSON.stringify(location)},
            markers: ${JSON.stringify(markers)},
            userLocation: ${JSON.stringify(location)}
          }), '*');
        `);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [location, orders, navigatingOrderId]);

  // Update route and user location during navigation
  useEffect(() => {
    if (!location || !webViewRef.current || !navigatingOrderId) return;

    const order = orders.find((o) => o.id === navigatingOrderId);
    if (!order) return;

    webViewRef.current.injectJavaScript(`
      window.postMessage(JSON.stringify({
        userLocation: ${JSON.stringify(location)},
        route: {
          start: ${JSON.stringify(location)},
          end: { lat: ${order.lat}, lng: ${order.lng} }
        }
      }), '*');
    `);
  }, [location, navigatingOrderId, orders]);

  const handleAccept = (orderId: string): void => {
    console.log(`Accepted delivery: ${orderId}`);
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: 'accepted' } : order
      )
    );
  };

  const handleDecline = (orderId: string): void => {
    console.log(`Declined delivery: ${orderId}`);
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: 'rejected' } : order
      )
    );
  };

  const handleCall = (orderId: string): void => {
    console.log(`Call customer: ${orderId}`);
  };

  const handleMessage = (orderId: string): void => {
    console.log(`Message customer: ${orderId}`);
  };

  const handleNavigate = (orderId: string): void => {
    console.log(`Navigate to: ${orderId}`);
    if (!location || !webViewRef.current) return;

    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    setNavigatingOrderId(orderId);
    startTracking();

    webViewRef.current.injectJavaScript(`
      window.postMessage(JSON.stringify({
        route: {
          start: ${JSON.stringify(location)},
          end: { lat: ${order.lat}, lng: ${order.lng} }
        }
      }), '*');
    `);
  };

  const handleStopNavigation = (): void => {
    console.log('Stopped navigation');
    setNavigatingOrderId(null);
    stopTracking();
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        window.postMessage(JSON.stringify({ route: null }), '*');
      `);
    }
  };

  const renderTaskCard = ({ item }: { item: Order }) => (
    <OrderCard
      order={item}
      onAccept={handleAccept}
      onDecline={handleDecline}
      onCall={handleCall}
      onMessage={handleMessage}
      onNavigate={handleNavigate}
      style={{
        width: Dimensions.get('window').width * 0.9,
        marginHorizontal: Theme.spacing.xs,
      }}
    />
  );

  const onMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.status === 'mapLoaded') {
        console.log('Map loaded successfully');
      }
    } catch (e) {
      console.error('Error parsing WebView message:', e);
    }
  };

  return (
    <View style={styles.container}>
      {/* Map Section */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHtml }}
          style={styles.map}
          onMessage={onMessage}
          originWhitelist={['*']}
        />
        {navigatingOrderId && (
          <TouchableOpacity
            style={styles.stopButton}
            onPress={handleStopNavigation}
          >
            <X size={Theme.layout.iconSize.sm} color={Theme.colors.white} />
            <Text style={styles.stopButtonText}>Arrêter la navigation</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Scrollable Cards Section (hidden during navigation) */}
      {!navigatingOrderId && (
        <View style={styles.cardsContainer}>
          <Text style={styles.sectionTitle}>Delivery Tasks</Text>
          <FlatList
            data={orders}
            renderItem={renderTaskCard}
            keyExtractor={(item: Order) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
            snapToAlignment="center"
            snapToInterval={
              Dimensions.get('window').width * 0.9 + Theme.spacing.xs * 2
            }
            scrollEventThrottle={16}
          />
        </View>
      )}
    </View>
  );
};

export default Map;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.neutral[50],
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  mapContainer: {
    width: '100%',
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    width: Dimensions.get('window').width,
    height: '100%',
  },
  cardsContainer: {
    paddingVertical: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    ...createTextStyle('lg', 'bold', Theme.colors.neutral[900]),
    marginLeft: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  flatListContent: {
    paddingHorizontal: Theme.spacing.xs,
  },
  stopButton: {
    position: 'absolute',
    bottom: Theme.spacing.lg,
    right: Theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.error[500],
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.xs,
  },
  stopButtonText: {
    ...createTextStyle('sm', 'semibold', Theme.colors.white),
  },
});
