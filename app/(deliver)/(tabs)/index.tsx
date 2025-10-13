import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Power,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Navigation,
  Phone,
  Package,
} from 'lucide-react-native';
import {
  Theme,
  createTextStyle,
} from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Deliver } from '@/types/auth';
import { deliveryService } from '@/services/deliveryService';
import { DelivererStats } from '@/services/deliveryService';

export default function HomeScreen() {
  const { entity: deliver, updateProfile } = useAuth<Deliver>();
  const [isOnline, setIsOnline] = useState(deliver?.isOnline || false);
  const [stats, setStats] = useState<DelivererStats | null>(null);
  const [pendingMissionsCount, setPendingMissionsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsResponse, pendingResponse] = await Promise.all([
          deliveryService.getDelivererStats(),
          deliveryService.getPendingMissions(),
        ]);
        
        setStats(statsResponse.payload);
        
        // Compter les missions en attente
        const pendingMissions = Array.isArray(pendingResponse.payload) 
          ? pendingResponse.payload 
          : pendingResponse.payload 
          ? [pendingResponse.payload] 
          : [];
        setPendingMissionsCount(pendingMissions.length);
      } catch (error) {
        console.error('Error fetching home data:', error);
        Alert.alert('Erreur', 'Impossible de charger les données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to format CFA currency
  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '0 FCFA';
    }
    return (
      new Intl.NumberFormat('fr-FR', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount) + ' FCFA'
    );
  };

  const toggleOnlineStatus = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);

    try {
      await updateProfile({
        firstName: deliver?.firstName || deliver?.name?.split(' ')[0],
        lastName:
          deliver?.lastName || deliver?.name?.split(' ').slice(1).join(' '),
        email: deliver?.email,
        phone: deliver?.phoneNumber,
        role: deliver?.role,
        isActive: deliver?.isActive,
        isOnline: newStatus,
      });
    } catch (error) {
      // Revert on error
      console.log(error);
      setIsOnline(!newStatus);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Animated.View
            style={[
              styles.heroContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View>
              <Text style={styles.greeting}>
                Bonjour, {deliver?.name?.split(' ')[0] || 'Livreur'}
              </Text>
              <Text style={styles.subGreeting}>
                Prêt pour une nouvelle journée ?
              </Text>
            </View>
            <TouchableOpacity style={styles.supportButton}>
              <Phone
                size={Theme.layout.iconSize.sm}
                color={Theme.colors.neutral[500]}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Status Card */}
        <Animated.View
          style={[
            styles.statusContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusTitle}>Statut Livreur</Text>
              <View
                style={[
                  styles.statusBadge,
                  isOnline ? styles.onlineBadge : styles.offlineBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    isOnline ? styles.onlineText : styles.offlineText,
                  ]}
                >
                  {isOnline ? 'En Ligne' : 'Hors Ligne'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                isOnline ? styles.onlineButton : styles.offlineButton,
              ]}
              onPress={toggleOnlineStatus}
              activeOpacity={0.8}
            >
              <Power
                size={Theme.layout.iconSize.md}
                color={Theme.colors.white}
                strokeWidth={2}
              />
              <Text style={styles.toggleButtonText}>
                {isOnline ? 'Passer Hors Ligne' : 'Passer En Ligne'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques du jour</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <DollarSign
                size={Theme.layout.iconSize.lg}
                color={Theme.colors.primary[500]}
                strokeWidth={2}
              />
              <Text style={styles.statValue}>
                {loading ? '...' : stats?.recent?.[0]?.amount ? formatCurrency(stats.recent[0].amount) : '0'}
              </Text>
              <Text style={styles.statLabel}>Gains</Text>
            </View>

            <View style={styles.statCard}>
              <Package
                size={Theme.layout.iconSize.lg}
                color={Theme.colors.accent[500]}
                strokeWidth={2}
              />
              <Text style={styles.statValue}>
                {loading ? '...' : stats?.recent?.[0]?.deliveries || '0'}
              </Text>
              <Text style={styles.statLabel}>Livraisons</Text>
            </View>

            <View style={styles.statCard}>
              <Clock
                size={Theme.layout.iconSize.lg}
                color={Theme.colors.secondary[500]}
                strokeWidth={2}
              />
              <Text style={styles.statValue}>
                {loading ? '...' : stats?.recent?.[0]?.hours || '0h 0m'}
              </Text>
              <Text style={styles.statLabel}>Temps actif</Text>
            </View>

            <View style={styles.statCard}>
              <Star
                size={Theme.layout.iconSize.lg}
                color={Theme.colors.error[500]}
                strokeWidth={2}
              />
              <Text style={styles.statValue}>
                {deliver?.rating || 'N/A'}
              </Text>
              <Text style={styles.statLabel}>Note</Text>
            </View>
          </View>
        </View>

        {/* Zone Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zone de livraison</Text>
          <View style={styles.zoneCard}>
            <View style={styles.zoneHeader}>
              <MapPin
                size={Theme.layout.iconSize.md}
                color={Theme.colors.primary[500]}
                strokeWidth={2}
              />
              <View style={styles.zoneInfo}>
                <Text style={styles.zoneLocation}>Zone de livraison</Text>
                <Text style={styles.zoneDetails}>
                  {loading ? 'Chargement...' : `${pendingMissionsCount} commande${pendingMissionsCount > 1 ? 's' : ''} disponible${pendingMissionsCount > 1 ? 's' : ''}`}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.navigateButton}
              onPress={() => router.push('/(deliver)/map')}
              activeOpacity={0.7}
            >
              <Navigation
                size={Theme.layout.iconSize.sm}
                color={Theme.colors.primary[500]}
                strokeWidth={2}
              />
              <Text style={styles.navigateText}>Voir la carte</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },

  // Hero Section
  heroSection: {
    paddingTop: Theme.spacing.xl,
    paddingBottom: Theme.spacing['5xl'],
    paddingHorizontal: Theme.spacing['2xl'],
    backgroundColor: Theme.colors.primary[50],
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    ...createTextStyle('3xl', 'bold', Theme.colors.neutral[900]),
    marginBottom: Theme.spacing.xs,
    letterSpacing: -0.5,
  },
  subGreeting: {
    ...createTextStyle('base', 'medium', Theme.colors.neutral[500]),
  },
  supportButton: {
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.full,
  },

  // Status Section
  statusContainer: {
    marginTop: -40,
    paddingHorizontal: Theme.spacing['2xl'],
    marginBottom: Theme.spacing['3xl'],
  },
  statusCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.xl,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  statusTitle: {
    ...createTextStyle('lg', 'semibold', Theme.colors.neutral[900]),
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
  },
  onlineBadge: {
    backgroundColor: Theme.colors.success[100],
  },
  offlineBadge: {
    backgroundColor: Theme.colors.error[100],
  },
  statusBadgeText: {
    ...createTextStyle('sm', 'semibold'),
  },
  onlineText: {
    color: Theme.colors.success[700],
  },
  offlineText: {
    color: Theme.colors.error[700],
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.lg,
    gap: Theme.spacing.md,
  },
  onlineButton: {
    backgroundColor: Theme.colors.error[500],
  },
  offlineButton: {
    backgroundColor: Theme.colors.primary[500],
  },
  toggleButtonText: {
    ...createTextStyle('base', 'semibold', Theme.colors.white),
  },

  // Section
  section: {
    paddingHorizontal: Theme.spacing['2xl'],
    marginBottom: Theme.spacing['2xl'],
  },
  sectionTitle: {
    ...createTextStyle('lg', 'semibold', Theme.colors.neutral[900]),
    marginBottom: Theme.spacing.md,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.xl,
    alignItems: 'center',
  },
  statValue: {
    ...createTextStyle('xl', 'bold', Theme.colors.neutral[900]),
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.xs,
  },
  statLabel: {
    ...createTextStyle('sm', 'medium', Theme.colors.neutral[500]),
  },

  // Zone Card
  zoneCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.xl,
  },
  zoneHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  zoneInfo: {
    flex: 1,
  },
  zoneLocation: {
    ...createTextStyle('lg', 'semibold', Theme.colors.neutral[900]),
    marginBottom: Theme.spacing.xs,
  },
  zoneDetails: {
    ...createTextStyle('sm', 'medium', Theme.colors.neutral[500]),
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    backgroundColor: Theme.colors.primary[50],
    borderRadius: Theme.borderRadius.lg,
    gap: Theme.spacing.sm,
  },
  navigateText: {
    ...createTextStyle('base', 'semibold', Theme.colors.primary[500]),
  },
});