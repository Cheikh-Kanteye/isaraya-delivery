import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

interface UserLocation {
  lat: number;
  lng: number;
}

export const useUserLocation = (
  fallback: UserLocation = { lat: 14.6937, lng: -17.4441 }
): {
  location: UserLocation | null;
  isLoading: boolean;
  error: string | null;
  startTracking: () => void;
  stopTracking: () => void;
} => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] =
    useState<Location.LocationSubscription | null>(null);

  const requestLocation = useCallback(async () => {
    try {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setLocation(fallback);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      });
    } catch (e) {
      setError('Failed to fetch location');
      setLocation(fallback);
    } finally {
      setIsLoading(false);
    }
  }, [fallback.lat, fallback.lng]);

  const startTracking = useCallback(() => {
    if (subscription) return;

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // Update every 5 seconds
        distanceInterval: 10, // Update every 10 meters
      },
      (loc) => {
        setLocation({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
        });
      }
    ).then((sub) => setSubscription(sub));
  }, [subscription]);

  const stopTracking = useCallback(() => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
  }, [subscription]);

  useEffect(() => {
    requestLocation();
    return () => stopTracking();
  }, [requestLocation, stopTracking]);

  return { location, isLoading, error, startTracking, stopTracking };
};
