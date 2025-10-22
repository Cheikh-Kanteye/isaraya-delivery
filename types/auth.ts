export interface Role {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface BaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string; // Combined firstName + lastName from backend
  phoneNumber: string; // Normalized field
  phone: string; // Backend field
  profilePicture?: string;
  password?: string; // Backend includes this (should not be used in frontend)
  role: 'admin' | 'deliver' | 'client'; // Normalized lowercase role
  roles: Role[]; // Backend format (array of role objects)
  status?: 'verified' | 'pending' | 'unverified' | 'suspended';
  isActive: boolean; // Backend field for email verification
  isOnline?: boolean; // Backend field for deliver
  createdAt: string;
  updatedAt: string;
}

export interface Deliver extends BaseUser {
  address: string;
  rating: number;
  totalDeliveries: number;
  joinDate: string;
  vehicle: string;
  isOnline: boolean;
}

// Client definition moved to auth.ts for coherency
export interface Client extends BaseUser {
  defaultAddress?: string;
  mobileMoneyNumber?: string;
  totalDeliveries: number;
  memberSince: string;
}

export interface AuthState<T extends BaseUser> {
  entity: T | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface BaseRegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phoneNumber: string;
  address?: string;
  vehicle?: string;
}

export interface VerifyEmailData {
  token: string;
}

export interface RequestPasswordResetData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface DeliverRegisterData extends BaseRegisterData {
  address: string;
  vehicle: string;
}

export interface ClientRegisterData extends BaseRegisterData {
  defaultAddress?: string;
  mobileMoneyNumber?: string;
}

export interface AuthContextType<T extends BaseUser> extends AuthState<T> {
  login: (
    credentials: LoginCredentials,
    userType: 'CLIENT' | 'DELIVER'
  ) => Promise<void>;
  register: (
    data: BaseRegisterData,
    userType: 'CLIENT' | 'DELIVER'
  ) => Promise<{
    success: boolean;
    message: string;
    requiresVerification: boolean;
  }>;
  logout: () => Promise<void>;
  verifyEmail: (
    data: VerifyEmailData
  ) => Promise<{ success: boolean; message: string; email?: string }>;
  requestPasswordReset: (
    data: RequestPasswordResetData
  ) => Promise<{ message: string }>;
  resetPassword: (data: ResetPasswordData) => Promise<{ message: string }>;
  updateProfile: (data: Partial<T>) => Promise<void>;
  clearError: () => void;
  refreshEntity: () => Promise<void>;
}
