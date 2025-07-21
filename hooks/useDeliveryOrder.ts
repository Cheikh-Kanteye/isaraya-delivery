import { useState, useRef } from 'react';
import { Alert } from 'react-native';
import { DeliveryRequest, Payment } from '@/types/client';
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
      const deliveryRequestData: Omit<
        DeliveryRequest,
        | 'id'
        | 'status'
        | 'createdAt'
        | 'deliveryFee'
        | 'estimatedDuration'
        | 'distance'
      > = {
        clientId: client.id,
        pickupAddress,
        pickupLatitude: pickupCoordinates.lat,
        pickupLongitude: pickupCoordinates.lng,
        destinationAddress: deliveryAddress,
        destinationLatitude: deliveryCoordinates.lat,
        destinationLongitude: deliveryCoordinates.lng,
        description,
        urgency,
        deliveryType,
      };

      const createdDeliveryRequest =
        await deliveryService.createDeliveryRequest(deliveryRequestData);
      setDeliveryRequest(createdDeliveryRequest);

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
      const paymentData: Omit<Payment, 'id' | 'status' | 'createdAt'> = {
        deliveryId: deliveryRequest.id,
        clientId: client!.id,
        amount: deliveryRequest.deliveryFee,
        method: paymentMethod,
        tip: 0,
      };
      await paymentService.processPayment(paymentData);
      Alert.alert(
        'Paiement confirmé !',
        'Votre paiement a été traité avec succès. Un livreur vous sera assigné sous peu.',
        [{ text: 'OK', onPress: onSuccess }]
      );
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
