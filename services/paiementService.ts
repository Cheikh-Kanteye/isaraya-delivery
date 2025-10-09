import { API_URL, STORAGE_KEYS } from '@/constants';
import { Payment } from '@/types/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for payment endpoints
interface InitiatePaymentDto {
  orderId: string;
  item_price: number;
  command_name: string;
  currency: string;
  target_payment: string;
  custom_field: object;
  user: {
    phone_number: string;
    first_name: string;
    last_name: string;
  };
  origin: string;
}

interface PaymentStatus {
  status: string;
  redirectUrl?: string;
  token?: string;
}

interface ResumePaymentDto {
  ref: string;
}

// Service pour gérer les paiements
export const paymentService = {
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

  async initiatePayment(
    paymentData: InitiatePaymentDto
  ): Promise<{ redirectUrl: string; token?: string }> {
    try {
      const headers = await this.getHeaders();

      const response = await fetch(`${API_URL}/orders/initiate-payment`, {
        method: 'POST',
        headers,
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        let errorMessage = "Échec de l'initiation du paiement";

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Erreur HTTP ${response.status}: ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result.payload || result;
    } catch (error) {
      console.error('Erreur dans initiatePayment:', error);
      throw error;
    }
  },

  async getPaymentStatus(ref: string): Promise<PaymentStatus> {
    try {
      const headers = await this.getHeaders();

      const response = await fetch(`${API_URL}/orders/payment/status/${ref}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const status = await response.json();
      return status.payload?.data || status.data || status;
    } catch (error) {
      console.error('Erreur dans getPaymentStatus:', error);
      throw error;
    }
  },

  async resumePayment(
    resumeData: ResumePaymentDto
  ): Promise<{ redirectUrl: string }> {
    try {
      const headers = await this.getHeaders();

      const response = await fetch(`${API_URL}/orders/payment/resume`, {
        method: 'POST',
        headers,
        body: JSON.stringify(resumeData),
      });

      if (!response.ok) {
        let errorMessage = 'Échec de la reprise du paiement';

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Erreur HTTP ${response.status}: ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result.payload?.data || result.data || result;
    } catch (error) {
      console.error('Erreur dans resumePayment:', error);
      throw error;
    }
  },

  // Legacy method for backward compatibility - deprecated
  async processPayment(
    paymentData: Omit<Payment, 'id' | 'status' | 'createdAt'>
  ): Promise<void> {
    // This method is deprecated, use initiatePayment for order payments
    console.warn(
      'processPayment is deprecated, use initiatePayment for order payments instead'
    );
    throw new Error(
      'This method is deprecated. Use initiatePayment for order payments.'
    );
  },
};
