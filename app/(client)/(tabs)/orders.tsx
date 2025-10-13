import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Package,
  MapPin,
  Star,
  Phone,
  MessageCircle,
  RefreshCw,
  Zap,
  Truck,
  ChevronRight,
} from 'lucide-react-native';
import { Theme, createCardStyle, createTextStyle } from '@/constants/theme';
import { deliveryService } from '@/services/deliveryService';
import { DeliveryRequest } from '@/types/client';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';

type DeliveryFilter = 'ALL' | 'EXPRESS' | 'STANDARD';

export default function ClientOrdersScreen() {
  const params = useLocalSearchParams<{ filter?: string }>();
  const router = useRouter();
  const [orders, setOrders] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  const formatCurrency = (amount: number) => {
    return (
      new Intl.NumberFormat('fr-FR', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount) + ' FCFA'
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInMinutes < 60) {
        return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
      } else if (diffInHours < 24) {
        return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
      } else {
        return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
      }
    } catch {
      return 'Date inconnue';
    }
  };

  const fetchOrders = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Use the correct endpoint and DTO from API_ENDPOINTS.md
      const clientMissions = await deliveryService.getClientMissions();
      
      // Gérer le cas où payload est null, undefined, ou un tableau
      if (clientMissions?.payload && Array.isArray(clientMissions.payload)) {
        setOrders(clientMissions.payload);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      Alert.alert(
        'Erreur',
        'Impossible de charger vos commandes. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Rafraîchir les données quand l'écran devient actif
  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const handleRefresh = () => {
    fetchOrders(true);
  };

  const handleOrderPress = (missionId: string) => {
    console.log('Navigating to mission:', missionId);
    router.push(`/(client)/order-tracking/${missionId}` as any);
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'IN_PROGRESS':
        return Theme.colors.primary[500];
      case 'DELIVERED':
        return Theme.colors.success[500];
      case 'PENDING':
        return Theme.colors.neutral[500];
      case 'ACCEPTED':
        return Theme.colors.accent[500];
      case 'CANCELLED':
        return Theme.colors.error[500];
      default:
        return Theme.colors.neutral[500];
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case 'IN_PROGRESS':
        return 'En cours';
      case 'DELIVERED':
        return 'Livré';
      case 'PENDING':
        return 'En attente';
      case 'ACCEPTED':
        return 'Accepté';
      case 'CANCELLED':
        return 'Annulé';
      default:
        return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SUCCESSFUL':
        return Theme.colors.success[500];
      case 'PENDING':
        return Theme.colors.warning[500];
      case 'FAILED':
        return Theme.colors.error[500];
      case 'CANCELLED':
        return Theme.colors.neutral[500];
      default:
        return Theme.colors.neutral[500];
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SUCCESSFUL':
        return 'Payé';
      case 'PENDING':
        return 'Paiement en attente';
      case 'FAILED':
        return 'Paiement échoué';
      case 'CANCELLED':
        return 'Paiement annulé';
      default:
        return status;
    }
  };

  // Filtrer les commandes selon le filtre actif
  const filteredOrders = orders.filter((order) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'EXPRESS') return order.deliveryType === 'EXPRESS';
    if (activeFilter === 'STANDARD') return order.deliveryType === 'STANDARD';
    return true;
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mes Commandes</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary[500]} />
          <Text style={styles.loadingText}>Chargement de vos commandes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Mes Commandes</Text>
          <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
            <RefreshCw
              size={Theme.layout.iconSize.md}
              color={
                refreshing
                  ? Theme.colors.neutral[400]
                  : Theme.colors.primary[500]
              }
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filtres de type de livraison */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'ALL' && styles.filterButtonActive,
          ]}
          onPress={() => setActiveFilter('ALL')}
        >
          <Text
            style={[
              styles.filterButtonText,
              activeFilter === 'ALL' && styles.filterButtonTextActive,
            ]}
          >
            Tous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'EXPRESS' && styles.filterButtonActive,
          ]}
          onPress={() => setActiveFilter('EXPRESS')}
        >
          <Zap
            size={16}
            color={
              activeFilter === 'EXPRESS'
                ? Theme.colors.white
                : Theme.colors.primary[600]
            }
          />
          <Text
            style={[
              styles.filterButtonText,
              activeFilter === 'EXPRESS' && styles.filterButtonTextActive,
            ]}
          >
            Express
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'STANDARD' && styles.filterButtonActive,
          ]}
          onPress={() => setActiveFilter('STANDARD')}
        >
          <Truck
            size={16}
            color={
              activeFilter === 'STANDARD'
                ? Theme.colors.white
                : Theme.colors.secondary[600]
            }
          />
          <Text
            style={[
              styles.filterButtonText,
              activeFilter === 'STANDARD' && styles.filterButtonTextActive,
            ]}
          >
            Standard
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {filteredOrders.map((order) => (
          <TouchableOpacity
            key={order.id}
            style={styles.orderCard}
            onPress={() => handleOrderPress(order.id)}
            activeOpacity={0.7}
          >
            {/* Order Header */}
            <View style={styles.orderHeader}>
              <View style={styles.orderInfo}>
                <View style={styles.statusContainer}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(order.status) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(order.status) },
                      ]}
                    >
                      {getStatusText(order.status)}
                    </Text>
                  </View>
                  <Text style={styles.orderTime}>
                    {formatDate(order.createdAt)}
                  </Text>
                </View>
                {/* Badge de type de livraison */}
                <View style={styles.deliveryTypeContainer}>
                  <View
                    style={[
                      styles.deliveryTypeBadge,
                      {
                        backgroundColor:
                          order.deliveryType === 'EXPRESS'
                            ? Theme.colors.primary[100]
                            : Theme.colors.secondary[100],
                      },
                    ]}
                  >
                    {order.deliveryType === 'EXPRESS' ? (
                      <Zap size={12} color={Theme.colors.primary[600]} />
                    ) : (
                      <Truck size={12} color={Theme.colors.secondary[600]} />
                    )}
                    <Text
                      style={[
                        styles.deliveryTypeText,
                        {
                          color:
                            order.deliveryType === 'EXPRESS'
                              ? Theme.colors.primary[600]
                              : Theme.colors.secondary[600],
                        },
                      ]}
                    >
                      {order.deliveryType === 'EXPRESS' ? 'Express' : 'Standard'}
                    </Text>
                  </View>
                </View>
                <View style={styles.paymentStatusContainer}>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          getPaymentStatusColor(order.paymentStatus) + '20',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getPaymentStatusColor(order.paymentStatus) },
                      ]}
                    >
                      {getPaymentStatusText(order.paymentStatus)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Driver Info - Only show if assigned */}
            {order.livreurId && (
              <View style={styles.driverSection}>
                <Image
                  source={{
                    uri: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
                  }}
                  style={styles.driverImage}
                />
                <View style={styles.driverInfo}>
                  <Text style={styles.driverName}>Livreur assigné</Text>
                  <View style={styles.driverRating}>
                    <Star
                      size={Theme.layout.iconSize.xs}
                      color={Theme.colors.accent[500]}
                    />
                    <Text style={styles.ratingText}>4.5</Text>
                  </View>
                  {order.status === 'IN_PROGRESS' && (
                    <Text style={styles.estimatedTime}>
                      Temps estimé: {order.estimatedDuration || '15 min'}
                    </Text>
                  )}
                </View>
                {order.status === 'IN_PROGRESS' && (
                  <View style={styles.contactButtons}>
                    <TouchableOpacity style={styles.contactButton}>
                      <Phone
                        size={Theme.layout.iconSize.xs}
                        color={Theme.colors.secondary[500]}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.contactButton}>
                      <MessageCircle
                        size={Theme.layout.iconSize.xs}
                        color={Theme.colors.secondary[500]}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* Addresses */}
            <View style={styles.addressesSection}>
              <View style={styles.addressItem}>
                <View style={styles.addressIcon}>
                  <MapPin
                    size={Theme.layout.iconSize.xs}
                    color={Theme.colors.primary[500]}
                  />
                </View>
                <View style={styles.addressInfo}>
                  <Text style={styles.addressLabel}>Récupération</Text>
                  <Text style={styles.addressText}>{order.pickupAddress}</Text>
                </View>
              </View>

              <View style={styles.addressConnector} />

              <View style={styles.addressItem}>
                <View style={styles.addressIcon}>
                  <MapPin
                    size={Theme.layout.iconSize.xs}
                    color={Theme.colors.secondary[500]}
                  />
                </View>
                <View style={styles.addressInfo}>
                  <Text style={styles.addressLabel}>Livraison</Text>
                  <Text style={styles.addressText}>
                    {order.destinationAddress}
                  </Text>
                </View>
              </View>
            </View>

            {/* Order Summary */}
            <View style={styles.summarySection}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Montant de la livraison</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(order.deliveryFee || 0)}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(order.deliveryFee || 0)}
                </Text>
              </View>
            </View>

            {/* Actions */}
            {order.status === 'DELIVERED' && (
              <View style={styles.actionsSection}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Recommander</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Noter le livreur</Text>
                </TouchableOpacity>
              </View>
            )}

            {order.status === 'IN_PROGRESS' && (
              <View style={styles.trackingSection}>
                <View style={styles.trackButton}>
                  <MapPin
                    size={Theme.layout.iconSize.sm}
                    color={Theme.colors.white}
                  />
                  <Text style={styles.trackButtonText}>
                    Suivre en temps réel
                  </Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {filteredOrders.length === 0 && !loading && orders.length > 0 && (
          <View style={styles.emptyState}>
            <Package size={48} color={Theme.colors.neutral[300]} />
            <Text style={styles.emptyStateTitle}>Aucune commande {activeFilter === 'EXPRESS' ? 'Express' : 'Standard'}</Text>
            <Text style={styles.emptyStateText}>
              Vous n&apos;avez pas encore de commande de ce type
            </Text>
          </View>
        )}

        {orders.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Package size={48} color={Theme.colors.neutral[300]} />
            <Text style={styles.emptyStateTitle}>Aucune commande</Text>
            <Text style={styles.emptyStateText}>
              Vous n&apos;avez pas encore passé de commande
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.neutral[50],
  },
  header: {
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.lg,
    backgroundColor: Theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[200],
  },
  headerTitle: {
    ...createTextStyle('2xl', 'bold', Theme.colors.neutral[900]),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...createTextStyle('base', 'normal', Theme.colors.neutral[500]),
    marginTop: Theme.spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  orderCard: {
    ...createCardStyle('md'),
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.lg,
  },
  orderHeader: {
    marginBottom: Theme.spacing.lg,
  },
  orderInfo: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.md,
  },
  statusText: {
    ...createTextStyle('xs', 'medium'),
  },
  orderTime: {
    ...createTextStyle('sm', 'normal', Theme.colors.neutral[500]),
  },
  paymentStatusContainer: {
    marginTop: Theme.spacing.sm,
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  driverImage: {
    width: 50,
    height: 50,
    borderRadius: Theme.borderRadius.full,
    marginRight: Theme.spacing.md,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    ...createTextStyle('base', 'semibold', Theme.colors.neutral[900]),
    marginBottom: Theme.spacing.xs,
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    marginBottom: Theme.spacing.xs,
  },
  ratingText: {
    ...createTextStyle('sm', 'medium', Theme.colors.accent[500]),
  },
  estimatedTime: {
    ...createTextStyle('sm', 'normal', Theme.colors.primary[500]),
  },
  contactButtons: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  contactButton: {
    width: 36,
    height: 36,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.secondary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressesSection: {
    marginBottom: Theme.spacing.lg,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressIcon: {
    width: 24,
    height: 24,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.sm,
    marginTop: 2,
  },
  addressInfo: {
    flex: 1,
    marginBottom: Theme.spacing.md,
  },
  addressLabel: {
    ...createTextStyle('xs', 'medium', Theme.colors.neutral[500]),
    marginBottom: Theme.spacing.xs,
  },
  addressText: {
    ...createTextStyle('sm', 'normal', Theme.colors.neutral[700]),
  },
  addressConnector: {
    width: 2,
    height: 16,
    backgroundColor: Theme.colors.neutral[200],
    marginLeft: 11,
    marginBottom: Theme.spacing.sm,
  },
  summarySection: {
    borderTopWidth: 1,
    borderTopColor: Theme.colors.neutral[200],
    paddingTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.sm,
  },
  summaryLabel: {
    ...createTextStyle('sm', 'normal', Theme.colors.neutral[500]),
  },
  summaryValue: {
    ...createTextStyle('sm', 'medium', Theme.colors.neutral[900]),
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Theme.colors.neutral[200],
    paddingTop: Theme.spacing.sm,
    marginTop: Theme.spacing.sm,
  },
  totalLabel: {
    ...createTextStyle('base', 'semibold', Theme.colors.neutral[900]),
  },
  totalValue: {
    ...createTextStyle('base', 'bold', Theme.colors.primary[500]),
  },
  actionsSection: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    backgroundColor: Theme.colors.neutral[100],
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
  },
  actionButtonText: {
    ...createTextStyle('sm', 'medium', Theme.colors.neutral[700]),
  },
  trackingSection: {
    borderTopWidth: 1,
    borderTopColor: Theme.colors.neutral[200],
    paddingTop: Theme.spacing.lg,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.primary[500],
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    gap: Theme.spacing.sm,
  },
  trackButtonText: {
    ...createTextStyle('base', 'semibold', Theme.colors.white),
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
  filtersContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[200],
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.lg,
    backgroundColor: Theme.colors.neutral[100],
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterButtonActive: {
    backgroundColor: Theme.colors.primary[500],
    borderColor: Theme.colors.primary[600],
  },
  filterButtonText: {
    ...createTextStyle('sm', 'medium', Theme.colors.neutral[700]),
  },
  filterButtonTextActive: {
    color: Theme.colors.white,
  },
  deliveryTypeContainer: {
    marginTop: Theme.spacing.sm,
  },
  deliveryTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.md,
    alignSelf: 'flex-start',
  },
  deliveryTypeText: {
    ...createTextStyle('xs', 'semibold'),
  },
});
