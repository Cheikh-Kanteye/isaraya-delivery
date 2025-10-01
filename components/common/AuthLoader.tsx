import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Theme, createTextStyle } from '@/constants/theme';

interface AuthLoaderProps {
  message?: string;
}

export default function AuthLoader({
  message = 'Chargement de votre profil...',
}: AuthLoaderProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Theme.colors.primary[500]} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    padding: Theme.spacing.xl,
  },
  message: {
    ...createTextStyle('base', 'medium', Theme.colors.neutral[700]),
    marginTop: Theme.spacing.md,
    textAlign: 'center',
  },
});
