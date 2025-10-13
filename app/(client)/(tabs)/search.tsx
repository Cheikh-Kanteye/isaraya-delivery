import 'react-native-get-random-values';
import { useState, useEffect } from 'react';
import {
  StatusBar,
  ScrollView,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Theme } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Client } from '@/types/auth';
import { useDeliveryOrder } from '@/hooks/useDeliveryOrder';
import { useUserLocation } from '@/hooks/useUserLocation';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import AddressAutocomplete from '@/components/client/AddressAutocomplete';
import { reverseGeocode } from '@/utils/geocoding';

export default function CreateOrderScreen() {
  const { entity: client } = useAuth<Client>();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const progressAnim = useState(new Animated.Value(0.5))[0];

  const {
    pickupAddress,
    setPickupAddress,
    deliveryAddress,
    setDeliveryAddress,
    description,
    setDescription,
    urgency,
    setUrgency,
    paymentMethod,
    setPaymentMethod,
    setDeliveryType,
    pickupCoordinates,
    setPickupCoordinates,
    deliveryCoordinates,
    setDeliveryCoordinates,
    deliveryRequest,
    isLoading,
    handleCreateDelivery,
    processPayment,
    pickupAutocompleteRef,
    deliveryAutocompleteRef,
    formatCurrency,
  } = useDeliveryOrder(client as Client);

  const { location, error: locationError } = useUserLocation();

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: step === 1 ? 0.5 : 1,
      useNativeDriver: false,
    }).start();
  }, [step, progressAnim]);

  useEffect(() => {
    setDeliveryType(urgency === 'urgent' ? 'EXPRESS' : 'STANDARD');
  }, [urgency, setDeliveryType]);

  useEffect(() => {
    if (locationError) {
      Alert.alert('Erreur de localisation', locationError, [
        { text: 'OK', style: 'cancel' },
        { text: 'Paramètres', onPress: () => Linking.openSettings() },
      ]);
    }
  }, [locationError]);

  const handleUseMyLocation = async (type: 'pickup' | 'delivery') => {
    if (!location) {
      Alert.alert(
        'Localisation en cours',
        'Nous détectons votre position... Veuillez patienter quelques secondes.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Afficher un indicateur de chargement temporaire
      const loadingText = 'Récupération de l\'adresse...';
      
      if (type === 'pickup') {
        setPickupAddress(loadingText);
        pickupAutocompleteRef.current?.setAddressText(loadingText);
      } else {
        setDeliveryAddress(loadingText);
        deliveryAutocompleteRef.current?.setAddressText(loadingText);
      }

      // Convertir les coordonnées en adresse réelle
      const address = await reverseGeocode(location);

      if (type === 'pickup') {
        setPickupAddress(address);
        setPickupCoordinates(location);
        pickupAutocompleteRef.current?.setAddressText(address);
      } else {
        setDeliveryAddress(address);
        setDeliveryCoordinates(location);
        deliveryAutocompleteRef.current?.setAddressText(address);
      }

      console.log(`Adresse géocodée (${type}):`, address);
    } catch (error) {
      console.error('Erreur lors du géocodage:', error);
      Alert.alert(
        'Erreur',
        'Impossible de récupérer l\'adresse. Veuillez saisir manuellement.',
        [{ text: 'OK' }]
      );
    }
  };

  const validateStep1 = async () => {
    if (!pickupAddress || !deliveryAddress) {
      Alert.alert(
        'Adresses requises',
        'Veuillez spécifier une adresse de départ et une adresse de livraison.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Vérifier que les adresses ne sont pas en cours de chargement
    if (
      pickupAddress.includes('Récupération de l\'adresse') ||
      deliveryAddress.includes('Récupération de l\'adresse')
    ) {
      Alert.alert(
        'Veuillez patienter',
        'Récupération des adresses en cours...',
        [{ text: 'OK' }]
      );
      return;
    }

    if (pickupAddress === deliveryAddress) {
      Alert.alert(
        'Adresses identiques',
        'Les adresses de départ et de livraison doivent être différentes.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!pickupCoordinates || !deliveryCoordinates) {
      Alert.alert(
        'Localisation requise',
        'Veuillez sélectionner des adresses valides avec des coordonnées GPS.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      await handleCreateDelivery(() => setStep(2));
    } catch (error) {
      Alert.alert(
        'Erreur',
        error instanceof Error
          ? error.message
          : 'Impossible de créer la livraison. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    }
  };

  const paymentMethods = [
    { id: 'orange_money', name: 'Orange Money', color: '#FF6B00' },
    { id: 'wave', name: 'Wave', color: '#6366F1' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        barStyle="light-content"
        backgroundColor={Theme.colors.primary[600]}
      />

      {/* Header with Progress */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nouvelle commande</Text>

        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        <View style={styles.stepIndicator}>
          <View
            style={[styles.stepCircle, step >= 1 && styles.stepCircleActive]}
          >
            <Icon
              name="map-pin"
              size={16}
              color={step >= 1 ? Theme.colors.white : Theme.colors.neutral[400]}
            />
          </View>
          <View style={styles.stepLine} />
          <View
            style={[styles.stepCircle, step >= 2 && styles.stepCircleActive]}
          >
            <Icon
              name="credit-card"
              size={16}
              color={step >= 2 ? Theme.colors.white : Theme.colors.neutral[400]}
            />
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 1 ? (
            <>
              {/* Addresses Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon
                    name="map-pin"
                    size={20}
                    color={Theme.colors.primary[500]}
                  />
                  <Text style={styles.sectionTitle}>Itinéraire</Text>
                </View>

                <View style={styles.card}>
                  {/* Pickup Address */}
                  <View style={styles.addressRow}>
                    <View style={styles.addressDotContainer}>
                      <View
                        style={[
                          styles.addressDot,
                          { backgroundColor: Theme.colors.primary[500] },
                        ]}
                      />
                    </View>
                    <View style={styles.addressContent}>
                      <View style={styles.addressLabelRow}>
                        <Text style={styles.addressLabel}>Point de départ</Text>
                        <TouchableOpacity
                          onPress={() => handleUseMyLocation('pickup')}
                          style={styles.locationButton}
                          activeOpacity={0.7}
                        >
                          <Icon
                            name="navigation"
                            size={14}
                            color={Theme.colors.primary[500]}
                          />
                          <Text style={styles.locationButtonText}>
                            Ma position
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <AddressAutocomplete
                        ref={pickupAutocompleteRef as never}
                        placeholder="Où récupérer le colis ?"
                        value={pickupAddress}
                        onAddressSelect={(address, coords) => {
                          setPickupAddress(address);
                          setPickupCoordinates(coords);
                        }}
                        iconColor={Theme.colors.primary[500]}
                      />
                    </View>
                  </View>

                  <View style={styles.routeLine} />

                  {/* Delivery Address */}
                  <View style={styles.addressRow}>
                    <View style={styles.addressDotContainer}>
                      <View
                        style={[
                          styles.addressDot,
                          { backgroundColor: Theme.colors.secondary[500] },
                        ]}
                      />
                    </View>
                    <View style={styles.addressContent}>
                      <View style={styles.addressLabelRow}>
                        <Text style={styles.addressLabel}>Destination</Text>
                        <TouchableOpacity
                          onPress={() => handleUseMyLocation('delivery')}
                          style={styles.locationButton}
                          activeOpacity={0.7}
                        >
                          <Icon
                            name="navigation"
                            size={14}
                            color={Theme.colors.secondary[500]}
                          />
                          <Text style={styles.locationButtonText}>
                            Ma position
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <AddressAutocomplete
                        ref={deliveryAutocompleteRef as never}
                        placeholder="Où livrer le colis ?"
                        value={deliveryAddress}
                        onAddressSelect={(address, coords) => {
                          setDeliveryAddress(address);
                          setDeliveryCoordinates(coords);
                        }}
                        iconColor={Theme.colors.secondary[500]}
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* Package Details */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon
                    name="package"
                    size={20}
                    color={Theme.colors.accent[500]}
                  />
                  <Text style={styles.sectionTitle}>Détails du colis</Text>
                </View>

                <View style={styles.card}>
                  <Text style={styles.inputLabel}>Description (optionnel)</Text>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Ex: Colis alimentaire fragile, Documents importants..."
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={3}
                    placeholderTextColor={Theme.colors.neutral[400]}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* Delivery Type */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon
                    name="clock"
                    size={20}
                    color={Theme.colors.accent[500]}
                  />
                  <Text style={styles.sectionTitle}>Type de livraison</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.deliveryOption,
                    urgency === 'normal' && styles.deliveryOptionSelected,
                  ]}
                  onPress={() => setUrgency('normal')}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.deliveryOptionIcon,
                      urgency === 'normal' && styles.deliveryOptionIconSelected,
                    ]}
                  >
                    <Icon
                      name="clock"
                      size={24}
                      color={
                        urgency === 'normal'
                          ? Theme.colors.white
                          : Theme.colors.secondary[500]
                      }
                    />
                  </View>
                  <View style={styles.deliveryOptionContent}>
                    <View style={styles.deliveryOptionHeader}>
                      <Text
                        style={[
                          styles.deliveryOptionTitle,
                          urgency === 'normal' &&
                            styles.deliveryOptionTitleSelected,
                        ]}
                      >
                        Standard
                      </Text>
                      {urgency === 'normal' && (
                        <Icon
                          name="check-circle"
                          size={20}
                          color={Theme.colors.white}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.deliveryOptionText,
                        urgency === 'normal' &&
                          styles.deliveryOptionTextSelected,
                      ]}
                    >
                      24-48h • Prix normal
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.deliveryOption,
                    urgency === 'urgent' && styles.deliveryOptionSelected,
                  ]}
                  onPress={() => setUrgency('urgent')}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.deliveryOptionIcon,
                      urgency === 'urgent' && styles.deliveryOptionIconSelected,
                    ]}
                  >
                    <Icon
                      name="zap"
                      size={24}
                      color={
                        urgency === 'urgent'
                          ? Theme.colors.white
                          : Theme.colors.accent[500]
                      }
                    />
                  </View>
                  <View style={styles.deliveryOptionContent}>
                    <View style={styles.deliveryOptionHeader}>
                      <Text
                        style={[
                          styles.deliveryOptionTitle,
                          urgency === 'urgent' &&
                            styles.deliveryOptionTitleSelected,
                        ]}
                      >
                        Express
                      </Text>
                      {urgency === 'urgent' && (
                        <Icon
                          name="check-circle"
                          size={20}
                          color={Theme.colors.white}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.deliveryOptionText,
                        urgency === 'urgent' &&
                          styles.deliveryOptionTextSelected,
                      ]}
                    >
                      2-4h • Majoration +50%
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            deliveryRequest && (
              <>
                {/* Order Summary */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Icon
                      name="package"
                      size={20}
                      color={Theme.colors.primary[500]}
                    />
                    <Text style={styles.sectionTitle}>Récapitulatif</Text>
                  </View>

                  <View style={styles.card}>
                    {/* Route Summary */}
                    <View style={styles.summaryRoute}>
                      <View style={styles.summaryRouteItem}>
                        <View
                          style={[
                            styles.summaryDot,
                            { backgroundColor: Theme.colors.primary[500] },
                          ]}
                        />
                        <View style={styles.summaryRouteText}>
                          <Text style={styles.summaryLabel}>Départ</Text>
                          <Text style={styles.summaryValue} numberOfLines={2}>
                            {deliveryRequest.pickupAddress}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.summaryRouteLine} />

                      <View style={styles.summaryRouteItem}>
                        <View
                          style={[
                            styles.summaryDot,
                            { backgroundColor: Theme.colors.secondary[500] },
                          ]}
                        />
                        <View style={styles.summaryRouteText}>
                          <Text style={styles.summaryLabel}>Arrivée</Text>
                          <Text style={styles.summaryValue} numberOfLines={2}>
                            {deliveryRequest.destinationAddress}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.summaryDivider} />

                    {/* Details */}
                    <View style={styles.summaryDetails}>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Distance</Text>
                        <Text style={styles.summaryValue}>
                          {deliveryRequest.distance} km
                        </Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Durée estimée</Text>
                        <Text style={styles.summaryValue}>
                          {deliveryRequest.estimatedDuration} min
                        </Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Type</Text>
                        <View
                          style={[
                            styles.summaryBadge,
                            {
                              backgroundColor:
                                deliveryRequest.deliveryType === 'EXPRESS'
                                  ? Theme.colors.accent[500]
                                  : Theme.colors.secondary[500],
                            },
                          ]}
                        >
                          <Text style={styles.summaryBadgeText}>
                            {deliveryRequest.deliveryType === 'EXPRESS'
                              ? 'Express'
                              : 'Standard'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.summaryTotal}>
                      <Text style={styles.totalLabel}>Total à payer</Text>
                      <Text style={styles.totalAmount}>
                        {formatCurrency(deliveryRequest.deliveryFee)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Payment Method */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Icon
                      name="credit-card"
                      size={20}
                      color={Theme.colors.accent[500]}
                    />
                    <Text style={styles.sectionTitle}>Paiement</Text>
                  </View>

                  <View style={styles.paymentMethods}>
                    {paymentMethods.map((method) => (
                      <TouchableOpacity
                        key={method.id}
                        style={[
                          styles.paymentMethod,
                          paymentMethod === method.id &&
                            styles.paymentMethodSelected,
                        ]}
                        onPress={() => setPaymentMethod(method.id as any)}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.paymentIcon,
                            { backgroundColor: method.color + '20' },
                          ]}
                        >
                          <Icon
                            name="credit-card"
                            size={20}
                            color={method.color}
                          />
                        </View>
                        <Text style={styles.paymentMethodName}>
                          {method.name}
                        </Text>
                        <View
                          style={[
                            styles.radioButton,
                            paymentMethod === method.id &&
                              styles.radioButtonSelected,
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
              </>
            )
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          {step === 2 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStep(1)}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>Retour</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.primaryButton, step === 2 && { flex: 1 }]}
            onPress={() =>
              step === 1
                ? validateStep1()
                : processPayment(() => router.push('/(client)/(tabs)/orders'))
            }
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={Theme.colors.white} />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>
                  {step === 1
                    ? 'Continuer'
                    : deliveryRequest && deliveryRequest.deliveryFee
                    ? `Payer ${formatCurrency(deliveryRequest.deliveryFee)}`
                    : 'Payer'}
                </Text>
                <Icon
                  name="chevron-right"
                  size={20}
                  color={Theme.colors.white}
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.neutral[50],
  },
  header: {
    backgroundColor: Theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[200],
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Theme.colors.neutral[900],
    marginBottom: 16,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: Theme.colors.neutral[200],
    borderRadius: 9999,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Theme.colors.primary[500],
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: Theme.colors.primary[500],
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: Theme.colors.neutral[200],
    marginHorizontal: 8,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    backgroundColor: Theme.colors.white,
    padding: 16,
    borderRadius: 16,
    ...Theme.shadows.sm,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '500',
    color: Theme.colors.neutral[700],
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.neutral[800],
  },
  card: {
    backgroundColor: Theme.colors.white,
    borderRadius: 16,
    padding: 20,
    ...Theme.shadows.sm,
  },
  addressRow: {
    flexDirection: 'row',
    gap: 12,
  },
  addressDotContainer: {
    paddingTop: 8,
  },
  addressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  addressContent: {
    flex: 1,
  },
  addressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors.neutral[700],
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  locationButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Theme.colors.neutral[600],
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: Theme.colors.neutral[200],
    marginLeft: 5,
    marginTop: 4,
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors.neutral[700],
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: Theme.colors.neutral[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[200],
    padding: 12,
    fontSize: 15,
    color: Theme.colors.neutral[800],
    minHeight: 100,
  },
  deliveryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: Theme.colors.white,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Theme.colors.neutral[200],
    marginTop: 12,
    ...Theme.shadows.sm,
  },
  deliveryOptionSelected: {
    backgroundColor: Theme.colors.primary[500],
    borderColor: Theme.colors.primary[500],
  },
  deliveryOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.neutral[50],
  },
  deliveryOptionIconSelected: {
    backgroundColor: 'transparent',
  },
  deliveryOptionContent: {
    flex: 1,
  },
  deliveryOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  deliveryOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.neutral[800],
  },
  deliveryOptionTitleSelected: {
    color: Theme.colors.white,
  },
  deliveryOptionText: {
    fontSize: 13,
    color: Theme.colors.neutral[500],
  },
  deliveryOptionTextSelected: {
    color: Theme.colors.white,
  },
  summaryRoute: {
    gap: 12,
  },
  summaryRouteItem: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: 2,
  },
  summaryRouteText: {
    flex: 1,
    gap: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: Theme.colors.neutral[500],
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 15,
    color: Theme.colors.neutral[800],
    fontWeight: '500',
  },
  summaryRouteLine: {
    width: 2,
    height: 20,
    backgroundColor: Theme.colors.neutral[200],
    marginLeft: 7,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Theme.colors.neutral[200],
    marginVertical: 20,
  },
  summaryDetails: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 9999,
  },
  summaryBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.white,
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: Theme.colors.neutral[100],
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.neutral[700],
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: Theme.colors.primary[500],
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Theme.colors.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Theme.colors.neutral[200],
    ...Theme.shadows.sm,
  },
  paymentMethodSelected: {
    borderColor: Theme.colors.primary[500],
    backgroundColor: Theme.colors.primary[50],
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentMethodName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.neutral[800],
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Theme.colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: Theme.colors.primary[500],
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Theme.colors.primary[500],
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.neutral[200],
    paddingHorizontal: 20,
    paddingVertical: 16,
    ...Theme.shadows.lg,
  },
  footerContent: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: Theme.colors.neutral[100],
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.neutral[700],
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: Theme.colors.primary[500],
    borderRadius: 12,
    ...Theme.shadows.md,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.white,
  },
});
