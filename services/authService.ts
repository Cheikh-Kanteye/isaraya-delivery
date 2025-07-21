import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BaseUser,
  LoginCredentials,
  BaseRegisterData,
  VerifyEmailData,
  RequestPasswordResetData,
  ResetPasswordData,
} from '@/types/auth';
import { DeliveryRequest, Payment } from '@/types/client';
import { API_URL, STORAGE_KEYS } from '@/constants';

export class AuthService<T extends BaseUser> {
  protected currentUser: T | null = null;

  // Helper method to make API requests
  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${API_URL}/auth${endpoint}`;
    console.log('url: ', url);

    const defaultHeaders: { [key: string]: string } = {
      'Content-Type': 'application/json',
    };

    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async login(
    credentials: LoginCredentials,
    userType: 'CLIENT' | 'DELIVER'
  ): Promise<T> {
    try {
      console.log('Sending credentials:', credentials);

      const response = await this.makeRequest('/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      console.log('Response from backend:', response);

      // Handle backend response structure
      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }

      const { user, accessToken } = response;

      if (!user || !accessToken) {
        console.warn('Invalid response from server. Missing user or token.');
        throw new Error('Login failed: invalid server response.');
      }

      // Check if user's email is verified (backend ensures this)
      if (!user.isActive) {
        throw new Error(
          'Veuillez vérifier votre email avant de vous connecter'
        );
      }

      // Map backend roles to frontend format
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

      // Map backend user structure to frontend structure
      const userWithRole = {
        ...user,
        role: userRole.toLowerCase(),
        phoneNumber: user.phone || user.phoneNumber, // Handle field mapping
        name: `${user.firstName} ${user.lastName}`, // Combine names for compatibility
      };

      this.currentUser = userWithRole;

      // Store user and token in AsyncStorage
      await AsyncStorage.setItem(
        STORAGE_KEYS.AUTH_USER,
        JSON.stringify(userWithRole)
      );
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);

      return userWithRole;
    } catch (error) {
      console.error('Login failed:', error);
      // Handle backend error structure
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

      // Map frontend fields to backend expected format
      const backendData = {
        email: registerData.email,
        password: registerData.password,
        firstName: registerData.name.split(' ')[0] || registerData.name,
        lastName: registerData.name.split(' ').slice(1).join(' ') || '',
        phone: registerData.phoneNumber,
        role: userType,
        // Additional fields based on user type
        ...(userType === 'DELIVER' && {
          address: registerData.address,
          vehicle: registerData.vehicle,
        }),
        ...(userType === 'CLIENT' && {
          defaultAddress: registerData.address,
        }),
      };

      console.log('Sending registration data:', backendData);

      const response = await this.makeRequest('/register', {
        method: 'POST',
        body: JSON.stringify(backendData),
      });

      console.log('Registration response:', response);

      // Backend returns success without access token (email verification required)
      if (response.success && response.statusCode === 201) {
        return {
          success: true,
          message: response.message,
          requiresVerification: true,
        };
      }

      // Handle backend error responses
      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      console.error('Registration failed:', error);
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
    try {
      const response = await this.makeRequest('/request-password-reset', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return {
        message:
          response.message ||
          'Si cet email existe, un lien de réinitialisation a été envoyé',
      };
    } catch (error) {
      console.error('Password reset request failed:', error);
      throw error;
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    try {
      const response = await this.makeRequest('/reset-password', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return {
        message: response.message || 'Mot de passe réinitialisé avec succès',
      };
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    }
  }

  async verifyEmail(
    data: VerifyEmailData
  ): Promise<{ success: boolean; message: string; email?: string }> {
    try {
      const response = await this.makeRequest('/verify-email', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return {
        success: response.success || true,
        message: response.message || 'Email vérifié avec succès',
        email: response.email,
      };
    } catch (error) {
      console.error('Email verification failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        "Une erreur est survenue lors de la vérification de l'email"
      );
    }
  }

  async updateProfile(data: Partial<T>): Promise<T> {
    try {
      const response = await this.makeRequest('/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      // Correction: adapter selon la structure de réponse du backend
      const user = response.user || response;
      this.currentUser = user;

      console.log(response);

      // Update user in AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));

      return user;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<T | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    // Try to restore from AsyncStorage first
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (stored) {
        const user = JSON.parse(stored);

        this.currentUser = user;
        return this.currentUser;
      }
    } catch (error) {
      console.error('Error parsing stored user:', error);
      // Clear corrupted data
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }

    return null;
  }

  async refreshUserProfile(): Promise<T | null> {
    try {
      const response = await this.makeRequest('/profile', {
        method: 'GET',
      });

      // Correction: adapter selon la structure de réponse du backend
      const user = response.user || response;
      this.currentUser = user;

      // Update user in AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));

      return user;
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
      // If refresh fails, return cached user
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

  // Helper method to get current user synchronously if already loaded
  getCurrentUserSync(): T | null {
    return this.currentUser;
  }

  // Helper method to check if user is authenticated synchronously
  isAuthenticatedSync(): boolean {
    return this.currentUser !== null;
  }

  // Method to initialize the service (call this when your app starts)
  async initialize(): Promise<void> {
    try {
      await this.getCurrentUser();

      // If user exists in storage, verify token is still valid
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

  // Method to clear all stored data (useful for debugging or user data reset)
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

  // Method to get the current auth token
  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Method to manually set auth token (useful for testing or external auth)
  async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }

  async createDeliveryRequest(
    delvery: Omit<DeliveryRequest, 'id' | 'status' | 'createdAt'>
  ) {
    return {} as DeliveryRequest;
  }

  async processPayment(payment: Omit<Payment, 'id' | 'status' | 'createdAt'>) {}
}

// Export a single instance of AuthService
export const authService = new AuthService();
