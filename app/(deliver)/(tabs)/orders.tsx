import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Filter, Package } from 'lucide-react-native';
import { Theme, createTextStyle } from '@/constants/theme';
import OrderCard from '@/components/orders/OrderCard';
import { useDeliveryOrders } from '@/hooks/useDeliveryOrders';
import { useAuth } from '@/contexts/AuthContext';
import { Deliver } from '@/types/auth';

const Orders = () => {
  const { entity: deliver } = useAuth<Deliver>();
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'available' | 'active'
  >('all');

  const {
    allOrders,
    availableOrders,
    activeOrders,
    isLoading,
    refreshOrders,
    acceptOrder,
    declineOrder,
  } = useDeliveryOrders();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshOrders();
    setRefreshing(false);
  };

  const filteredOrders =
    selectedFilter === 'all'
      ? allOrders
      : selectedFilter === 'available'
      ? availableOrders
      : activeOrders;

  const handleAcceptOrder = async (orderId: string) => {
    if (!deliver?.id) return;
    try {
      await acceptOrder(orderId, deliver.id);
    } catch (error) {
      console.error('Failed to accept order:', error);
    }
  };

  const handleDeclineOrder = async (orderId: string) => {
    try {
      await declineOrder(orderId);
    } catch (error) {
      console.error('Failed to decline order:', error);
    }
  };

  const handleCall = (orderId: string) => {
    console.log('Call customer:', orderId);
  };

  const handleMessage = (orderId: string) => {
    console.log('Message customer:', orderId);
  };

  const handleNavigate = (orderId: string) => {
    console.log('Navigate to:', orderId);
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
            Toutes ({allOrders.length})
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
            Disponibles ({availableOrders.length})
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
            En cours ({activeOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary[500]} />
          <Text style={styles.loadingText}>Chargement des commandes...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Theme.colors.primary[500]]}
              tintColor={Theme.colors.primary[500]}
            />
          }
        >
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
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
                  : selectedFilter === 'active'
                  ? 'Aucune commande en cours'
                  : 'Aucune commande trouvée'}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    ...createTextStyle('base', 'normal', Theme.colors.neutral[500]),
    marginTop: Theme.spacing.md,
  },
});


