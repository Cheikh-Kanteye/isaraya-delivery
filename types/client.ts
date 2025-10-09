export interface DeliveryResponse {
  message: string;
  payload: DeliveryRequest | DeliveryRequest[];
}

export interface DeliveryRequest {
  id: string;
  clientId: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  destinationAddress: string;
  destinationLatitude: number;
  destinationLongitude: number;
  description?: string;
  urgency?: 'normal' | 'urgent';
  deliveryType: 'STANDARD' | 'EXPRESS';
  deliveryFee: number; // in FCFA, calculated by backend
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  estimatedDuration: number; // in minutes, calculated by backend
  distance: number; // in km, calculated by backend
  livreurId?: string | null;
  orderId?: string | null;
  paymentStatus: 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'CANCELLED';
}

export interface Driver {
  id: string;
  name: string;
  profilePicture: string;
  rating: number;
  totalDeliveries: number;
  vehicle: string;
  isOnline: boolean;
  currentLocation: {
    lat: number;
    lng: number;
  };
  distanceFromClient: number; // in km
  estimatedArrival: number; // in minutes
  pricePerKm: number; // in FCFA
  role: 'admin' | 'deliver' | 'client';
}

export interface Payment {
  id: string;
  deliveryId: string;
  clientId: string;
  amount: number;
  tip: number;
  method: 'orange_money' | 'free_money' | 'wave';
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  createdAt: string;
  completedAt?: string;
}

// These types are now defined in auth.ts for consistency
// export type ClientAuthAction = ...
