import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BaseUser,
  LoginCredentials,
  BaseRegisterData,
  VerifyEmailData,
  RequestPasswordResetData,
  ResetPasswordData,
} from '@/types/auth';
import { STORAGE_KEYS } from '@/constants';
import { apiClient } from '@/lib/apiClient';
import { LoginResponse, RegisterResponse } from '@/types/api';

export class AuthService<T extends BaseUser> {
  protected currentUser: T | null = null;

  async login(
    credentials: LoginCredentials,
    userType: 'CLIENT' | 'DELIVER'
  ): Promise<T> {
    try {
      const response = await apiClient.post<LoginResponse>(
        '/auth/login',
        credentials
      );

      const { user, accessToken } = response;

      if (!user || !accessToken) {
        throw new Error('Login failed: invalid server response.');
      }

      if (!user.isActive) {
        throw new Error(
          'Veuillez vérifier votre email avant de vous connecter'
        );
      }

      const userRole =
        user.roles && user.roles.length > 0
          ? user.roles[0].name.toUpperCase()
          : '';
      const expectedRole = userType === 'CLIENT' ? 'CLIENT' : 'DELIVER';

      if (userRole !== expectedRole) {
        throw new Error(
          `Ce compte n'est pas enregistré en tant que ${userType}`
        );
      }

      const userWithRole = {
        ...user,
        role: userRole.toLowerCase(),
        phoneNumber: user.phone || '',
        name: `${user.firstName} ${user.lastName}`,
      } as T;

      this.currentUser = userWithRole;

      await AsyncStorage.setItem(
        STORAGE_KEYS.AUTH_USER,
        JSON.stringify(userWithRole)
      );
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);

      return userWithRole;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Une erreur est survenue lors de la connexion');
    }
  }

  async register(
    data: BaseRegisterData,
    userType: 'CLIENT' | 'DELIVER'
  ): Promise<{
    success: boolean;
    message: string;
    requiresVerification: boolean;
  }> {
    try {
      const registerData = { ...data };
      Reflect.deleteProperty(registerData, 'confirmPassword');

      const backendData = {
        email: registerData.email,
        password: registerData.password,
        firstName: registerData.name.split(' ')[0] || registerData.name,
        lastName: registerData.name.split(' ').slice(1).join(' ') || '',
        phone: registerData.phoneNumber,
        role: userType,
        ...(userType === 'DELIVER' && {
          address: registerData.address,
          vehicle: registerData.vehicle,
        }),
        ...(userType === 'CLIENT' && {
          defaultAddress: registerData.address,
        }),
      };

      const response = await apiClient.post<RegisterResponse>(
        '/auth/register',
        backendData
      );

      return {
        success: response.success,
        message: response.message,
        requiresVerification: true,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Une erreur est survenue lors de l'inscription");
    }
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_USER,
      STORAGE_KEYS.AUTH_TOKEN,
    ]);
  }

  async requestPasswordReset(
    data: RequestPasswordResetData
  ): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      '/auth/request-password-reset',
      data
    );
  }

  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/reset-password', data);
  }

  async verifyEmail(
    data: VerifyEmailData
  ): Promise<{ success: boolean; message: string; email?: string }> {
    return apiClient.post<{ success: boolean; message: string; email?: string }>(
      '/auth/verify-email',
      data
    );
  }

  async updateProfile(data: Partial<T>): Promise<T> {
    const user = await apiClient.put<T>('/auth/profile', data);
    this.currentUser = user;
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    return user;
  }

  async getCurrentUser(): Promise<T | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (stored) {
        const user = JSON.parse(stored);
        this.currentUser = user;
        return this.currentUser;
      }
    } catch (error) {
      console.error('Error parsing stored user:', error);
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }

    return null;
  }

  async refreshUserProfile(): Promise<T | null> {
    try {
      const user = await apiClient.get<T>('/auth/profile');
      this.currentUser = user;
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
      return this.currentUser;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!user || !token) {
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }

  getCurrentUserSync(): T | null {
    return this.currentUser;
  }

  isAuthenticatedSync(): boolean {
    return this.currentUser !== null;
  }

  async initialize(): Promise<void> {
    try {
      await this.getCurrentUser();

      if (this.currentUser) {
        const isValid = await this.isAuthenticated();
        if (!isValid) {
          this.currentUser = null;
        }
      }
    } catch (error) {
      console.error('Error initializing AuthService:', error);
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_USER,
        STORAGE_KEYS.AUTH_TOKEN,
      ]);
      this.currentUser = null;
    } catch (error) {
      console.error('Error clearing all auth data:', error);
    }
  }

  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }
}

export const authService = new AuthService();
