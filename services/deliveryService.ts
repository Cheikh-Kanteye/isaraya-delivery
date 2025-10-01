import { API_URL, STORAGE_KEYS } from '@/constants';
import { DeliveryRequest } from '@/types/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for delivery endpoints
interface AcceptMissionDto {
  missionId: string;
  livreurId: string;
}

interface UpdateStatusDto {
  missionId: string;
  status: string;
}

interface PositionDto {
  latitude: number;
  longitude: number;
}

// Service pour gérer les requêtes de livraison
export const deliveryService = {
  // Helper method to get headers with auth token
  async getHeaders(): Promise<{ [key: string]: string }> {
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
    };

    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  },

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
      const headers = await this.getHeaders();

      const response = await fetch(`${API_URL}/delivery/missions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(deliveryRequestData),
      });

      if (!response.ok) {
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
      return (
        createdDeliveryRequest.payload?.data ||
        createdDeliveryRequest.data ||
        createdDeliveryRequest
      );
    } catch (error) {
      console.error('Erreur dans createDeliveryRequest:', error);
      throw error;
    }
  },

  async getMissionById(id: string): Promise<DeliveryRequest> {
    try {
      const headers = await this.getHeaders();

      const response = await fetch(`${API_URL}/delivery/missions/${id}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const mission = await response.json();
      return mission.payload?.data || mission.data || mission;
    } catch (error) {
      console.error('Erreur dans getMissionById:', error);
      throw error;
    }
  },

  async getClientMissions(): Promise<DeliveryRequest[]> {
    try {
      const headers = await this.getHeaders();

      const response = await fetch(`${API_URL}/delivery/client/missions`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const missions = await response.json();
      return missions.payload?.data || missions.data || missions;
    } catch (error) {
      console.error('Erreur dans getClientMissions:', error);
      throw error;
    }
  },

  async getDelivererMissions(): Promise<DeliveryRequest[]> {
    try {
      const headers = await this.getHeaders();

      const response = await fetch(`${API_URL}/delivery/livreur/missions`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const missions = await response.json();
      return missions.payload?.data || missions.data || missions;
    } catch (error) {
      console.error('Erreur dans getDelivererMissions:', error);
      throw error;
    }
  },

  async getPendingMissions(): Promise<DeliveryRequest[]> {
    try {
      const headers = await this.getHeaders();

      const response = await fetch(`${API_URL}/delivery/missions/pending`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const missions = await response.json();
      return missions.payload?.data || missions.data || missions;
    } catch (error) {
      console.error('Erreur dans getPendingMissions:', error);
      throw error;
    }
  },

  async acceptMission(acceptData: AcceptMissionDto): Promise<void> {
    try {
      const headers = await this.getHeaders();

      const response = await fetch(`${API_URL}/delivery/missions/accept`, {
        method: 'POST',
        headers,
        body: JSON.stringify(acceptData),
      });

      if (!response.ok) {
        let errorMessage = "Échec de l'acceptation de la mission";

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Erreur HTTP ${response.status}: ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Erreur dans acceptMission:', error);
      throw error;
    }
  },

  async updateMissionStatus(updateData: UpdateStatusDto): Promise<void> {
    try {
      const headers = await this.getHeaders();

      const response = await fetch(`${API_URL}/delivery/missions/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        let errorMessage = 'Échec de la mise à jour du statut';

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Erreur HTTP ${response.status}: ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Erreur dans updateMissionStatus:', error);
      throw error;
    }
  },

  async updateMissionPosition(
    id: string,
    position: PositionDto
  ): Promise<void> {
    try {
      const headers = await this.getHeaders();

      const response = await fetch(
        `${API_URL}/delivery/missions/${id}/position`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify(position),
        }
      );

      if (!response.ok) {
        let errorMessage = 'Échec de la mise à jour de la position';

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Erreur HTTP ${response.status}: ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Erreur dans updateMissionPosition:', error);
      throw error;
    }
  },
};
