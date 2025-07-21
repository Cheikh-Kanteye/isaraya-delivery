import { Stack } from 'expo-router';

const Layout = () => (
  <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="deliver-auth" />
    <Stack.Screen name="(tabs)" />
    <Stack.Screen name="map" />
  </Stack>
);

export default Layout;


