import { CONFIG } from './config';

export const API_URL = CONFIG.API_URL;
export const STORAGE_KEYS = {
  AUTH_USER: 'auth_user',
  AUTH_TOKEN: 'auth_token',
  TOKEN_EXPIRY: 'token_expiry',
} as const;

// Token expiration duration (1 day in milliseconds)
export const TOKEN_EXPIRY_DURATION = 24 * 60 * 60 * 1000; // 1 jour
