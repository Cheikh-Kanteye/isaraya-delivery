import { API_URL, STORAGE_KEYS } from '@/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for order endpoints
interface CreateOrderDto {
  clientId: string;
  total: number;
  user: {
    phone_number: string;
    first_name: string;
    last_name: string;
  };
  currency: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: {
    street: string;
    city: string;
    postcode: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  paymentMethod: string;
  items: {
    produitId: string;
    quantity: number;
    price: number;
  }[];
}

interface UpdateOrderStatusDto {
  orderId: string;
  status: string;
}

interface Order {
  id: string;
  clientId: string;
  total: number;
  status: string;
  createdAt: string;
  // Add other order properties as needed
}

// Service pour gérer les commandes
export const orderService = {
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

  async createOrder(orderData: CreateOrderDto): Promise<Order> {
    try {
      const headers = await this.getHeaders();

      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        let errorMessage = 'Échec de la création de la commande';

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Erreur HTTP ${response.status}: ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      const createdOrder = await response.json();
      return createdOrder.payload?.data || createdOrder.data || createdOrder;
    } catch (error) {
      console.error('Erreur dans createOrder:', error);
      throw error;
    }
  },

  async getAllOrders(): Promise<Order[]> {
    try {
      const headers = await this.getHeaders();

      const response = await fetch(`${API_URL}/orders`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const orders = await response.json();
      return orders.payload?.data || orders.data || orders;
    } catch (error) {
      console.error('Erreur dans getAllOrders:', error);
      throw error;
    }
  },

  async getOrdersByClient(clientId: string): Promise<Order[]> {
    try {
      const headers = await this.getHeaders();

      const response = await fetch(`${API_URL}/orders/client/${clientId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const orders = await response.json();
      return orders.payload?.data || orders.data || orders;
    } catch (error) {
      console.error('Erreur dans getOrdersByClient:', error);
      throw error;
    }
  },

  async getMerchantOrders(): Promise<Order[]> {
    try {
      const headers = await this.getHeaders();

      const response = await fetch(`${API_URL}/orders/merchant`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const orders = await response.json();
      return orders.payload?.data || orders.data || orders;
    } catch (error) {
      console.error('Erreur dans getMerchantOrders:', error);
      throw error;
    }
  },

  async getOrderById(id: string): Promise<Order> {
    try {
      const headers = await this.getHeaders();

      const response = await fetch(`${API_URL}/orders/${id}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const order = await response.json();
      return order.payload?.data || order.data || order;
    } catch (error) {
      console.error('Erreur dans getOrderById:', error);
      throw error;
    }
  },

  async updateOrderStatus(updateData: UpdateOrderStatusDto): Promise<void> {
    try {
      const headers = await this.getHeaders();

      const response = await fetch(`${API_URL}/orders/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        let errorMessage = 'Échec de la mise à jour du statut de la commande';

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Erreur HTTP ${response.status}: ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Erreur dans updateOrderStatus:', error);
      throw error;
    }
  },
};
