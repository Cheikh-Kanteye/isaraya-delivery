import { apiClient } from '@/lib/apiClient';
import {
  Mission,
  CreateMissionDto,
  AcceptMissionDto,
  UpdateMissionStatusDto,
  UpdateMissionPositionDto,
} from '@/types/api';

export const deliveryService = {

  async createMission(missionData: CreateMissionDto): Promise<Mission> {
    return apiClient.post<Mission>('/delivery/missions', missionData);
  },

  async getMissionById(id: string): Promise<Mission> {
    return apiClient.get<Mission>(`/delivery/missions/${id}`);
  },

  async getClientMissions(): Promise<Mission[]> {
    return apiClient.get<Mission[]>('/delivery/client/missions');
  },

  async getDelivererMissions(): Promise<Mission[]> {
    return apiClient.get<Mission[]>('/delivery/livreur/missions');
  },

  async getPendingMissions(): Promise<Mission[]> {
    return apiClient.get<Mission[]>('/delivery/missions/pending');
  },

  async acceptMission(acceptData: AcceptMissionDto): Promise<void> {
    return apiClient.post<void>('/delivery/missions/accept', acceptData);
  },

  async updateMissionStatus(updateData: UpdateMissionStatusDto): Promise<void> {
    return apiClient.put<void>('/delivery/missions/status', updateData);
  },

  async updateMissionPosition(
    id: string,
    position: UpdateMissionPositionDto
  ): Promise<void> {
    return apiClient.put<void>(`/delivery/missions/${id}/position`, position);
  },
};
