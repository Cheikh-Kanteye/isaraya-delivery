import { apiClient } from '@/lib/apiClient';
import {
  PaymentInitiationDto,
  PaymentResponse,
  PaymentStatus,
} from '@/types/api';

interface ResumePaymentDto {
  ref: string;
}

export const paymentService = {

  async initiatePayment(
    paymentData: PaymentInitiationDto
  ): Promise<PaymentResponse> {
    return apiClient.post<PaymentResponse>(
      '/orders/initiate-payment',
      paymentData
    );
  },

  async getPaymentStatus(ref: string): Promise<PaymentStatus> {
    return apiClient.get<PaymentStatus>(`/orders/payment/status/${ref}`);
  },

  async resumePayment(
    resumeData: ResumePaymentDto
  ): Promise<PaymentResponse> {
    return apiClient.post<PaymentResponse>(
      '/orders/payment/resume',
      resumeData
    );
  },
};
