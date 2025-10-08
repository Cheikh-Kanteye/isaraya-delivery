import { useState, useEffect, useCallback } from 'react';
import { deliveryService } from '@/services/deliveryService';
import { DeliveryRequest } from '@/types/client';

interface UseDeliveryOrdersReturn {
  allOrders: DeliveryRequest[];
  availableOrders: DeliveryRequest[];
  activeOrders: DeliveryRequest[];
  isLoading: boolean;
  error: string | null;
  refreshOrders: () => Promise<void>;
  acceptOrder: (missionId: string, livreurId: string) => Promise<void>;
  declineOrder: (missionId: string) => Promise<void>;
  updateOrderStatus: (missionId: string, status: string) => Promise<void>;
}

export const useDeliveryOrders = (): UseDeliveryOrdersReturn => {
  const [allOrders, setAllOrders] = useState<DeliveryRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [delivererMissions, pendingMissions] = await Promise.all([
        deliveryService.getDelivererMissions(),
        deliveryService.getPendingMissions(),
      ]);

      const allFetchedOrders = [...delivererMissions, ...pendingMissions];

      const uniqueOrders = allFetchedOrders.filter(
        (order, index, self) =>
          index === self.findIndex((o) => o.id === order.id)
      );

      setAllOrders(uniqueOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const availableOrders = allOrders.filter(
    (order) => order.status === 'PENDING' || order.status === 'pending'
  );

  const activeOrders = allOrders.filter(
    (order) =>
      order.status === 'ACCEPTED' ||
      order.status === 'IN_PROGRESS' ||
      order.status === 'PICKED_UP' ||
      order.status === 'accepted' ||
      order.status === 'in_progress' ||
      order.status === 'picked_up'
  );

  const acceptOrder = async (missionId: string, livreurId: string) => {
    try {
      await deliveryService.acceptMission({ missionId, livreurId });

      setAllOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === missionId ? { ...order, status: 'ACCEPTED' } : order
        )
      );
    } catch (err) {
      console.error('Error accepting order:', err);
      throw err;
    }
  };

  const declineOrder = async (missionId: string) => {
    try {
      setAllOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== missionId)
      );
    } catch (err) {
      console.error('Error declining order:', err);
      throw err;
    }
  };

  const updateOrderStatus = async (missionId: string, status: string) => {
    try {
      await deliveryService.updateMissionStatus({ missionId, status });

      setAllOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === missionId ? { ...order, status } : order
        )
      );
    } catch (err) {
      console.error('Error updating order status:', err);
      throw err;
    }
  };

  return {
    allOrders,
    availableOrders,
    activeOrders,
    isLoading,
    error,
    refreshOrders: fetchOrders,
    acceptOrder,
    declineOrder,
    updateOrderStatus,
  };
};
