export interface Location {
  street: string;
  city: string;
  postcode: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  isOnline: boolean;
  createdAt: string;
  updatedAt: string;
  roles: Role[];
}

export interface Role {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface MissionItem {
  produitId: string;
  quantity: number;
  price: number;
  name?: string;
}

export interface Mission {
  id: string;
  clientId: string;
  livreurId?: string;
  pickupLocation: Location;
  deliveryLocation: Location;
  items?: MissionItem[];
  description?: string;
  status:
    | 'PENDING'
    | 'ACCEPTED'
    | 'PICKED_UP'
    | 'IN_TRANSIT'
    | 'DELIVERED'
    | 'CANCELLED';
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH';
  deliveryFee: number;
  distance?: number;
  estimatedDuration?: number;
  currentLocation?: Coordinates;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
}

export interface CreateMissionDto {
  pickupLocation: Location;
  deliveryLocation: Location;
  description?: string;
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH';
  items?: MissionItem[];
}

export interface AcceptMissionDto {
  missionId: string;
  livreurId: string;
}

export interface UpdateMissionStatusDto {
  missionId: string;
  status: string;
}

export interface UpdateMissionPositionDto {
  latitude: number;
  longitude: number;
}

export interface Order {
  id: string;
  clientId: string;
  merchantId?: string;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'DELIVERED' | 'CANCELLED';
  items: OrderItem[];
  location: Location;
  paymentMethod: string;
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  produitId: string;
  quantity: number;
  price: number;
  name?: string;
}

export interface CreateOrderDto {
  clientId: string;
  total: number;
  currency: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: Location;
  paymentMethod: string;
  items: OrderItem[];
}

export interface PaymentInitiationDto {
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface PaymentResponse {
  redirectUrl: string;
  token: string;
}

export interface PaymentStatus {
  status: string;
  redirectUrl?: string;
  token?: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface SendNotificationDto {
  userId: string;
  notification: NotificationPayload;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  merchantId: string;
  createdAt: string;
  updatedAt: string;
}
