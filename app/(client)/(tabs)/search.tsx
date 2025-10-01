import 'react-native-get-random-values';
import { useState, useEffect } from 'react';
import {
  StatusBar,
  ScrollView,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Theme } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Client } from '@/types/auth';
import Header from '@/components/client/Header';
import { DeliveryDetails } from '@/components/client/DeliveryDetails';
import { PaymentConfirmation } from '@/components/client/PaymentConfirmation';
import { Footer } from '@/components/client/Footer';
import { useDeliveryOrder } from '@/hooks/useDeliveryOrder';
import { styles } from '@/components/client/styles';
import { useUserLocation } from '@/hooks/useUserLocation';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateOrderScreen() {
  const { entity: client } = useAuth<Client>();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [addressType, setAddressType] = useState<'pickup' | 'delivery' | null>(
    null
  );
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

  // Gestion des erreurs de géolocalisation
  useEffect(() => {
    if (locationError) {
      Alert.alert('Erreur de localisation', locationError, [
        { text: 'OK', style: 'cancel' },
        { text: 'Paramètres', onPress: () => Linking.openSettings() },
      ]);
    }
  }, [locationError]);

  const handleBack = () => {
    if (step === 1) router.back();
    else setStep(1);
  };

  const handleUseMyLocation = async (type: 'pickup' | 'delivery') => {
    setAddressType(type);

    if (!location) {
      Alert.alert(
        'Localisation en cours',
        'Nous détectons votre position... Veuillez patienter quelques secondes.',
        [{ text: 'OK' }]
      );
      return;
    }

    const addressText = `Ma position actuelle`;

    if (type === 'pickup') {
      setPickupAddress(addressText);
      setPickupCoordinates(location);
      pickupAutocompleteRef.current?.setAddressText(addressText);
    } else {
      setDeliveryAddress(addressText);
      setDeliveryCoordinates(location);
      deliveryAutocompleteRef.current?.setAddressText(addressText);
    }

    // Feedback visuel pendant 2 secondes
    setTimeout(() => setAddressType(null), 2000);
  };

  const validateStep1 = async () => {
    // Validation des adresses
    if (!pickupAddress || !deliveryAddress) {
      Alert.alert(
        'Adresses requises',
        'Veuillez spécifier une adresse de départ et une adresse de livraison.',
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

    // Validation des coordonnées
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

  const renderContent = () => (
    <>
      {step === 1 && (
        <DeliveryDetails
          pickupAddress={pickupAddress}
          setPickupAddress={setPickupAddress}
          deliveryAddress={deliveryAddress}
          setDeliveryAddress={setDeliveryAddress}
          description={description}
          setDescription={setDescription}
          urgency={urgency}
          setUrgency={setUrgency}
          pickupAutocompleteRef={pickupAutocompleteRef as never}
          deliveryAutocompleteRef={deliveryAutocompleteRef as never}
          onUseMyLocation={handleUseMyLocation}
          addressType={addressType}
        />
      )}
      {step === 2 && deliveryRequest && (
        <PaymentConfirmation
          deliveryRequest={deliveryRequest}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          formatCurrency={formatCurrency}
        />
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        barStyle="light-content"
        backgroundColor={Theme.colors.primary[600]}
      />
      <Header step={step} onBack={handleBack} />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderContent()}
        </ScrollView>
      </KeyboardAvoidingView>
      <Footer
        step={step}
        isLoading={isLoading}
        onCreateDelivery={validateStep1}
        onProcessPayment={() =>
          processPayment(() => router.push('/(client)/(tabs)/orders'))
        }
        onBack={() => setStep(1)}
      />
    </SafeAreaView>
  );
}
