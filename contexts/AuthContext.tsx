import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useState,
  useRef,
} from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import {
  BaseUser,
  VerifyEmailData,
  RequestPasswordResetData,
  ResetPasswordData,
} from '@/types/auth';
import AuthLoader from '@/components/common/AuthLoader';
import { AuthService } from '@/services/authService';
import { validateConfig } from '@/constants/config';

export interface AuthState<T extends BaseUser> {
  entity: T | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType<T extends BaseUser> extends AuthState<T> {
  login: (credentials: any, userType: 'CLIENT' | 'DELIVER') => Promise<void>;
  register: (
    data: any,
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

type AuthAction<T> =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: T }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_ENTITY'; payload: T }
  | { type: 'AUTH_INIT_COMPLETE' }
  | {
      type: 'REGISTRATION_SUCCESS';
      payload: { message: string; requiresVerification: boolean };
    };

const AuthContext = createContext<AuthContextType<any> | undefined>(undefined);

const authReducer = <T extends BaseUser>(
  state: AuthState<T>,
  action: AuthAction<T>
): AuthState<T> => {
  // console.log('Auth Action:', 'type=' + action.type);
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        entity: (action as { type: string; payload: T }).payload,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        entity: null,
        error: (action as { type: string; payload: string }).payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        entity: null,
        error: null,
      };
    case 'UPDATE_ENTITY':
      return {
        ...state,
        entity: (action as { type: string; payload: T }).payload,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'AUTH_INIT_COMPLETE':
      return { ...state, isLoading: false };
    case 'REGISTRATION_SUCCESS':
      return {
        ...state,
        isLoading: false,
        error: null,
        // Don't set authenticated=true since email verification is required
      };
    default:
      return state;
  }
};

const initialState: AuthState<any> = {
  entity: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();
  const tokenCheckIntervalRef = useRef<number | null>(null);

  const authService = useRef(new AuthService()).current;

  // Vérification périodique de l'expiration du token
  useEffect(() => {
    const checkTokenExpiration = async () => {
      try {
        const isExpired = await authService.isTokenExpired();
        
        if (isExpired && state.isAuthenticated) {
          console.log('Token expiré détecté, déconnexion...');
          await authService.logout();
          dispatch({ type: 'AUTH_LOGOUT' });
          
          Alert.alert(
            'Session expirée',
            'Votre session a expiré. Veuillez vous reconnecter.',
            [{ text: 'OK', onPress: () => router.replace('/onboarding') }]
          );
        } else {
          // Vérifier si le token expire bientôt (moins d'1 heure)
          const expiringSoon = await authService.isTokenExpiringSoon();
          if (expiringSoon && state.isAuthenticated) {
            const remaining = await authService.getTokenRemainingTime();
            const minutes = Math.floor(remaining / 1000 / 60);
            console.log(`Attention: Token expire dans ${minutes} minutes`);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du token:', error);
      }
    };

    // Vérifier toutes les 5 minutes
    if (state.isAuthenticated) {
      checkTokenExpiration(); // Vérification immédiate
      tokenCheckIntervalRef.current = setInterval(checkTokenExpiration, 5 * 60 * 1000);
    }

    return () => {
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current);
      }
    };
  }, [state.isAuthenticated, authService, router]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Valider la configuration au démarrage
        validateConfig();
        
        await authService.initialize();
        const entity = await authService.getCurrentUser();

        if (entity) {
          // Vérifier immédiatement si le token est expiré
          const isExpired = await authService.isTokenExpired();
          if (isExpired) {
            console.log('Token expiré au démarrage, déconnexion...');
            await authService.logout();
            dispatch({ type: 'AUTH_INIT_COMPLETE' });
          } else {
            dispatch({ type: 'AUTH_SUCCESS', payload: entity });
          }
        } else {
          dispatch({ type: 'AUTH_INIT_COMPLETE' });
        }
      } catch (error) {
        console.error(`Auth initialization error:`, error);
        // Si c'est une erreur de configuration API, on peut continuer sans authentification
        if (error instanceof Error && error.message.includes('Configuration API manquante')) {
          console.warn('API non configurée, mode hors ligne activé');
        }
        dispatch({ type: 'AUTH_INIT_COMPLETE' });
      } finally {
        setTimeout(() => {
          setIsInitializing(false);
        }, 500);
      }
    };
    checkAuth();
  }, [authService]);

  const login = async (credentials: any, userType: 'CLIENT' | 'DELIVER') => {
    try {
      dispatch({ type: 'AUTH_START' });
      const entity = await authService.login(credentials, userType);
      dispatch({ type: 'AUTH_SUCCESS', payload: entity });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur de connexion';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const register = async (data: any, userType: 'CLIENT' | 'DELIVER') => {
    try {
      dispatch({ type: 'AUTH_START' });
      const result = await authService.register(data, userType);
      dispatch({ type: 'REGISTRATION_SUCCESS', payload: result });
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur d'inscription";
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const logout = async () => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      // Nettoyer l'intervalle de vérification du token
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current);
        tokenCheckIntervalRef.current = null;
      }
      
      await authService.logout();
      dispatch({ type: 'AUTH_LOGOUT' });
      router.replace('/onboarding');
    } catch (error) {
      console.error('Logout error:', error);
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const verifyEmail = async (data: VerifyEmailData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const result = await authService.verifyEmail(data);
      dispatch({ type: 'CLEAR_ERROR' });
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur de vérification';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const requestPasswordReset = async (data: RequestPasswordResetData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const result = await authService.requestPasswordReset(data);
      dispatch({ type: 'CLEAR_ERROR' });
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erreur de demande de réinitialisation';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const resetPassword = async (data: ResetPasswordData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const result = await authService.resetPassword(data);
      dispatch({ type: 'CLEAR_ERROR' });
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur de réinitialisation';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const updateProfile = async (data: Partial<any>) => {
    try {
      const updatedEntity = await authService.updateProfile(data);
      dispatch({ type: 'UPDATE_ENTITY', payload: updatedEntity });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur de mise à jour';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const refreshEntity = async () => {
    try {
      const entity = await authService.getCurrentUser();
      if (entity) {
        dispatch({ type: 'UPDATE_ENTITY', payload: entity });
      } else {
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    } catch (error) {
      console.error(`Error refreshing entity:`, error);
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  if (isInitializing) {
    return <AuthLoader message={`Vérification de votre compte...`} />;
  }

  const value: AuthContextType<any> = {
    ...state,
    login,
    register,
    logout,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    updateProfile,
    clearError,
    refreshEntity,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth<T extends BaseUser>(): AuthContextType<T> {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(`useAuth must be used within an AuthProvider`);
  }
  return context;
}
