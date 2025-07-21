import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  Mail,
  ArrowLeft,
  CircleCheck as CheckCircle,
} from 'lucide-react-native';
import { Theme, createTextStyle, createButtonStyle } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { BaseUser } from '@/types/auth';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export default function ForgotPasswordForm({
  onBack,
}: ForgotPasswordFormProps) {
  const { resetPassword, isLoading, error, clearError } = useAuth<BaseUser>();
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setEmailError("L'email est requis");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Format d'email invalide");
      return false;
    }

    setEmailError('');
    return true;
  };

  const handleResetPassword = async () => {
    clearError();

    if (!validateEmail()) {
      return;
    }

    try {
      await resetPassword(email);
      setEmailSent(true);
    } catch (error) {
      // Error is handled by the context
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) {
      setEmailError('');
    }
  };

  if (emailSent) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <CheckCircle size={64} color={Theme.colors.success[500]} />
          <Text style={styles.successTitle}>Email envoyé !</Text>
          <Text style={styles.successMessage}>
            Nous avons envoyé un lien de réinitialisation à {email}. Vérifiez
            votre boîte de réception et suivez les instructions.
          </Text>

          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Retour à la connexion</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backIcon}>
          <ArrowLeft size={24} color={Theme.colors.neutral[600]} />
        </TouchableOpacity>
        <Text style={styles.title}>Mot de passe oublié</Text>
        <Text style={styles.subtitle}>
          Entrez votre adresse email et nous vous enverrons un lien pour
          réinitialiser votre mot de passe.
        </Text>
      </View>

      {/* Global Error */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <View style={[styles.inputWrapper, emailError && styles.inputError]}>
          <Mail
            size={20}
            color={Theme.colors.neutral[400]}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="votre@email.com"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
        </View>
        {emailError && <Text style={styles.fieldErrorText}>{emailError}</Text>}
      </View>

      {/* Reset Button */}
      <TouchableOpacity
        style={[styles.resetButton, isLoading && styles.resetButtonDisabled]}
        onPress={handleResetPassword}
        disabled={isLoading}
      >
        <Text style={styles.resetButtonText}>
          {isLoading ? 'Envoi...' : 'Envoyer le lien'}
        </Text>
      </TouchableOpacity>

      {/* Back to Login */}
      <TouchableOpacity onPress={onBack} style={styles.backToLogin}>
        <Text style={styles.backToLoginText}>Retour à la connexion</Text>
      </TouchableOpacity>
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
    marginBottom: Theme.spacing['2xl'],
  },
  backIcon: {
    marginBottom: Theme.spacing.lg,
  },
  title: {
    ...createTextStyle('3xl', 'bold', Theme.colors.neutral[900]),
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    ...createTextStyle('base', 'normal', Theme.colors.neutral[500]),
    lineHeight: 24,
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
    marginBottom: Theme.spacing.xl,
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
  fieldErrorText: {
    ...createTextStyle('xs', 'normal', Theme.colors.error[500]),
    marginTop: Theme.spacing.xs,
  },
  resetButton: {
    ...createButtonStyle('primary'),
    marginBottom: Theme.spacing.xl,
  },
  resetButtonDisabled: {
    backgroundColor: Theme.colors.neutral[300],
  },
  resetButtonText: {
    ...createTextStyle('base', 'semibold', Theme.colors.white),
  },
  backToLogin: {
    alignSelf: 'center',
  },
  backToLoginText: {
    ...createTextStyle('base', 'medium', Theme.colors.primary[500]),
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    ...createTextStyle('2xl', 'bold', Theme.colors.neutral[900]),
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  successMessage: {
    ...createTextStyle('base', 'normal', Theme.colors.neutral[500]),
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Theme.spacing['2xl'],
  },
  backButton: {
    ...createButtonStyle('primary'),
    width: '100%',
  },
  backButtonText: {
    ...createTextStyle('base', 'semibold', Theme.colors.white),
  },
});


