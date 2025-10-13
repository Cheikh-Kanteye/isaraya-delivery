import { API_URL, STORAGE_KEYS } from '@/constants';
import { DeliveryRequest, DeliveryResponse } from '@/types/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for delivery endpoints
interface ApiResponse<T> {
  status: string;
  message: string;
  payload: T;
}

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

interface RecentStat {
  id: string;
  date: string;
  amount: number;
  deliveries: number;
  hours: string;
}

interface Goal {
  current: number;
  target: number;
  percentage: number;
}

export interface DelivererStats {
  total: number;
  deliveries: number;
  hours: string;
  average: number;
  recent: RecentStat[];
  goal: Goal;
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

  async createDeliveryRequest(deliveryRequestData: {
    pickupAddress: string;
    pickupLatitude: number;
    pickupLongitude: number;
    destinationAddress: string;
    destinationLatitude: number;
    destinationLongitude: number;
    deliveryType: 'STANDARD' | 'EXPRESS';
  }): Promise<any> {
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

  async getMissionById(id: string): Promise<ApiResponse<DeliveryRequest>> {
    try {
      console.log('getMissionById called with id:', id, 'type:', typeof id);
      const headers = await this.getHeaders();

      const url = `${API_URL}/delivery/missions/${id}`;
      console.log('Fetching mission from URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const mission = await response.json();
      return mission;
    } catch (error) {
      console.error('Erreur dans getMissionById:', error);
      throw error;
    }
  },

  async getClientMissions(): Promise<ApiResponse<DeliveryRequest[]>> {
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
      return missions;
    } catch (error) {
      console.error('Erreur dans getClientMissions:', error);
      throw error;
    }
  },

  async getDelivererMissions(): Promise<ApiResponse<DeliveryRequest[]>> {
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
      return missions;
    } catch (error) {
      console.error('Erreur dans getDelivererMissions:', error);
      throw error;
    }
  },

  async getPendingMissions(): Promise<ApiResponse<DeliveryRequest[]>> {
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
      return missions;
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

      console.log("Update mission finished:", await response.json())
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

  async getDelivererStats(): Promise<ApiResponse<DelivererStats>> {
    try {
      const headers = await this.getHeaders();
      const url = `${API_URL}/delivery/livreur/stats`;
      console.log(url);

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur dans getDelivererStats:', error);
      throw error;
    }
  },
};
