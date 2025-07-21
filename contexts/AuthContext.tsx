import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useState,
} from 'react';
import { useRouter } from 'expo-router';
import { BaseUser, VerifyEmailData, RequestPasswordResetData, ResetPasswordData } from '@/types/auth';
import AuthLoader from '@/components/common/AuthLoader';
import { AuthService } from '@/services/authService';

export interface AuthState<T extends BaseUser> {
  entity: T | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType<T extends BaseUser> extends AuthState<T> {
  login: (credentials: any, userType: 'CLIENT' | 'DELIVER') => Promise<void>;
  register: (data: any, userType: 'CLIENT' | 'DELIVER') => Promise<{ success: boolean; message: string; requiresVerification: boolean }>;
  logout: () => Promise<void>;
  verifyEmail: (data: VerifyEmailData) => Promise<{ success: boolean; message: string; email?: string }>;
  requestPasswordReset: (data: RequestPasswordResetData) => Promise<{ message: string }>;
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
  | { type: 'REGISTRATION_SUCCESS'; payload: { message: string; requiresVerification: boolean } };

const AuthContext = createContext<AuthContextType<any> | undefined>(undefined);

const authReducer = <T extends BaseUser>(
  state: AuthState<T>,
  action: AuthAction<T>
): AuthState<T> => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        entity: action.payload,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        entity: null,
        error: action.payload,
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
      return { ...state, entity: action.payload };
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

  const authService = new AuthService();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await authService.initialize();
        const entity = await authService.getCurrentUser();

        if (entity) {
          dispatch({ type: 'AUTH_SUCCESS', payload: entity });
        } else {
          dispatch({ type: 'AUTH_INIT_COMPLETE' });
        }
      } catch (error) {
        console.error(`Auth initialization error:`, error);
        dispatch({ type: 'AUTH_INIT_COMPLETE' });
      } finally {
        setTimeout(() => {
          setIsInitializing(false);
        }, 500);
      }
    };
    checkAuth();
  }, []);

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
        error instanceof Error ? error.message : 'Erreur de demande de réinitialisation';
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
