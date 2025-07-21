import { Stack } from 'expo-router';

const Layout = () => (
  <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="client-auth" />
    <Stack.Screen name="(tabs)" />
  </Stack>
);

export default Layout;


