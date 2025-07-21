import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { StatusBar } from 'react-native';

const RootLayout = () => {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(client)" />
        <Stack.Screen name="(deliver)" />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="help" />
      </Stack>
      <StatusBar barStyle={'dark-content'} backgroundColor={'white'} />
    </AuthProvider>
  );
};

export default RootLayout;
