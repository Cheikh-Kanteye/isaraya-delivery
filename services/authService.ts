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
import { API_URL, STORAGE_KEYS, TOKEN_EXPIRY_DURATION } from '@/constants';

export class AuthService<T extends BaseUser> {
  protected currentUser: T | null = null;

  // Helper method to check if token is expired
  async isTokenExpired(): Promise<boolean> {
    try {
      const expiryStr = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
      if (!expiryStr) {
        return true; // No expiry date means token is invalid
      }

      const expiryDate = new Date(expiryStr);
      const now = new Date();
      
      return now >= expiryDate;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // Assume expired on error
    }
  }

  // Helper method to make API requests
  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    // Check if API_URL is configured
    if (!API_URL) {
      throw new Error('Configuration API manquante. Veuillez configurer EXPO_PUBLIC_API_URL.');
    }

    // Check token expiration before making request
    const isExpired = await this.isTokenExpired();
    if (isExpired && endpoint !== '/login' && endpoint !== '/register') {
      await this.logout();
      throw new Error('Votre session a expiré. Veuillez vous reconnecter.');
    }

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
        // Handle 401 Unauthorized (token expired or invalid)
        if (response.status === 401) {
          await this.logout();
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        
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

      // Handle backend response structure with payload
      if (!response.payload?.success) {
        throw new Error(response.message || 'Login failed');
      }

      const { user, accessToken } = response.payload;

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
        role: userRole.toLowerCase() as 'admin' | 'deliver' | 'client',
        phoneNumber: user.phone || user.phoneNumber,
        phone: user.phone || user.phoneNumber,
        name: user.name || `${user.firstName} ${user.lastName}`,
      };

      this.currentUser = userWithRole;

      // Calculate token expiry (1 day from now)
      const expiryDate = new Date();
      expiryDate.setTime(expiryDate.getTime() + TOKEN_EXPIRY_DURATION);

      // Store user, token, and expiry date in AsyncStorage
      await AsyncStorage.setItem(
        STORAGE_KEYS.AUTH_USER,
        JSON.stringify(userWithRole)
      );
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
      await AsyncStorage.setItem(
        STORAGE_KEYS.TOKEN_EXPIRY,
        expiryDate.toISOString()
      );

      console.log('Token stocké avec expiration:', expiryDate.toISOString());

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
      if (response.payload?.success && response.payload.statusCode === 201) {
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
      STORAGE_KEYS.TOKEN_EXPIRY,
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
        success: response.payload?.success || true,
        message: response.message || 'Email vérifié avec succès',
        email: response.payload?.email || response.email,
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
        method: 'PATCH',
        body: JSON.stringify(data),
      });

      // Correction: adapter selon la structure de réponse du backend
      const user = response.payload;
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

        // Normalize user data
        if (user) {
          // Ensure the user has the correct role format
          if (!user.role && user.roles && user.roles.length > 0) {
            user.role = user.roles[0].name.toLowerCase();
          }
          
          // Normalize phone fields
          if (!user.phoneNumber && user.phone) {
            user.phoneNumber = user.phone;
          }
          if (!user.phone && user.phoneNumber) {
            user.phone = user.phoneNumber;
          }
          
          // Ensure name field exists
          if (!user.name && user.firstName && user.lastName) {
            user.name = `${user.firstName} ${user.lastName}`;
          }
        }

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
      const user = response.payload;
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

      // Check if token is expired
      const isExpired = await this.isTokenExpired();
      if (isExpired) {
        console.log('Token expiré, déconnexion automatique');
        await this.logout();
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
        STORAGE_KEYS.TOKEN_EXPIRY,
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
      // Calculate expiry date
      const expiryDate = new Date();
      expiryDate.setTime(expiryDate.getTime() + TOKEN_EXPIRY_DURATION);

      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await AsyncStorage.setItem(
        STORAGE_KEYS.TOKEN_EXPIRY,
        expiryDate.toISOString()
      );
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }

  // Method to get remaining time before token expiration
  async getTokenRemainingTime(): Promise<number> {
    try {
      const expiryStr = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
      if (!expiryStr) {
        return 0;
      }

      const expiryDate = new Date(expiryStr);
      const now = new Date();
      const remaining = expiryDate.getTime() - now.getTime();

      return remaining > 0 ? remaining : 0;
    } catch (error) {
      console.error('Error getting token remaining time:', error);
      return 0;
    }
  }

  // Method to check if token will expire soon (less than 1 hour)
  async isTokenExpiringSoon(): Promise<boolean> {
    const remaining = await this.getTokenRemainingTime();
    const oneHour = 60 * 60 * 1000;
    return remaining > 0 && remaining < oneHour;
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
