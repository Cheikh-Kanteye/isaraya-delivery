import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Power,
  MapPin,
  Clock,
  DollarSign,
  Star,
  TrendingUp,
  Navigation,
  Phone,
  Package,
} from 'lucide-react-native';
import {
  Theme,
  createCardStyle,
  createTextStyle,
  createButtonStyle,
} from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Deliver } from '@/types/auth';

export default function HomeScreen() {
  const { entity: deliver, updateProfile } = useAuth<Deliver>();
  const [isOnline, setIsOnline] = useState(deliver?.isOnline || false);
  const router = useRouter();

  // Helper function to format CFA currency
  const formatCurrency = (amount: number) => {
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
      console.log(deliver);

      Reflect.deleteProperty(deliver!, 'createdAt');
      Reflect.deleteProperty(deliver!, 'updatedAt');

      await updateProfile({
        ...deliver,
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
        {/* Header */}
        <View style={styles.header}>
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
            />
          </TouchableOpacity>
        </View>

        {/* Status Card */}
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
          >
            <Power size={Theme.layout.iconSize.md} color={Theme.colors.white} />
            <Text style={styles.toggleButtonText}>
              {isOnline ? 'Passer Hors Ligne' : 'Passer En Ligne'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <DollarSign
                  size={Theme.layout.iconSize.sm}
                  color={Theme.colors.primary[500]}
                />
              </View>
              <Text style={styles.statValue}>{formatCurrency(83000)}</Text>
              <Text style={styles.statLabel}>Aujourd&apos;hui</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Package
                  size={Theme.layout.iconSize.sm}
                  color={Theme.colors.accent[500]}
                />
              </View>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Livraisons</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Clock
                  size={Theme.layout.iconSize.sm}
                  color={Theme.colors.secondary[500]}
                />
              </View>
              <Text style={styles.statValue}>6h 45m</Text>
              <Text style={styles.statLabel}>Temps actif</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Star
                  size={Theme.layout.iconSize.sm}
                  color={Theme.colors.error[500]}
                />
              </View>
              <Text style={styles.statValue}>{deliver?.rating || '4.8'}</Text>
              <Text style={styles.statLabel}>Note moyenne</Text>
            </View>
          </View>
        </View>

        {/* Zone Info */}
        <View style={styles.zoneCard}>
          <View style={styles.zoneHeader}>
            <MapPin
              size={Theme.layout.iconSize.sm}
              color={Theme.colors.neutral[500]}
            />
            <Text style={styles.zoneTitle}>Zone de Livraison</Text>
          </View>
          <Text style={styles.zoneLocation}>Plateau, Dakar</Text>
          <Text style={styles.zoneDetails}>
            8 commandes disponibles dans un rayon de 2 km
          </Text>

          <TouchableOpacity
            style={styles.navigateButton}
            onPress={() => router.push('/(deliver)/map')}
          >
            <Navigation
              size={Theme.layout.iconSize.xs}
              color={Theme.colors.primary[500]}
            />
            <Text style={styles.navigateText}>Voir la carte</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.lg,
    backgroundColor: Theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[200],
  },
  greeting: {
    ...createTextStyle('2xl', 'bold', Theme.colors.neutral[900]),
  },
  subGreeting: {
    ...createTextStyle('base', 'normal', Theme.colors.neutral[500]),
    marginTop: 2,
  },
  supportButton: {
    padding: Theme.spacing.sm,
    backgroundColor: Theme.colors.neutral[100],
    borderRadius: Theme.borderRadius.md,
  },
  statusCard: {
    ...createCardStyle('md'),
    margin: Theme.spacing.lg,
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
    ...createTextStyle('sm', 'medium'),
  },
  onlineText: {
    color: Theme.colors.success[800],
  },
  offlineText: {
    color: Theme.colors.error[800],
  },
  toggleButton: {
    ...createButtonStyle('primary'),
    gap: Theme.spacing.sm,
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
  statsContainer: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  statCard: {
    ...createCardStyle('sm'),
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: Theme.layout.iconSize.xl,
    height: Theme.layout.iconSize.xl,
    backgroundColor: Theme.colors.neutral[100],
    borderRadius: Theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.sm,
  },
  statValue: {
    ...createTextStyle('xl', 'bold', Theme.colors.neutral[900]),
    marginBottom: Theme.spacing.xs,
  },
  statLabel: {
    ...createTextStyle('sm', 'normal', Theme.colors.neutral[500]),
  },
  zoneCard: {
    ...createCardStyle('md'),
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  zoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  zoneTitle: {
    ...createTextStyle('lg', 'semibold', Theme.colors.neutral[900]),
  },
  zoneLocation: {
    ...createTextStyle('base', 'medium', Theme.colors.neutral[700]),
    marginBottom: Theme.spacing.xs,
  },
  zoneDetails: {
    ...createTextStyle('sm', 'normal', Theme.colors.neutral[500]),
    marginBottom: Theme.spacing.lg,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  navigateText: {
    ...createTextStyle('base', 'medium', Theme.colors.primary[500]),
  },
  mapCard: {
    ...createCardStyle('md'),
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.xs,
  },
  mapTitle: {
    ...createTextStyle('lg', 'semibold', Theme.colors.neutral[900]),
  },
  mapSubtitle: {
    ...createTextStyle('sm', 'normal', Theme.colors.neutral[500]),
    marginBottom: Theme.spacing.lg,
  },
  mapContainer: {
    borderRadius: Theme.borderRadius.md,
    overflow: 'hidden',
  },
  performanceCard: {
    ...createCardStyle('md'),
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.lg,
  },
  performanceTitle: {
    ...createTextStyle('lg', 'semibold', Theme.colors.neutral[900]),
  },
  performanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performanceStat: {
    alignItems: 'center',
  },
  performanceValue: {
    ...createTextStyle('lg', 'bold', Theme.colors.primary[500]),
    marginBottom: Theme.spacing.xs,
  },
  performanceLabel: {
    ...createTextStyle('xs', 'normal', Theme.colors.neutral[500]),
    textAlign: 'center',
  },
  goalCard: {
    ...createCardStyle('md'),
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  goalTitle: {
    ...createTextStyle('lg', 'semibold', Theme.colors.neutral[900]),
    marginBottom: Theme.spacing.sm,
  },
  goalProgress: {
    ...createTextStyle('base', 'medium', Theme.colors.neutral[700]),
    marginBottom: Theme.spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: Theme.colors.neutral[200],
    borderRadius: Theme.borderRadius.sm,
    marginBottom: Theme.spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Theme.colors.primary[500],
    borderRadius: Theme.borderRadius.sm,
  },
  goalText: {
    ...createTextStyle('sm', 'normal', Theme.colors.neutral[500]),
  },
});
