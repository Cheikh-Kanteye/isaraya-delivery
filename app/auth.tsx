import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme, createTextStyle } from '@/constants/theme';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

type AuthMode = 'login' | 'register' | 'forgotPassword';
type UserType = 'CLIENT' | 'DELIVER';

const AuthScreen = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [userType, setUserType] = useState<UserType>('CLIENT');

  const renderForm = () => {
    switch (mode) {
      case 'login':
        return (
          <LoginForm
            onSwitchToRegister={() => setMode('register')}
            onForgotPassword={() => setMode('forgotPassword')}
            userType={userType}
          />
        );
      case 'register':
        return (
          <RegisterForm
            onSwitchToLogin={() => setMode('login')}
            userType={userType}
          />
        );
      case 'forgotPassword':
        return <ForgotPasswordForm onBack={() => setMode('login')} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, userType === 'CLIENT' && styles.activeTab]}
            onPress={() => setUserType('CLIENT')}
          >
            <Text
              style={[
                styles.tabText,
                userType === 'CLIENT' && styles.activeTabText,
              ]}
            >
              Client
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, userType === 'DELIVER' && styles.activeTab]}
            onPress={() => setUserType('DELIVER')}
          >
            <Text
              style={[
                styles.tabText,
                userType === 'DELIVER' && styles.activeTabText,
              ]}
            >
              Livreur
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>{renderForm()}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.neutral[50],
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.white,
    marginHorizontal: Theme.spacing.xl,
    marginTop: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.xs,
    shadowColor: Theme.colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
    borderRadius: Theme.borderRadius.md,
  },
  activeTab: {
    backgroundColor: Theme.colors.primary[500],
  },
  tabText: {
    ...createTextStyle('base', 'medium', Theme.colors.neutral[600]),
  },
  activeTabText: {
    color: Theme.colors.white,
  },
  formContainer: {
    flex: 1,
  },
});

export default AuthScreen;
