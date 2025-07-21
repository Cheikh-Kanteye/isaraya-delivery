import { API_URL } from '@/constants';
import { Payment } from '@/types/client';

// Service pour gérer les paiements
export const paymentService = {
  async processPayment(
    paymentData: Omit<Payment, 'id' | 'status' | 'createdAt'>
  ): Promise<void> {
    try {
      // Simulation d'un appel API au backend
      // Dans une implémentation réelle, cela serait un fetch ou axios vers l'endpoint du backend
      const response = await fetch(`${API_URL}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error('Échec du traitement du paiement');
      }
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Erreur lors du traitement du paiement'
      );
    }
  },
};
