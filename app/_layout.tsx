import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { StatusBar } from 'react-native';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';

const RootLayout = () => {
  const router = useRouter();

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const { hostname, path, queryParams } = Linking.parse(event.url);

      if (hostname === 'payment' || path?.includes('payment')) {
        const ref = queryParams?.ref;
        const status = queryParams?.status;

        if (ref) {
          router.push({
            pathname: '/(client)/(tabs)',
            params: { paymentRef: ref, paymentStatus: status }
          });
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

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
