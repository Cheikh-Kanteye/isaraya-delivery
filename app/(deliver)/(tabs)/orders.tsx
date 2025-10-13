import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Filter, Package } from 'lucide-react-native';
import { Theme, createTextStyle } from '@/constants/theme';
import { deliveryService } from '@/services/deliveryService';
import { DeliveryRequest } from '@/types/client';
import { Order } from '@/types/orders';
import OrderCard from '@/components/orders/OrderCard';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

const Orders = () => {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'available' | 'active'
  >('all');

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
      try {
        const pendingResponse = await deliveryService.getPendingMissions();
        const assignedResponse = await deliveryService.getDelivererMissions();

        // Gérer le cas où payload est null ou undefined
        const pendingMissions = Array.isArray(pendingResponse.payload)
          ? pendingResponse.payload
          : [];
        const assignedMissions = Array.isArray(assignedResponse.payload)
          ? assignedResponse.payload
          : [];

        const mapMissionToOrder = (mission: DeliveryRequest): Order => {
          let status: Order['status'] = 'available';
          const missionStatus = mission.status as string;
          
          // PENDING = disponible pour tous les livreurs
          if (missionStatus === 'PENDING') {
            status = 'available';
          }
          // ASSIGNED = assigné à CE livreur (déjà accepté)
          else if (missionStatus === 'ASSIGNED') {
            status = 'accepted';
          }
          // ACCEPTED = accepté par CE livreur
          else if (missionStatus === 'ACCEPTED') {
            status = 'accepted';
          }
          // IN_PROGRESS = en cours de livraison
          else if (missionStatus === 'IN_PROGRESS') {
            status = 'picked_up';
          }
          // DELIVERED = livré
          else if (missionStatus === 'DELIVERED') {
            status = 'delivered';
          }

          return {
            id: mission.id,
            restaurant: mission.pickupAddress,
            customer: 'Client', // Placeholder, as API doesn't provide customer name
            address: mission.destinationAddress,
            items: 1, // Placeholder
            distance: mission.distance ? `${mission.distance} km` : 'N/A',
            time: mission.estimatedDuration
              ? `${mission.estimatedDuration} min`
              : 'N/A',
            earnings: mission.deliveryFee,
            status,
            urgent: mission.urgency === 'urgent',
            lat: mission.pickupLatitude,
            lng: mission.pickupLongitude,
          };
        };



        const pendingOrders = pendingMissions.map(mapMissionToOrder);
        const assignedOrders = assignedMissions.map(mapMissionToOrder);

        setOrders([...pendingOrders, ...assignedOrders]);
      } catch (error) {
        console.error('Error fetching orders:', error);
        // Handle error, maybe show a message
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchOrders();
    
    // Refresh automatique toutes les 30 secondes
    const interval = setInterval(fetchOrders, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Rafraîchir les données quand l'écran devient actif
  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const filteredOrders = orders.filter((order) => {
    if (selectedFilter === 'available') return order.status === 'available';
    if (selectedFilter === 'active')
      return ['accepted', 'picked_up'].includes(order.status);
    return true;
  });

  const handleAcceptOrder = async (orderId: string) => {
    try {
      console.log('Accept order:', orderId);
      
      // Appeler l'API pour accepter la mission
      await deliveryService.acceptMission({
        missionId: orderId,
        livreurId: 'current-user-id', // TODO: Récupérer l'ID du livreur depuis le contexte auth
      });
      
      // Mettre à jour l'état local
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          return order.id === orderId ? { ...order, status: 'accepted' } : order;
        })
      );
      
      // Rafraîchir la liste des commandes
      fetchOrders();
    } catch (error) {
      console.error('Error accepting order:', error);
      Alert.alert('Erreur', 'Impossible d\'accepter la commande');
    }
  };

  const handleDeclineOrder = (orderId: string) => {
    Alert.alert(
      'Refuser la commande',
      'Êtes-vous sûr de vouloir refuser cette commande ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Refuser',
          style: 'destructive',
          onPress: () => {
            setOrders((prevOrders) =>
              prevOrders.map((order) => {
                return order.id === orderId ? { ...order, status: 'rejected' } : order;
              })
            );
            // Rafraîchir la liste des commandes
            fetchOrders();
          },
        },
      ]
    );
  };

  const handleCall = (orderId: string) => {
    Alert.alert(
      'Appel client',
      'Les informations de contact du client ne sont pas disponibles pour le moment.',
      [{ text: 'OK' }]
    );
  };

  const handleMessage = (orderId: string) => {
    Alert.alert(
      'Message client',
      'Les informations de contact du client ne sont pas disponibles pour le moment.',
      [{ text: 'OK' }]
    );
  };

  const handleNavigate = (orderId: string) => {
    console.log('Navigate to:', orderId);
    router.push(`/(deliver)/navigation/${orderId}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Commandes</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter
            size={Theme.layout.iconSize.sm}
            color={Theme.colors.neutral[500]}
          />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            selectedFilter === 'all' && styles.activeFilterTab,
          ]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text
            style={[
              styles.filterTabText,
              selectedFilter === 'all' && styles.activeFilterTabText,
            ]}
          >
            Toutes ({orders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            selectedFilter === 'available' && styles.activeFilterTab,
          ]}
          onPress={() => setSelectedFilter('available')}
        >
          <Text
            style={[
              styles.filterTabText,
              selectedFilter === 'available' && styles.activeFilterTabText,
            ]}
            numberOfLines={1}
          >
            Disponibles ({orders.filter((o) => o.status === 'available').length}
            )
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            selectedFilter === 'active' && styles.activeFilterTab,
          ]}
          onPress={() => setSelectedFilter('active')}
        >
          <Text
            style={[
              styles.filterTabText,
              selectedFilter === 'active' && styles.activeFilterTabText,
            ]}
          >
            En cours (
            {
              orders.filter((o) => ['accepted', 'picked_up'].includes(o.status))
                .length
            }
            )
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingState}>
            <Text style={styles.loadingText}>Chargement des commandes...</Text>
          </View>
        ) : (
          <>
            {filteredOrders.map((order, index) => (
              <OrderCard
                key={`${order.id}-${index}`}
                order={order}
                onAccept={handleAcceptOrder}
                onDecline={handleDeclineOrder}
                onCall={handleCall}
                onMessage={handleMessage}
                onNavigate={handleNavigate}
              />
            ))}
            {filteredOrders.length === 0 && (
              <View style={styles.emptyState}>
                <Package size={48} color={Theme.colors.neutral[300]} />
                <Text style={styles.emptyStateTitle}>Aucune commande</Text>
                <Text style={styles.emptyStateText}>
                  {selectedFilter === 'available'
                    ? 'Aucune commande disponible pour le moment'
                    : 'Aucune commande en cours'}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Orders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.lg,
    backgroundColor: Theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[200],
  },
  headerTitle: {
    ...createTextStyle('2xl', 'bold', Theme.colors.neutral[900]),
  },
  filterButton: {
    padding: Theme.spacing.sm,
    backgroundColor: Theme.colors.neutral[100],
    borderRadius: Theme.borderRadius.md,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.white,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[200],
  },
  filterTab: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    marginRight: Theme.spacing.sm,
    alignItems: 'center',
  },
  activeFilterTab: {
    backgroundColor: Theme.colors.primary[500],
  },
  filterTabText: {
    ...createTextStyle('xs', 'normal', Theme.colors.neutral[500]),
  },
  activeFilterTabText: {
    color: Theme.colors.white,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    ...createTextStyle('lg', 'semibold', Theme.colors.neutral[700]),
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
  },
  emptyStateText: {
    ...createTextStyle('sm', 'normal', Theme.colors.neutral[500]),
    textAlign: 'center',
    paddingHorizontal: Theme.spacing['3xl'],
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    ...createTextStyle('base', 'normal', Theme.colors.neutral[600]),
  },
});
