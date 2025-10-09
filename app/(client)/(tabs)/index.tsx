import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Truck, Bell, Zap, ChevronRight } from 'lucide-react-native';
import { Theme } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { Client } from '@/types/auth';
import { useRouter } from 'expo-router';

export default function ClientHomeScreenImproved() {
  const { entity: client } = useAuth<Client>();
  const router = useRouter();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header simplifié */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>
              {getGreeting()}, {client?.firstName?.split(' ')[0] || 'Client'} 👋
            </Text>
            <Text style={styles.subGreeting}>
              Prêt pour une nouvelle livraison ?
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color={Theme.colors.neutral[600]} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Hero Section - Action Principale */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Commander une livraison</Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/(client)/(tabs)/search')}
              activeOpacity={0.9}
            >
              <Zap size={24} color={Theme.colors.white} strokeWidth={2.5} />
              <Text style={styles.primaryButtonText}>Commander maintenant</Text>
              <ChevronRight size={20} color={Theme.colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Actions Rapides Simplifiées */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Type de livraison</Text>

          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.quickActionCard, styles.expressCard]}
              onPress={() =>
                router.push('/(client)/(tabs)/search?type=express')
              }
              activeOpacity={0.8}
            >
              <View style={styles.quickActionHeader}>
                <View style={[styles.quickActionIcon, styles.expressIcon]}>
                  <Zap
                    size={28}
                    color={Theme.colors.primary[600]}
                    strokeWidth={2.5}
                  />
                </View>
                <View style={styles.quickActionBadge}>
                  <Text style={styles.badgeText}>Populaire</Text>
                </View>
              </View>
              <Text style={styles.quickActionTitle}>Express</Text>
              <Text style={styles.quickActionSubtitle}>
                Livraison en 30 min
              </Text>
              <Text style={styles.quickActionPrice}>
                À partir de 2 000 FCFA
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, styles.standardCard]}
              onPress={() =>
                router.push('/(client)/(tabs)/search?type=standard')
              }
              activeOpacity={0.8}
            >
              <View style={styles.quickActionHeader}>
                <View style={[styles.quickActionIcon, styles.standardIcon]}>
                  <Truck
                    size={28}
                    color={Theme.colors.secondary[600]}
                    strokeWidth={2.5}
                  />
                </View>
              </View>
              <Text style={styles.quickActionTitle}>Standard</Text>
              <Text style={styles.quickActionSubtitle}>
                Livraison dans la journée
              </Text>
              <Text style={styles.quickActionPrice}>
                À partir de 1 500 FCFA
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section d'aide rapide */}
        <View style={styles.helpSection}>
          <TouchableOpacity
            style={styles.helpCard}
            onPress={() => router.push('/help')}
            activeOpacity={0.8}
          >
            <Text style={styles.helpTitle}>Besoin d&apos;aide ?</Text>
            <Text style={styles.helpSubtitle}>
              Consultez notre guide ou contactez le support
            </Text>
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

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: Theme.colors.white,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: Theme.colors.neutral[900],
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: 14,
    fontWeight: '400',
    color: Theme.colors.neutral[600],
    lineHeight: 22,
  },
  notificationButton: {
    position: 'relative',
    padding: 12,
    backgroundColor: Theme.colors.neutral[100],
    borderRadius: 12,
    marginTop: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: Theme.colors.primary[500],
    borderRadius: 4,
  },

  // Hero Section
  heroSection: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    backgroundColor: Theme.colors.white,
  },
  heroContent: {
    backgroundColor: Theme.colors.primary[50],
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.neutral[900],
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: Theme.colors.neutral[600],
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary[600],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 12,
    shadowColor: Theme.colors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Theme.colors.white,
    letterSpacing: -0.2,
  },

  // Quick Actions
  quickActionsSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Theme.colors.neutral[900],
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: Theme.colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  expressCard: {
    borderColor: Theme.colors.primary[200],
    backgroundColor: Theme.colors.primary[50],
  },
  standardCard: {
    borderColor: Theme.colors.secondary[200],
    backgroundColor: Theme.colors.secondary[50],
  },
  quickActionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expressIcon: {
    backgroundColor: Theme.colors.primary[100],
  },
  standardIcon: {
    backgroundColor: Theme.colors.secondary[100],
  },
  quickActionBadge: {
    backgroundColor: Theme.colors.accent[500],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Theme.colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickActionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.neutral[900],
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  quickActionSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: Theme.colors.neutral[600],
    marginBottom: 8,
    lineHeight: 18,
  },
  quickActionPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.neutral[700],
  },

  // Drivers Section
  driversSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  driversHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  driversHeaderLeft: {
    flex: 1,
  },
  driversCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  driversCountText: {
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors.secondary[600],
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.primary[500],
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '400',
    color: Theme.colors.neutral[500],
  },
  driversGrid: {
    gap: 12,
  },
  driverCard: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.neutral[200],
  },
  driverImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.neutral[900],
    marginBottom: 4,
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.accent[600],
  },
  driverMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  driverMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  driverMetaText: {
    fontSize: 12,
    fontWeight: '500',
    color: Theme.colors.neutral[500],
  },

  // Help Section
  helpSection: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  helpCard: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[200],
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.neutral[900],
    marginBottom: 4,
  },
  helpSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: Theme.colors.neutral[600],
    textAlign: 'center',
  },

  // Schedule Option
  scheduleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[200],
  },
  scheduleIcon: {
    width: 40,
    height: 40,
    backgroundColor: Theme.colors.accent[100],
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.neutral[900],
    marginBottom: 2,
  },
  scheduleSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: Theme.colors.neutral[600],
  },
});
