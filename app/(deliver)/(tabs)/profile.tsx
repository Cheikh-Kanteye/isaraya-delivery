
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  CreditCard,
  CircleHelp as HelpCircle,
  LogOut,
  ChevronRight,
  Star,
  Shield,
  Truck,
  Phone,
  Mail,
  MapPin,
  Package,
  TrendingUp,
} from 'lucide-react-native';
import { Theme, createTextStyle } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { Deliver } from '@/types/auth';
import { useRouter } from 'expo-router';
import { deliveryService, DelivererStats } from '@/services/deliveryService';

export default function ProfileScreen() {
  const { entity: deliver, logout } = useAuth<Deliver>();
  const router = useRouter();
  const [stats, setStats] = useState<DelivererStats | null>(null);
  const [loading, setLoading] = useState(true);

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

    // Fetch deliverer stats
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await deliveryService.getDelivererStats();
      // Extract the payload from the API response
      setStats(response.payload || response);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      id: 1,
      title: 'Informations personnelles',
      icon: User,
      subtitle: 'Gérer vos informations',
      action: () => console.log('Edit profile'),
    },
    {
      id: 2,
      title: 'Paiements',
      icon: CreditCard,
      subtitle: 'Méthodes de paiement',
      action: () => console.log('Payments'),
    },
    {
      id: 3,
      title: 'Aide et support',
      icon: HelpCircle,
      subtitle: 'FAQ et contact',
      action: () => router.navigate('/help'),
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!deliver) {
    return null;
  }

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
              styles.profileHeader,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.profilePictureContainer}>
              {deliver.profilePicture ? (
                <Image
                  source={{ uri: deliver.profilePicture }}
                  style={styles.profilePicture}
                />
              ) : (
                <View style={styles.profilePicture}>
                  <Text style={styles.initialsText}>
                    {(deliver.firstName + ' ' + deliver.lastName)
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </Text>
                </View>
              )}
              <View style={styles.verificationBadge}>
                <Shield
                  size={Theme.layout.iconSize.xs}
                  color={Theme.colors.primary[500]}
                  strokeWidth={2}
                />
              </View>
            </View>

            <Text style={styles.userName}>{deliver.name}</Text>

            <View style={styles.ratingContainer}>
              <Star
                size={Theme.layout.iconSize.sm}
                color={Theme.colors.accent[500]}
                fill={Theme.colors.accent[500]}
                strokeWidth={2}
              />
              <Text style={styles.rating}>{deliver.rating || '5.0'}</Text>
              <Text style={styles.ratingText}>
                ({(stats?.deliveries ?? deliver.totalDeliveries ?? 0)} livraisons)
              </Text>
            </View>

            <Text style={styles.memberSince}>
              Membre depuis{' '}
              {new Date(deliver.createdAt as string).toLocaleDateString('fr-FR', {
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </Animated.View>
        </View>

        {/* Stats Card */}
        <Animated.View
          style={[
            styles.statsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Package
                size={Theme.layout.iconSize.lg}
                color={Theme.colors.primary[500]}
                strokeWidth={2}
              />
              <Text style={styles.statValue}>
                {loading ? '...' : (stats?.deliveries ?? 0)}
              </Text>
              <Text style={styles.statLabel}>Livraisons</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <TrendingUp
                size={Theme.layout.iconSize.lg}
                color={Theme.colors.success[500]}
                strokeWidth={2}
              />
              <Text style={styles.statValue}>
                {loading ? '...' : `${(stats?.total ?? 0).toLocaleString('fr-FR')} F`}
              </Text>
              <Text style={styles.statLabel}>Total gagné</Text>
            </View>
          </View>
        </Animated.View>

        {/* Additional Stats */}
        {stats && (
          <View style={styles.section}>
            <View style={styles.additionalStatsCard}>
              <View style={styles.additionalStatRow}>
                <View style={styles.additionalStatItem}>
                  <Text style={styles.additionalStatLabel}>Heures</Text>
                  <Text style={styles.additionalStatValue}>{stats.hours ?? '0h'}</Text>
                </View>
                <View style={styles.additionalStatItem}>
                  <Text style={styles.additionalStatLabel}>Moyenne</Text>
                  <Text style={styles.additionalStatValue}>
                    {(stats.average ?? 0).toLocaleString('fr-FR')} F
                  </Text>
                </View>
              </View>
              {stats.goal && (
                <View style={styles.goalContainer}>
                  <View style={styles.goalHeader}>
                    <Text style={styles.goalLabel}>Objectif mensuel</Text>
                    <Text style={styles.goalPercentage}>
                      {(stats.goal.percentage ?? 0).toFixed(1)}%
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        { width: `${Math.min(stats.goal.percentage ?? 0, 100)}%` },
                      ]}
                    />
                  </View>
                  <View style={styles.goalFooter}>
                    <Text style={styles.goalText}>
                      {(stats.goal.current ?? 0).toLocaleString('fr-FR')} F
                    </Text>
                    <Text style={styles.goalText}>
                      {(stats.goal.target ?? 0).toLocaleString('fr-FR')} F
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations de contact</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Mail
                size={Theme.layout.iconSize.sm}
                color={Theme.colors.neutral[500]}
                strokeWidth={2}
              />
              <Text style={styles.infoText}>{deliver.email}</Text>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoItem}>
              <Phone
                size={Theme.layout.iconSize.sm}
                color={Theme.colors.neutral[500]}
                strokeWidth={2}
              />
              <Text style={styles.infoText}>{deliver.phoneNumber}</Text>
            </View>

            {deliver.address && (
              <>
                <View style={styles.infoDivider} />
                <View style={styles.infoItem}>
                  <MapPin
                    size={Theme.layout.iconSize.sm}
                    color={Theme.colors.neutral[500]}
                    strokeWidth={2}
                  />
                  <Text style={styles.infoText}>{deliver.address}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Vehicle Info */}
        {deliver.vehicle && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Véhicule</Text>
            <View style={styles.vehicleCard}>
              <View style={styles.vehicleContent}>
                <Truck
                  size={Theme.layout.iconSize.md}
                  color={Theme.colors.secondary[500]}
                  strokeWidth={2}
                />
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleType}>{deliver.vehicle}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      deliver.status === 'verified'
                        ? styles.verifiedBadge
                        : styles.pendingBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        deliver.status === 'verified'
                          ? styles.verifiedText
                          : styles.pendingText,
                      ]}
                    >
                      {deliver.status === 'verified' ? 'Vérifié' : 'En attente'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.section}>
          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  index === menuItems.length - 1 && styles.menuItemLast,
                ]}
                onPress={item.action}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <item.icon
                    size={Theme.layout.iconSize.sm}
                    color={Theme.colors.neutral[500]}
                    strokeWidth={2}
                  />
                  <View style={styles.menuItemContent}>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <ChevronRight
                  size={Theme.layout.iconSize.sm}
                  color={Theme.colors.neutral[300]}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <LogOut
              size={Theme.layout.iconSize.sm}
              color={Theme.colors.error[500]}
              strokeWidth={2}
            />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

        {/* Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version Livreur 1.2.3</Text>
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
    paddingTop: Theme.spacing['6xl'],
    paddingBottom: Theme.spacing['7xl'],
    paddingHorizontal: Theme.spacing['2xl'],
    backgroundColor: Theme.colors.primary[50],
  },
  profileHeader: {
    alignItems: 'center',
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: Theme.spacing.lg,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 4,
    borderColor: Theme.colors.white,
    backgroundColor: Theme.colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    ...createTextStyle('4xl', 'bold', Theme.colors.primary[500]),
    letterSpacing: 2,
  },
  verificationBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Theme.colors.primary[50],
  },
  userName: {
    ...createTextStyle('3xl', 'bold', Theme.colors.neutral[900]),
    marginBottom: Theme.spacing.sm,
    letterSpacing: -0.5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    marginBottom: Theme.spacing.xs,
  },
  rating: {
    ...createTextStyle('lg', 'bold', Theme.colors.accent[500]),
  },
  ratingText: {
    ...createTextStyle('sm', 'medium', Theme.colors.neutral[500]),
  },
  memberSince: {
    ...createTextStyle('sm', 'medium', Theme.colors.neutral[500]),
    opacity: 0.8,
  },

  // Stats Section
  statsContainer: {
    marginTop: -50,
    paddingHorizontal: Theme.spacing['2xl'],
    marginBottom: Theme.spacing['3xl'],
  },
  statsCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing['2xl'],
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: Theme.colors.neutral[200],
  },
  statValue: {
    ...createTextStyle('xl', 'bold', Theme.colors.neutral[900]),
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.xs,
  },
  statLabel: {
    ...createTextStyle('sm', 'medium', Theme.colors.neutral[500]),
    textAlign: 'center',
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

  // Info Card
  infoCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.xl,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
  },
  infoText: {
    ...createTextStyle('base', 'medium', Theme.colors.neutral[700]),
    flex: 1,
  },
  infoDivider: {
    height: 1,
    backgroundColor: Theme.colors.neutral[100],
  },

  // Vehicle Card
  vehicleCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.xl,
  },
  vehicleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.lg,
  },
  vehicleInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleType: {
    ...createTextStyle('lg', 'semibold', Theme.colors.neutral[900]),
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
  },
  verifiedBadge: {
    backgroundColor: Theme.colors.success[100],
  },
  pendingBadge: {
    backgroundColor: Theme.colors.warning[100],
  },
  statusText: {
    ...createTextStyle('xs', 'semibold'),
  },
  verifiedText: {
    color: Theme.colors.success[700],
  },
  pendingText: {
    color: Theme.colors.warning[700],
  },

  // Menu Card
  menuCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[100],
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Theme.spacing.lg,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    ...createTextStyle('base', 'semibold', Theme.colors.neutral[900]),
    marginBottom: 2,
  },
  menuItemSubtitle: {
    ...createTextStyle('sm', 'normal', Theme.colors.neutral[400]),
  },

  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.white,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.xl,
    gap: Theme.spacing.md,
  },
  logoutText: {
    ...createTextStyle('lg', 'semibold', Theme.colors.error[500]),
  },

  // Version
  versionContainer: {
    alignItems: 'center',
    paddingVertical: Theme.spacing['3xl'],
    paddingHorizontal: Theme.spacing['2xl'],
  },
  versionText: {
    ...createTextStyle('sm', 'medium', Theme.colors.neutral[400]),
  },

  // Additional Stats
  additionalStatsCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.xl,
  },
  additionalStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Theme.spacing.xl,
  },
  additionalStatItem: {
    alignItems: 'center',
  },
  additionalStatLabel: {
    ...createTextStyle('sm', 'medium', Theme.colors.neutral[500]),
    marginBottom: Theme.spacing.xs,
  },
  additionalStatValue: {
    ...createTextStyle('xl', 'bold', Theme.colors.neutral[900]),
  },

  // Goal Progress
  goalContainer: {
    marginTop: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.neutral[100],
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  goalLabel: {
    ...createTextStyle('sm', 'semibold', Theme.colors.neutral[700]),
  },
  goalPercentage: {
    ...createTextStyle('lg', 'bold', Theme.colors.primary[500]),
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Theme.colors.neutral[100],
    borderRadius: Theme.borderRadius.full,
    overflow: 'hidden',
    marginBottom: Theme.spacing.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Theme.colors.primary[500],
    borderRadius: Theme.borderRadius.full,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalText: {
    ...createTextStyle('xs', 'medium', Theme.colors.neutral[500]),
  },
});