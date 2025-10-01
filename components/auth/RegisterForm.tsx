import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Truck,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import { Theme, createTextStyle, createButtonStyle } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { BaseRegisterData, BaseUser } from '@/types/auth';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  userType: 'CLIENT' | 'DELIVER';
}

export default function RegisterForm({
  onSwitchToLogin,
  userType,
}: RegisterFormProps) {
  const { register, isLoading, error, clearError } = useAuth<BaseUser>();
  const [formData, setFormData] = useState<BaseRegisterData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phoneNumber: '',
    address: '',
    vehicle: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<BaseRegisterData>>({});

  const vehicleOptions = ['Scooter', 'Moto', 'Vélo', 'Voiture'];

  const validateForm = (): boolean => {
    const errors: Partial<BaseRegisterData> = {};

    if (!formData.name.trim()) {
      errors.name = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      errors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Format d'email invalide";
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Le téléphone est requis';
    }

    if (!formData.address?.trim()) {
      errors.address = "L'adresse est requise";
    }

    if (!formData.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirmez votre mot de passe';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      await register(formData, userType);
    } catch (error) {
      // Error is handled by the context
    }
  };

  const handleInputChange = (field: keyof BaseRegisterData, value: string) => {
    const trimmedValue = value.trimStart();
    setFormData((prev) => ({ ...prev, [field]: trimmedValue }));

    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Inscription</Text>
        <Text style={styles.subtitle}>
          Créez votre compte {userType === 'CLIENT' ? 'client' : 'livreur'}
        </Text>
      </View>

      {/* Global Error */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Name Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nom complet</Text>
        <View
          style={[styles.inputWrapper, fieldErrors.name && styles.inputError]}
        >
          <User
            size={20}
            color={Theme.colors.neutral[400]}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Votre nom complet"
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            editable={!isLoading}
          />
        </View>
        {fieldErrors.name && (
          <Text style={styles.fieldErrorText}>{fieldErrors.name}</Text>
        )}
      </View>

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
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
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

      {/* Phone Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Téléphone</Text>
        <View
          style={[
            styles.inputWrapper,
            fieldErrors.phoneNumber && styles.inputError,
          ]}
        >
          <Phone
            size={20}
            color={Theme.colors.neutral[400]}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="+221 77 123 45 67"
            value={formData.phoneNumber}
            onChangeText={(value) => handleInputChange('phoneNumber', value)}
            keyboardType="phone-pad"
            editable={!isLoading}
          />
        </View>
        {fieldErrors.phoneNumber && (
          <Text style={styles.fieldErrorText}>{fieldErrors.phoneNumber}</Text>
        )}
      </View>

      {/* Address Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Adresse</Text>
        <View
          style={[
            styles.inputWrapper,
            fieldErrors.address && styles.inputError,
          ]}
        >
          <MapPin
            size={20}
            color={Theme.colors.neutral[400]}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Votre adresse complète"
            value={formData.address}
            onChangeText={(value) => handleInputChange('address', value)}
            editable={!isLoading}
          />
        </View>
        {fieldErrors.address && (
          <Text style={styles.fieldErrorText}>{fieldErrors.address}</Text>
        )}
      </View>

      {/* Vehicle Selection */}
      {userType === 'DELIVER' && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Véhicule</Text>
          <View style={styles.vehicleContainer}>
            {vehicleOptions.map((vehicle) => (
              <TouchableOpacity
                key={vehicle}
                style={[
                  styles.vehicleOption,
                  formData.vehicle === vehicle && styles.vehicleOptionSelected,
                ]}
                onPress={() => handleInputChange('vehicle', vehicle)}
                disabled={isLoading}
              >
                <Truck
                  size={20}
                  color={
                    formData.vehicle === vehicle
                      ? Theme.colors.primary[500]
                      : Theme.colors.neutral[400]
                  }
                />
                <Text
                  style={[
                    styles.vehicleOptionText,
                    formData.vehicle === vehicle &&
                      styles.vehicleOptionTextSelected,
                  ]}
                >
                  {vehicle}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

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
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            secureTextEntry={!showPassword}
            editable={!isLoading}
            autoCapitalize="none"
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

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirmer le mot de passe</Text>
        <View
          style={[
            styles.inputWrapper,
            fieldErrors.confirmPassword && styles.inputError,
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
            value={formData.confirmPassword}
            onChangeText={(value) =>
              handleInputChange('confirmPassword', value)
            }
            secureTextEntry={!showConfirmPassword}
            editable={!isLoading}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
          >
            {showConfirmPassword ? (
              <EyeOff size={20} color={Theme.colors.neutral[400]} />
            ) : (
              <Eye size={20} color={Theme.colors.neutral[400]} />
            )}
          </TouchableOpacity>
        </View>
        {fieldErrors.confirmPassword && (
          <Text style={styles.fieldErrorText}>
            {fieldErrors.confirmPassword}
          </Text>
        )}
      </View>

      {/* Register Button */}
      <TouchableOpacity
        style={[
          styles.registerButton,
          isLoading && styles.registerButtonDisabled,
        ]}
        onPress={handleRegister}
        disabled={isLoading}
      >
        <Text style={styles.registerButtonText}>
          {isLoading ? 'Inscription...' : "S'inscrire"}
        </Text>
      </TouchableOpacity>

      {/* Switch to Login */}
      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>Déjà un compte ? </Text>
        <TouchableOpacity onPress={onSwitchToLogin}>
          <Text style={styles.switchLink}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing['2xl'],
    marginTop: Theme.spacing.xl,
  },
  title: {
    ...createTextStyle('3xl', 'bold', Theme.colors.neutral[900]),
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    ...createTextStyle('base', 'normal', Theme.colors.neutral[500]),
    textAlign: 'center',
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
  vehicleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  vehicleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[300],
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    gap: Theme.spacing.sm,
  },
  vehicleOptionSelected: {
    borderColor: Theme.colors.primary[500],
    backgroundColor: Theme.colors.primary[50],
  },
  vehicleOptionText: {
    ...createTextStyle('sm', 'medium', Theme.colors.neutral[600]),
  },
  vehicleOptionTextSelected: {
    color: Theme.colors.primary[500],
  },
  registerButton: {
    ...createButtonStyle('primary'),
    marginBottom: Theme.spacing.xl,
    marginTop: Theme.spacing.lg,
  },
  registerButtonDisabled: {
    backgroundColor: Theme.colors.neutral[300],
  },
  registerButtonText: {
    ...createTextStyle('base', 'semibold', Theme.colors.white),
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing['2xl'],
  },
  switchText: {
    ...createTextStyle('base', 'normal', Theme.colors.neutral[500]),
  },
  switchLink: {
    ...createTextStyle('base', 'semibold', Theme.colors.primary[500]),
  },
});
