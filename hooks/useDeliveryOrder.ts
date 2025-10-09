import { useState, useRef } from 'react';
import { Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { DeliveryRequest } from '@/types/client';
import { Client } from '@/types/auth';
import { deliveryService } from '@/services/deliveryService';
import { paymentService } from '@/services/paiementService';
import { AddressAutocompleteRef } from '@/components/client/AddressAutocomplete';

export function useDeliveryOrder(client: Client | undefined) {
  const [pickupAddress, setPickupAddress] = useState(
    client?.defaultAddress || ''
  );
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>('normal');
  const [deliveryType, setDeliveryType] = useState<'STANDARD' | 'EXPRESS'>(
    'STANDARD'
  );
  const [paymentMethod, setPaymentMethod] = useState<
    'orange_money' | 'free_money' | 'wave'
  >('orange_money');
  const [pickupCoordinates, setPickupCoordinates] = useState({
    lat: 14.6937,
    lng: -17.4441,
  });
  const [deliveryCoordinates, setDeliveryCoordinates] = useState({
    lat: 14.6892,
    lng: -17.4409,
  });
  const [deliveryRequest, setDeliveryRequest] =
    useState<DeliveryRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const pickupAutocompleteRef = useRef<AddressAutocompleteRef>(null);
  const deliveryAutocompleteRef = useRef<AddressAutocompleteRef>(null);

  const formatCurrency = (amount: number) => {
    return (
      new Intl.NumberFormat('fr-FR', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount) + ' FCFA'
    );
  };

  const handleCreateDelivery = async (onSuccess: () => void) => {
    if (!client || !pickupAddress || !deliveryAddress) {
      Alert.alert(
        'Erreur',
        'Veuillez remplir toutes les informations nécessaires.'
      );
      return;
    }

    try {
      setIsLoading(true);
      const deliveryRequestData = {
        pickupAddress,
        pickupLatitude: pickupCoordinates.lat,
        pickupLongitude: pickupCoordinates.lng,
        destinationAddress: deliveryAddress,
        destinationLatitude: deliveryCoordinates.lat,
        destinationLongitude: deliveryCoordinates.lng,
        deliveryType,
      };

      const createdDeliveryRequest =
        await deliveryService.createDeliveryRequest(deliveryRequestData);
      setDeliveryRequest(createdDeliveryRequest.payload);

      console.log('Demande de livraison créée:', createdDeliveryRequest);

      onSuccess();
    } catch (error) {
      Alert.alert(
        'Erreur',
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue lors de la création de la commande.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const processPayment = async (onSuccess: () => void) => {
    if (!deliveryRequest) {
      Alert.alert('Erreur', 'Aucune demande de livraison disponible.');
      return;
    }

    try {
      setIsLoading(true);
      const paymentData = {
        orderId: deliveryRequest.id,
        item_price: deliveryRequest.deliveryFee,
        command_name: 'Commande Isaraya',
        currency: 'XOF',
        target_payment:
          paymentMethod === 'orange_money' ? 'Orange Money' : 'Wave',
        custom_field: {},
        user: {
          phone_number: client!.phoneNumber,
          first_name: client!.firstName,
          last_name: client!.lastName,
        },
        origin: 'MARKETPLACE',
      };
      const result = await paymentService.initiatePayment(paymentData);
      await WebBrowser.openBrowserAsync(result.redirectUrl);
      onSuccess();
    } catch (error) {
      Alert.alert(
        'Erreur de paiement',
        error instanceof Error ? error.message : 'Le paiement a échoué.',
        [
          { text: 'Réessayer', onPress: () => processPayment(onSuccess) },
          { text: 'Annuler', style: 'cancel', onPress: onSuccess },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
    deliveryType,
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
  };
}
