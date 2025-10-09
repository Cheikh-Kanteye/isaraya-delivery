import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, STORAGE_KEYS } from '@/constants';

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  payload?: {
    success?: boolean;
    statusCode?: number;
    data?: T;
    message?: string;
    [key: string]: any;
  };
  message?: string;
  statusCode?: number;
  error?: string;
}

export interface ApiError {
  status: 'error';
  statusCode: number;
  message: string;
  error: string;
  code?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_URL || '') {
    this.baseURL = baseURL;
  }

  private async getHeaders(customHeaders: HeadersInit = {}): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = await this.getHeaders(options.headers);

      const config: RequestInit = {
        ...options,
        headers,
      };

      console.log(`[API] ${options.method || 'GET'} ${url}`);

      const response = await fetch(url, config);
      let data: ApiResponse<T>;

      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error(
          `Erreur de parsing JSON: ${response.status} ${response.statusText}`
        );
      }

      if (!response.ok) {
        const errorMessage =
          data.message ||
          data.payload?.message ||
          `HTTP error! status: ${response.status}`;

        const error = new Error(errorMessage) as Error & {
          statusCode?: number;
          code?: string;
        };
        error.statusCode = response.status;
        if ('code' in data) {
          error.code = (data as ApiError).code;
        }

        throw error;
      }

      if (data.payload?.data !== undefined) {
        return data.payload.data as T;
      }

      if (data.payload !== undefined) {
        return data.payload as T;
      }

      return data as T;
    } catch (error) {
      console.error(`[API Error] ${endpoint}:`, error);
      throw error;
    }
  }

  async get<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(
    endpoint: string,
    body?: any,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T = any>(
    endpoint: string,
    body?: any,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T = any>(
    endpoint: string,
    body?: any,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
