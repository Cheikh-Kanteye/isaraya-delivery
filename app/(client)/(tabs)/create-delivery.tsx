import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, Package, Zap, CreditCard, X } from 'lucide-react-native';
import { Theme } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { Client } from '@/types/auth';
import { AddressAutocomplete } from '@/components/client/AddressAutocomplete';
import { deliveryService } from '@/services/deliveryService';
import { paymentService } from '@/services/paiementService';
import { Coordinates } from '@/types/api';

export default function CreateDeliveryScreen() {
  const router = useRouter();
  const { entity: client } = useAuth<Client>();

  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupCoords, setPickupCoords] = useState<Coordinates | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCoords, setDeliveryCoords] = useState<Coordinates | null>(
    null
  );
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [paymentMethod, setPaymentMethod] = useState<
    'CARD' | 'CASH' | 'MOBILE_MONEY'
  >('MOBILE_MONEY');
  const [isLoading, setIsLoading] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState<number | null>(null);

  const pickupRef = useRef<any>(null);
  const deliveryRef = useRef<any>(null);

  const calculateDistance = (
    coord1: Coordinates,
    coord2: Coordinates
  ): number => {
    const R = 6371;
    const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coord1.latitude * Math.PI) / 180) *
        Math.cos((coord2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const calculateFee = () => {
    if (!pickupCoords || !deliveryCoords) return;

    const distance = calculateDistance(pickupCoords, deliveryCoords);
    let baseFee = 1500;

    if (urgency === 'HIGH') baseFee *= 1.5;
    else if (urgency === 'MEDIUM') baseFee *= 1.2;

    const distanceFee = Math.max(0, distance - 5) * 200;
    setEstimatedFee(Math.round(baseFee + distanceFee));
  };

  const handleSubmit = async () => {
    if (!pickupAddress || !deliveryAddress) {
      Alert.alert('Erreur', 'Veuillez renseigner les deux adresses');
      return;
    }

    if (!pickupCoords || !deliveryCoords) {
      Alert.alert('Erreur', 'Veuillez sélectionner des adresses valides');
      return;
    }

    if (pickupAddress === deliveryAddress) {
      Alert.alert(
        'Erreur',
        'Les adresses de départ et de livraison doivent être différentes'
      );
      return;
    }

    setIsLoading(true);

    try {
      const mission = await deliveryService.createMission({
        pickupLocation: {
          street: pickupAddress,
          city: 'Dakar',
          postcode: '00000',
          country: 'SN',
          latitude: pickupCoords.latitude,
          longitude: pickupCoords.longitude,
        },
        deliveryLocation: {
          street: deliveryAddress,
          city: 'Dakar',
          postcode: '00000',
          country: 'SN',
          latitude: deliveryCoords.latitude,
          longitude: deliveryCoords.longitude,
        },
        description,
        urgency,
      });

      if (paymentMethod !== 'CASH') {
        const paymentData = await paymentService.initiatePayment({
          orderId: mission.id,
          amount: mission.deliveryFee,
          currency: 'XOF',
          description: `Livraison #${mission.id.substring(0, 8)}`,
          customer: {
            name: client?.name || '',
            email: client?.email || '',
            phone: client?.phoneNumber || '',
          },
        });

        Alert.alert(
          'Paiement',
          'Vous allez être redirigé vers la page de paiement',
          [
            {
              text: 'OK',
              onPress: () => {
                router.push('/(client)/(tabs)/orders');
              },
            },
          ]
        );
      } else {
        Alert.alert('Succès', 'Votre mission a été créée avec succès', [
          { text: 'OK', onPress: () => router.push('/(client)/(tabs)/orders') },
        ]);
      }
    } catch (error) {
      Alert.alert(
        'Erreur',
        error instanceof Error ? error.message : 'Une erreur est survenue'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeButton}
          >
            <X size={24} color={Theme.colors.neutral[700]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nouvelle livraison</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color={Theme.colors.primary[600]} />
              <Text style={styles.sectionTitle}>Adresses</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Point de départ</Text>
              <AddressAutocomplete
                placeholder="D'où partez-vous ?"
                onAddressSelect={(address, coords) => {
                  setPickupAddress(address);
                  setPickupCoords(coords);
                }}
                ref={pickupRef}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Point d'arrivée</Text>
              <AddressAutocomplete
                placeholder="Où livrer ?"
                onAddressSelect={(address, coords) => {
                  setDeliveryAddress(address);
                  setDeliveryCoords(coords);
                }}
                ref={deliveryRef}
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Package size={20} color={Theme.colors.primary[600]} />
              <Text style={styles.sectionTitle}>Détails du colis</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (optionnel)</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Décrivez votre colis..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Zap size={20} color={Theme.colors.primary[600]} />
              <Text style={styles.sectionTitle}>Urgence</Text>
            </View>

            <View style={styles.urgencyOptions}>
              {[
                { value: 'LOW', label: 'Standard', desc: 'Dans la journée' },
                { value: 'MEDIUM', label: 'Rapide', desc: '1-2 heures' },
                { value: 'HIGH', label: 'Express', desc: '30 minutes' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.urgencyCard,
                    urgency === option.value && styles.urgencyCardActive,
                  ]}
                  onPress={() => {
                    setUrgency(option.value as typeof urgency);
                    calculateFee();
                  }}
                >
                  <Text
                    style={[
                      styles.urgencyLabel,
                      urgency === option.value && styles.urgencyLabelActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text
                    style={[
                      styles.urgencyDesc,
                      urgency === option.value && styles.urgencyDescActive,
                    ]}
                  >
                    {option.desc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CreditCard size={20} color={Theme.colors.primary[600]} />
              <Text style={styles.sectionTitle}>Paiement</Text>
            </View>

            <View style={styles.paymentOptions}>
              {[
                { value: 'MOBILE_MONEY', label: 'Mobile Money' },
                { value: 'CARD', label: 'Carte bancaire' },
                { value: 'CASH', label: 'Espèces' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.paymentCard,
                    paymentMethod === option.value && styles.paymentCardActive,
                  ]}
                  onPress={() =>
                    setPaymentMethod(option.value as typeof paymentMethod)
                  }
                >
                  <Text
                    style={[
                      styles.paymentLabel,
                      paymentMethod === option.value &&
                        styles.paymentLabelActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {estimatedFee && (
            <View style={styles.feeSection}>
              <Text style={styles.feeLabel}>Estimation</Text>
              <Text style={styles.feeAmount}>
                {estimatedFee.toLocaleString()} FCFA
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Theme.colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>Confirmer</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.neutral[50],
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[200],
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.neutral[900],
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: Theme.colors.white,
    marginBottom: 12,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.neutral[900],
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors.neutral[700],
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: Theme.colors.neutral[50],
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: Theme.colors.neutral[900],
    borderWidth: 1,
    borderColor: Theme.colors.neutral[200],
    minHeight: 80,
  },
  urgencyOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  urgencyCard: {
    flex: 1,
    backgroundColor: Theme.colors.neutral[50],
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: Theme.colors.neutral[200],
  },
  urgencyCardActive: {
    backgroundColor: Theme.colors.primary[50],
    borderColor: Theme.colors.primary[600],
  },
  urgencyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.neutral[700],
    marginBottom: 4,
  },
  urgencyLabelActive: {
    color: Theme.colors.primary[700],
  },
  urgencyDesc: {
    fontSize: 12,
    color: Theme.colors.neutral[500],
  },
  urgencyDescActive: {
    color: Theme.colors.primary[600],
  },
  paymentOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentCard: {
    flex: 1,
    backgroundColor: Theme.colors.neutral[50],
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Theme.colors.neutral[200],
    alignItems: 'center',
  },
  paymentCardActive: {
    backgroundColor: Theme.colors.primary[50],
    borderColor: Theme.colors.primary[600],
  },
  paymentLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.neutral[700],
    textAlign: 'center',
  },
  paymentLabelActive: {
    color: Theme.colors.primary[700],
  },
  feeSection: {
    backgroundColor: Theme.colors.primary[50],
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.primary[900],
  },
  feeAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: Theme.colors.primary[700],
  },
  footer: {
    padding: 20,
    backgroundColor: Theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.neutral[200],
  },
  submitButton: {
    backgroundColor: Theme.colors.primary[600],
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.white,
  },
});
