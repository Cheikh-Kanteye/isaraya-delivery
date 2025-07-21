import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { z } from 'zod';
import { Theme, createTextStyle, createButtonStyle } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { LoginCredentials, BaseUser } from '@/types/auth';
import { loginSchema } from '@/validations/authSchemas';
import { useRouter } from 'expo-router';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
  userType: 'CLIENT' | 'DELIVER';
}

export default function LoginForm({
  onSwitchToRegister,
  onForgotPassword,
  userType,
}: LoginFormProps) {
  const { login, isLoading, error, clearError } = useAuth<BaseUser>();
  const router = useRouter();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LoginCredentials, string>>
  >({});

  const validateForm = (): boolean => {
    try {
      loginSchema.parse(credentials);
      setFieldErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof LoginCredentials, string>> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof LoginCredentials;
          errors[field] = err.message;
        });
        setFieldErrors(errors);
      }
      return false;
    }
  };

  const validateField = (
    field: keyof LoginCredentials,
    value: string
  ): string | undefined => {
    try {
      const fieldSchema = loginSchema.shape[field];
      fieldSchema.parse(value);
      return undefined;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message;
      }
      return undefined;
    }
  };

  const handleLogin = async () => {
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      await login(credentials, userType);
      const role = userType.toLocaleLowerCase() as 'client' | 'deliver';
      router.push(`/(${role})/(tabs)`); // Redirect to home after successful login
    } catch (error) {
      // Error is handled by the context
      console.debug(error);
    }
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleInputBlur = (field: keyof LoginCredentials) => {
    const error = validateField(field, credentials[field]);
    if (error) {
      setFieldErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  // Demo credentials helper
  const fillDemoCredentials = () => {
    if (userType === 'CLIENT') {
      setCredentials({
        email: 'cheikhkanteye.contact@gmail.com',
        password: 'password123',
      });
    } else {
      setCredentials({
        email: 'amy@example.com',
        password: 'password123',
      });
    }
    setFieldErrors({});
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Connexion</Text>
        <Text style={styles.subtitle}>
          Connectez-vous à votre compte{' '}
          {userType === 'CLIENT' ? 'client' : 'livreur'}
        </Text>
      </View>

      {/* Demo Helper */}
      <TouchableOpacity style={styles.demoButton} onPress={fillDemoCredentials}>
        <Text style={styles.demoButtonText}>
          📱 Utiliser les identifiants de démo
        </Text>
      </TouchableOpacity>

      {/* Global Error */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <View
          style={[styles.inputWrapper, fieldErrors.email && styles.inputError]}
        >
          <Mail
            size={20}
            color={Theme.colors.neutral[400]}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="votre@email.com"
            value={credentials.email}
            onChangeText={(value) => handleInputChange('email', value)}
            onBlur={() => handleInputBlur('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
        </View>
        {fieldErrors.email && (
          <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text>
        )}
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mot de passe</Text>
        <View
          style={[
            styles.inputWrapper,
            fieldErrors.password && styles.inputError,
          ]}
        >
          <Lock
            size={20}
            color={Theme.colors.neutral[400]}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={credentials.password}
            onChangeText={(value) => handleInputChange('password', value)}
            onBlur={() => handleInputBlur('password')}
            secureTextEntry={!showPassword}
            editable={!isLoading}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            {showPassword ? (
              <EyeOff size={20} color={Theme.colors.neutral[400]} />
            ) : (
              <Eye size={20} color={Theme.colors.neutral[400]} />
            )}
          </TouchableOpacity>
        </View>
        {fieldErrors.password && (
          <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>
        )}
      </View>

      {/* Forgot Password */}
      <TouchableOpacity
        onPress={onForgotPassword}
        style={styles.forgotPassword}
      >
        <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity
        style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.loginButtonText}>
          {isLoading ? 'Connexion...' : 'Se connecter'}
        </Text>
      </TouchableOpacity>

      {/* Switch to Register */}
      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>Pas encore de compte ? </Text>
        <TouchableOpacity onPress={onSwitchToRegister}>
          <Text style={styles.switchLink}>S&apos;inscrire</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing['2xl'],
  },
  title: {
    ...createTextStyle('3xl', 'bold', Theme.colors.neutral[900]),
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    ...createTextStyle('base', 'normal', Theme.colors.neutral[500]),
    textAlign: 'center',
  },
  demoButton: {
    backgroundColor: Theme.colors.accent[100],
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.xl,
    alignItems: 'center',
  },
  demoButtonText: {
    ...createTextStyle('sm', 'medium', Theme.colors.accent[700]),
  },
  errorContainer: {
    backgroundColor: Theme.colors.error[100],
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.lg,
  },
  errorText: {
    ...createTextStyle('sm', 'medium', Theme.colors.error[700]),
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: Theme.spacing.lg,
  },
  label: {
    ...createTextStyle('sm', 'medium', Theme.colors.neutral[700]),
    marginBottom: Theme.spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[300],
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.md,
    height: 48,
  },
  inputError: {
    borderColor: Theme.colors.error[500],
  },
  inputIcon: {
    marginRight: Theme.spacing.sm,
  },
  input: {
    flex: 1,
    ...createTextStyle('base', 'normal', Theme.colors.neutral[900]),
    height: '100%',
  },
  eyeIcon: {
    padding: Theme.spacing.xs,
  },
  fieldErrorText: {
    ...createTextStyle('xs', 'normal', Theme.colors.error[500]),
    marginTop: Theme.spacing.xs,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Theme.spacing.xl,
  },
  forgotPasswordText: {
    ...createTextStyle('sm', 'medium', Theme.colors.primary[500]),
  },
  loginButton: {
    ...createButtonStyle('primary'),
    marginBottom: Theme.spacing.xl,
  },
  loginButtonDisabled: {
    backgroundColor: Theme.colors.neutral[300],
  },
  loginButtonText: {
    ...createTextStyle('base', 'semibold', Theme.colors.white),
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    ...createTextStyle('base', 'normal', Theme.colors.neutral[500]),
  },
  switchLink: {
    ...createTextStyle('base', 'semibold', Theme.colors.primary[500]),
  },
});
