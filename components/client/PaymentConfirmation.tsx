import { View, Text, TouchableOpacity } from 'react-native';
import { Package, CreditCard } from 'lucide-react-native';
import { Theme } from '@/constants/theme';
import { DeliveryRequest } from '@/types/client';
import { styles } from './styles';

type Props = {
  deliveryRequest: DeliveryRequest;
  paymentMethod: 'orange_money' | 'free_money' | 'wave';
  setPaymentMethod: (method: 'orange_money' | 'free_money' | 'wave') => void;
  formatCurrency: (amount: number) => string;
};

const paymentMethods = [
  { id: 'orange_money', name: 'Orange Money', color: '#FF6B00' },
  { id: 'free_money', name: 'Free Money', color: '#00B4D8' },
  { id: 'wave', name: 'Wave', color: '#6366F1' },
];

export function PaymentConfirmation({
  deliveryRequest: data,
  paymentMethod,
  setPaymentMethod,
  formatCurrency,
}: Props) {
  return (
    <View style={styles.content}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Package size={20} color={Theme.colors.primary[500]} />
          <Text style={styles.cardTitle}>Résumé de la commande</Text>
        </View>
        <View style={styles.summaryContent}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>De :</Text>
            <Text style={styles.summaryValue} numberOfLines={2}>
              {data.pickupAddress}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Vers :</Text>
            <Text style={styles.summaryValue} numberOfLines={2}>
              {data.destinationAddress}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Type :</Text>
            <Text style={styles.summaryValue}>
              {data.deliveryType === 'EXPRESS' ? 'Express' : 'Standard'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Distance :</Text>
            <Text style={styles.summaryValue}>{data.distance} km</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Durée estimée :</Text>
            <Text style={styles.summaryValue}>
              {data.estimatedDuration} min
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total :</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(data.deliveryFee)}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <CreditCard size={20} color={Theme.colors.accent[500]} />
          <Text style={styles.cardTitle}>Méthode de paiement</Text>
        </View>
        <View style={styles.paymentMethods}>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethod,
                paymentMethod === method.id && styles.paymentMethodSelected,
              ]}
              onPress={() => setPaymentMethod(method.id as any)}
            >
              <View
                style={[
                  styles.paymentIcon,
                  { backgroundColor: method.color + '20' },
                ]}
              >
                <CreditCard size={18} color={method.color} />
              </View>
              <Text style={styles.paymentMethodText}>{method.name}</Text>
              <View
                style={[
                  styles.radioButton,
                  paymentMethod === method.id && styles.radioButtonSelected,
                ]}
              >
                {paymentMethod === method.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}
