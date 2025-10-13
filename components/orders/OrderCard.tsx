import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Alert,
  Linking,
} from 'react-native';
import {
  MapPin,
  Package,
  Navigation,
  Clock,
  DollarSign,
  Phone,
  MessageCircle,
  Circle as XCircle,
  CircleCheck as CheckCircle,
} from 'lucide-react-native';
import { Order } from '@/types/orders';
import { Theme, createCardStyle, createTextStyle } from '@/constants/theme';
import { formatCurrency, getStatusColor, getStatusText } from '@/utils/orders';

interface OrderCardProps {
  order: Order;
  onAccept?: (orderId: string) => void;
  onDecline?: (orderId: string) => void;
  onCall?: (orderId: string) => void;
  onMessage?: (orderId: string) => void;
  onNavigate?: (orderId: string) => void;
  style?: ViewStyle;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onAccept,
  onDecline,
  onCall,
  onMessage,
  onNavigate,
  style,
}) => {
  return (
    <View style={[styles.orderCard, style]}>
      {/* Order Header */}
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.restaurantName}>{order.restaurant}</Text>
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
            {order.urgent && (
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentText}>URGENT</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Customer Info */}
      <View style={styles.customerInfo}>
        <MapPin
          size={Theme.layout.iconSize.xs}
          color={Theme.colors.neutral[500]}
        />
        <View style={styles.customerDetails}>
          <Text style={styles.customerName}>{order.customer}</Text>
          <Text style={styles.customerAddress}>{order.address}</Text>
        </View>
      </View>

      {/* Order Details */}
      <View style={styles.orderDetails}>
        <View style={styles.detailItem}>
          <Package
            size={Theme.layout.iconSize.xs}
            color={Theme.colors.neutral[500]}
          />
          <Text style={styles.detailText}>{order.items} articles</Text>
        </View>
        <View style={styles.detailItem}>
          <Navigation
            size={Theme.layout.iconSize.xs}
            color={Theme.colors.neutral[500]}
          />
          <Text style={styles.detailText}>{order.distance}</Text>
        </View>
        <View style={styles.detailItem}>
          <Clock
            size={Theme.layout.iconSize.xs}
            color={Theme.colors.neutral[500]}
          />
          <Text style={styles.detailText}>{order.time}</Text>
        </View>
        <View style={styles.detailItem}>
          <DollarSign
            size={Theme.layout.iconSize.xs}
            color={Theme.colors.primary[500]}
          />
          <Text style={[styles.detailText, styles.earningsText]}>
            {formatCurrency(order.earnings)}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {order.status === 'available' && (
          <View style={styles.availableActions}>
            <TouchableOpacity
              style={styles.declineButton}
              onPress={() => onDecline?.(order.id)}
            >
              <XCircle
                size={Theme.layout.iconSize.xs}
                color={Theme.colors.error[500]}
              />
              <Text style={styles.declineButtonText}>Refuser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => onAccept?.(order.id)}
            >
              <CheckCircle
                size={Theme.layout.iconSize.xs}
                color={Theme.colors.white}
              />
              <Text style={styles.acceptButtonText}>Accepter</Text>
            </TouchableOpacity>
          </View>
        )}
        {(order.status === 'accepted' || order.status === 'picked_up') && (
          <View style={styles.activeActions}>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => {
                if (order.phone) {
                  Linking.openURL(`tel:${order.phone}`);
                } else {
                  Alert.alert(
                    'Appel client',
                    'Le numéro de téléphone du client n\'est pas disponible.',
                    [{ text: 'OK' }]
                  );
                }
              }}
            >
              <Phone
                size={Theme.layout.iconSize.xs}
                color={Theme.colors.secondary[500]}
              />
              <Text style={styles.contactButtonText}>Appeler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => {
                Alert.alert(
                  'Message client',
                  'Les informations de contact du client ne sont pas disponibles pour le moment.',
                  [{ text: 'OK' }]
                );
              }}
            >
              <MessageCircle
                size={Theme.layout.iconSize.xs}
                color={Theme.colors.secondary[500]}
              />
              <Text style={styles.contactButtonText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navigateButton}
              onPress={() => onNavigate?.(order.id)}
            >
              <Navigation
                size={Theme.layout.iconSize.xs}
                color={Theme.colors.primary[500]}
              />
              <Text style={styles.navigateButtonText}>Naviguer</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default OrderCard;

const styles = StyleSheet.create({
  orderCard: {
    ...createCardStyle('md'),
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.lg,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.md,
  },
  orderInfo: {
    flex: 1,
  },
  restaurantName: {
    ...createTextStyle('lg', 'semibold', Theme.colors.neutral[900]),
    marginBottom: Theme.spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.md,
  },
  statusText: {
    ...createTextStyle('xs', 'medium'),
  },
  urgentBadge: {
    backgroundColor: Theme.colors.error[100],
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.md,
  },
  urgentText: {
    ...createTextStyle('xs', 'semibold', Theme.colors.error[700]),
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    ...createTextStyle('base', 'medium', Theme.colors.neutral[700]),
    marginBottom: 2,
  },
  customerAddress: {
    ...createTextStyle('sm', 'normal', Theme.colors.neutral[500]),
  },
  orderDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  detailText: {
    ...createTextStyle('sm', 'normal', Theme.colors.neutral[500]),
  },
  earningsText: {
    color: Theme.colors.primary[500],
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  actions: {
    borderTopWidth: 1,
    borderTopColor: Theme.colors.neutral[200],
    paddingTop: Theme.spacing.lg,
  },
  availableActions: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  declineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.error[100],
    gap: Theme.spacing.xs,
  },
  declineButtonText: {
    ...createTextStyle('sm', 'semibold', Theme.colors.error[500]),
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.primary[500],
    gap: Theme.spacing.xs,
  },
  acceptButtonText: {
    ...createTextStyle('sm', 'semibold', Theme.colors.white),
  },
  activeActions: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.secondary[50],
    gap: Theme.spacing.xs,
  },
  contactButtonText: {
    ...createTextStyle('sm', 'semibold', Theme.colors.secondary[500]),
  },
  navigateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.primary[100],
    gap: Theme.spacing.xs,
  },
  navigateButtonText: {
    ...createTextStyle('sm', 'semibold', Theme.colors.primary[500]),
  },
});
