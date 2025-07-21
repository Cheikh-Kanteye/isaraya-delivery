import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Package,
  Clock,
  MapPin,
  Star,
  Phone,
  MessageCircle,
  CheckCircle,
} from 'lucide-react-native';
import { Theme, createCardStyle, createTextStyle } from '@/constants/theme';
// No direct use of useAuth or authService in this file, but keeping the import style consistent
// import { useAuth } from '@/contexts/AuthContext';
// import { authService } from '@/services/authService';

export default function ClientOrdersScreen() {
  const formatCurrency = (amount: number) => {
    return (
      new Intl.NumberFormat('fr-FR', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount) + ' FCFA'
    );
  };

  const mockOrders = [
    {
      id: '1',
      status: 'in_progress',
      driverName: 'Marc Dubois',
      driverImage:
        'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
      driverRating: 4.9,
      pickupAddress: '15 Avenue Cheikh Anta Diop, Dakar',
      deliveryAddress: '8 Rue de la Paix, Plateau, Dakar',
      estimatedTime: '15 min',
      amount: 8500,
      tip: 1000,
      createdAt: 'Il y a 10 minutes',
    },
    {
      id: '2',
      status: 'delivered',
      driverName: 'Fatou Diop',
      driverImage:
        'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150',
      driverRating: 4.8,
      pickupAddress: 'Marché Sandaga, Dakar',
      deliveryAddress: '15 Avenue Cheikh Anta Diop, Dakar',
      estimatedTime: 'Livré',
      amount: 6500,
      tip: 500,
      createdAt: 'Il y a 2 jours',
    },
    {
      id: '3',
      status: 'delivered',
      driverName: 'Ibrahima Fall',
      driverImage:
        'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150',
      driverRating: 4.7,
      pickupAddress: 'Restaurant Teranga, Plateau',
      deliveryAddress: '15 Avenue Cheikh Anta Diop, Dakar',
      estimatedTime: 'Livré',
      amount: 12000,
      tip: 2000,
      createdAt: 'Il y a 1 semaine',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return Theme.colors.primary[500];
      case 'delivered':
        return Theme.colors.success[500];
      default:
        return Theme.colors.neutral[500];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'En cours';
      case 'delivered':
        return 'Livré';
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Commandes</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {mockOrders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
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
                  <Text style={styles.orderTime}>{order.createdAt}</Text>
                </View>
              </View>
            </View>

            {/* Driver Info */}
            <View style={styles.driverSection}>
              <Image
                source={{ uri: order.driverImage }}
                style={styles.driverImage}
              />
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{order.driverName}</Text>
                <View style={styles.driverRating}>
                  <Star
                    size={Theme.layout.iconSize.xs}
                    color={Theme.colors.accent[500]}
                  />
                  <Text style={styles.ratingText}>{order.driverRating}</Text>
                </View>
                {order.status === 'in_progress' && (
                  <Text style={styles.estimatedTime}>
                    Arrivée: {order.estimatedTime}
                  </Text>
                )}
              </View>
              {order.status === 'in_progress' && (
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
                    {order.deliveryAddress}
                  </Text>
                </View>
              </View>
            </View>

            {/* Order Summary */}
            <View style={styles.summarySection}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Montant de la livraison</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(order.amount)}
                </Text>
              </View>
              {order.tip > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Pourboire</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(order.tip)}
                  </Text>
                </View>
              )}
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total payé</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(order.amount + order.tip)}
                </Text>
              </View>
            </View>

            {/* Actions */}
            {order.status === 'delivered' && (
              <View style={styles.actionsSection}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Recommander</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Noter le livreur</Text>
                </TouchableOpacity>
              </View>
            )}

            {order.status === 'in_progress' && (
              <View style={styles.trackingSection}>
                <TouchableOpacity style={styles.trackButton}>
                  <MapPin
                    size={Theme.layout.iconSize.sm}
                    color={Theme.colors.white}
                  />
                  <Text style={styles.trackButtonText}>
                    Suivre en temps réel
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {mockOrders.length === 0 && (
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
});


