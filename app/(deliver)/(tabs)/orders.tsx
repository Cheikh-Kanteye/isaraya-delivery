import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Filter, Package } from 'lucide-react-native';
import { Theme, createTextStyle } from '@/constants/theme';
import { orders as ConstantOrders } from '@/constants/orders';
import OrderCard from '@/components/orders/OrderCard';
// No direct use of useAuth or authService in this file, but keeping the import style consistent
// import { useAuth } from '@/contexts/AuthContext';
// import { authService } from '@/services/authService';

const Orders = () => {
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'available' | 'active'
  >('all');

  const [orders, setOrders] = useState(ConstantOrders);

  const filteredOrders = orders.filter((order) => {
    if (selectedFilter === 'available') return order.status === 'available';
    if (selectedFilter === 'active')
      return ['accepted', 'picked_up'].includes(order.status);
    return true;
  });

  const handleAcceptOrder = (orderId: string) => {
    console.log('Accept order:', orderId);
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        return order.id === orderId ? { ...order, status: 'accepted' } : order;
      })
    );
  };

  const handleDeclineOrder = (orderId: string) => {
    console.log('Decline order:', orderId);
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        return order.id === orderId ? { ...order, status: 'rejected' } : order;
      })
    );
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
                : 'Aucune commande en cours'}
            </Text>
          </View>
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
});


