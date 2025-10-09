import { apiClient } from '@/lib/apiClient';
import { Order, CreateOrderDto } from '@/types/api';

interface UpdateOrderStatusDto {
  orderId: string;
  status: string;
}

export const orderService = {

  async createOrder(orderData: CreateOrderDto): Promise<Order> {
    return apiClient.post<Order>('/orders', orderData);
  },

  async getAllOrders(): Promise<Order[]> {
    return apiClient.get<Order[]>('/orders');
  },

  async getOrdersByClient(clientId: string): Promise<Order[]> {
    return apiClient.get<Order[]>(`/orders/client/${clientId}`);
  },

  async getMerchantOrders(): Promise<Order[]> {
    return apiClient.get<Order[]>('/orders/merchant');
  },

  async getOrderById(id: string): Promise<Order> {
    return apiClient.get<Order>(`/orders/${id}`);
  },

  async updateOrderStatus(updateData: UpdateOrderStatusDto): Promise<void> {
    return apiClient.put<void>('/orders/status', updateData);
  },
};
