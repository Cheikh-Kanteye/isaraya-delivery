import { API_URL, STORAGE_KEYS } from '@/constants';
import { DeliveryRequest } from '@/types/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Service pour gérer les requêtes de livraison
export const deliveryService = {
  async createDeliveryRequest(
    deliveryRequestData: Omit<
      DeliveryRequest,
      | 'id'
      | 'status'
      | 'createdAt'
      | 'deliveryFee'
      | 'distance'
      | 'estimatedDuration'
    >
  ): Promise<DeliveryRequest> {
    try {
      const headers: { [key: string]: string } = {
        'Content-Type': 'application/json',
      };

      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/delivery/missions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(deliveryRequestData),
      });

      if (!response.ok) {
        // Meilleure gestion des erreurs HTTP
        let errorMessage = 'Échec de la création de la demande de livraison';

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Erreur HTTP ${response.status}: ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      const createdDeliveryRequest = await response.json();
      return createdDeliveryRequest.data;
    } catch (error) {
      console.error('Erreur dans createDeliveryRequest:', error);
      throw error; // Re-lancer l'erreur telle quelle
    }
  },
};
