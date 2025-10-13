import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, STORAGE_KEYS } from '@/constants';
import { authService } from '@/services/authService';

/**
 * Helper pour faire des requêtes API avec gestion automatique du token et de l'expiration
 */
export class ApiHelper {
  /**
   * Fait une requête API avec gestion automatique de l'authentification
   * et de l'expiration du token
   */
  static async makeAuthenticatedRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    // Vérifier l'expiration du token avant la requête
    const isExpired = await authService.isTokenExpired();
    if (isExpired) {
      await authService.logout();
      throw new Error('Votre session a expiré. Veuillez vous reconnecter.');
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

    const defaultHeaders: { [key: string]: string } = {
      'Content-Type': 'application/json',
    };

    // Ajouter le token d'authentification
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

      // Gérer les erreurs 401 (token expiré ou invalide)
      if (response.status === 401) {
        await authService.logout();
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      // Parser la réponse JSON
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      return data;
    } catch (error) {
      console.error(`Requête API échouée pour ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Méthode GET
   */
  static async get(endpoint: string): Promise<any> {
    return this.makeAuthenticatedRequest(endpoint, {
      method: 'GET',
    });
  }

  /**
   * Méthode POST
   */
  static async post(endpoint: string, data?: any): Promise<any> {
    return this.makeAuthenticatedRequest(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Méthode PUT
   */
  static async put(endpoint: string, data?: any): Promise<any> {
    return this.makeAuthenticatedRequest(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Méthode PATCH
   */
  static async patch(endpoint: string, data?: any): Promise<any> {
    return this.makeAuthenticatedRequest(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Méthode DELETE
   */
  static async delete(endpoint: string): Promise<any> {
    return this.makeAuthenticatedRequest(endpoint, {
      method: 'DELETE',
    });
  }
}
