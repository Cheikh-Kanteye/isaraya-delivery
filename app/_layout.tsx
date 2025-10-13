import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { StatusBar } from 'react-native';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';

const RootLayout = () => {
  useEffect(() => {
    // Configure deep linking
    const subscription = Linking.addEventListener('url', (event) => {
      console.log('Deep link received:', event.url);
    });

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('App opened with deep link:', url);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(client)" />
        <Stack.Screen name="(deliver)" />
        <Stack.Screen name="payment" />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="help" />
      </Stack>
      <StatusBar barStyle={'dark-content'} backgroundColor={'white'} />
    </AuthProvider>
  );
};

export default RootLayout;
