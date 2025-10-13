import React, { useState, useRef, useEffect } from 'react';
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
  DollarSign,
  Calendar,
  CreditCard,
  Eye,
  ChevronRight,
  TrendingUp,
  Package,
  Clock,
} from 'lucide-react-native';
import { Theme, createTextStyle } from '@/constants/theme';
import { deliveryService, DelivererStats } from '@/services/deliveryService';

export default function EarningsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');
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
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const statsData = await deliveryService.getDelivererStats();
        setStats(statsData.payload);
      } catch (error) {
        console.error('Error fetching earnings:', error);
        Alert.alert('Erreur', 'Impossible de charger les statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
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

  // Calculer les données selon la période sélectionnée
  const getCurrentData = () => {
    if (!stats) {
      return {
        total: 0,
        deliveries: 0,
        hours: '0h 0m',
        average: 0,
      };
    }

    switch (selectedPeriod) {
      case 'day':
        return {
          total: stats.recent?.[0]?.amount || 0,
          deliveries: stats.recent?.[0]?.deliveries || 0,
          hours: stats.recent?.[0]?.hours || '0h 0m',
          average: stats.average || 0,
        };
      case 'week':
        return {
          total: stats.total || 0,
          deliveries: stats.deliveries || 0,
          hours: stats.hours || '0h 0m',
          average: stats.average || 0,
        };
      case 'month':
        // Pour le mois, on peut estimer en multipliant par 4 les données hebdomadaires
        return {
          total: (stats.total || 0) * 4,
          deliveries: (stats.deliveries || 0) * 4,
          hours: '0h 0m', // Calculer si nécessaire
          average: stats.average || 0,
        };
      default:
        return {
          total: 0,
          deliveries: 0,
          hours: '0h 0m',
          average: 0,
        };
    }
  };

  const currentData = getCurrentData();

  const recentEarnings = stats?.recent || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
            <Text style={styles.headerTitle}>Gains</Text>
            <TouchableOpacity style={styles.paymentButton}>
              <CreditCard
                size={Theme.layout.iconSize.sm}
                color={Theme.colors.primary[500]}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Period Selector */}
          <View style={styles.periodSelector}>
            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'day' && styles.activePeriodButton,
              ]}
              onPress={() => setSelectedPeriod('day')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === 'day' && styles.activePeriodButtonText,
                ]}
              >
                Jour
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'week' && styles.activePeriodButton,
              ]}
              onPress={() => setSelectedPeriod('week')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === 'week' && styles.activePeriodButtonText,
                ]}
              >
                Semaine
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'month' && styles.activePeriodButton,
              ]}
              onPress={() => setSelectedPeriod('month')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === 'month' && styles.activePeriodButtonText,
                ]}
              >
                Mois
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Earnings Card */}
        <Animated.View
          style={[
            styles.earningsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.mainEarningsCard}>
            <View style={styles.earningsHeader}>
              <DollarSign
                size={Theme.layout.iconSize.lg}
                color={Theme.colors.primary[500]}
                strokeWidth={2}
              />
              <Text style={styles.earningsTitle}>Total</Text>
            </View>

            <Text style={styles.earningsAmount} numberOfLines={1} adjustsFontSizeToFit>
              {loading ? '...' : formatCurrency(currentData.total)}
            </Text>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Package
                  size={Theme.layout.iconSize.md}
                  color={Theme.colors.accent[500]}
                  strokeWidth={2}
                />
                <Text style={styles.statValue}>{loading ? '...' : currentData.deliveries}</Text>
                <Text style={styles.statLabel}>Livraisons</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Clock
                  size={Theme.layout.iconSize.md}
                  color={Theme.colors.secondary[500]}
                  strokeWidth={2}
                />
                <Text style={styles.statValue}>{loading ? '...' : currentData.hours}</Text>
                <Text style={styles.statLabel}>Temps actif</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <TrendingUp
                  size={Theme.layout.iconSize.md}
                  color={Theme.colors.success[500]}
                  strokeWidth={2}
                />
                <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
                  {loading ? '...' : formatCurrency(currentData.average)}
                </Text>
                <Text style={styles.statLabel}>Par livraison</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Recent Earnings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historique récent</Text>
          <View style={styles.recentEarningsCard}>
            <View style={styles.recentHeader}>
              <TouchableOpacity style={styles.viewAllButton} activeOpacity={0.7}>
                <Eye
                  size={Theme.layout.iconSize.xs}
                  color={Theme.colors.primary[500]}
                  strokeWidth={2}
                />
                <Text style={styles.viewAllText}>Voir tout</Text>
              </TouchableOpacity>
            </View>

            {recentEarnings.map((earning, index) => (
              <TouchableOpacity
                key={earning.id}
                style={[
                  styles.earningItem,
                  index === recentEarnings.length - 1 && styles.earningItemLast,
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.earningLeft}>
                  <Calendar
                    size={Theme.layout.iconSize.sm}
                    color={Theme.colors.neutral[500]}
                    strokeWidth={2}
                  />
                  <View style={styles.earningInfo}>
                    <Text style={styles.earningDateText}>
                      {formatDate(earning.date)}
                    </Text>
                    <Text style={styles.earningDetails}>
                      {earning.deliveries} livraisons · {earning.hours}
                    </Text>
                  </View>
                </View>

                <View style={styles.earningRight}>
                  <Text style={styles.earningAmount} numberOfLines={1} adjustsFontSizeToFit>
                    {formatCurrency(earning.amount)}
                  </Text>
                  <ChevronRight
                    size={Theme.layout.iconSize.sm}
                    color={Theme.colors.neutral[300]}
                    strokeWidth={2}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Payment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prochain paiement</Text>
          <View style={styles.paymentInfoCard}>
            <View style={styles.paymentHeader}>
              <View style={styles.paymentDateContainer}>
                <Text style={styles.paymentDate}>Prochain paiement</Text>
                <Text style={styles.paymentAmount} numberOfLines={1} adjustsFontSizeToFit>
                  {loading ? '...' : formatCurrency(stats?.total || 0)}
                </Text>
              </View>
            </View>

            <View style={styles.paymentDivider} />

            <View style={styles.paymentDetails}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Gains de la semaine</Text>
                <Text style={styles.paymentValue}>
                  {loading ? '...' : formatCurrency(stats?.total || 0)}
                </Text>
              </View>

              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Frais de service (5%)</Text>
                <Text style={styles.paymentValue}>
                  -{loading ? '...' : formatCurrency(Math.round((stats?.total || 0) * 0.05))}
                </Text>
              </View>

              <View style={styles.paymentDivider} />

              <View style={styles.paymentRow}>
                <Text style={styles.paymentTotalLabel}>Net à recevoir</Text>
                <Text style={styles.paymentTotalValue} numberOfLines={1} adjustsFontSizeToFit>
                  {loading ? '...' : formatCurrency(Math.round((stats?.total || 0) * 0.95))}
                </Text>
              </View>
            </View>
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
    paddingBottom: Theme.spacing['4xl'],
    paddingHorizontal: Theme.spacing['2xl'],
    backgroundColor: Theme.colors.primary[50],
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing['2xl'],
  },
  headerTitle: {
    ...createTextStyle('3xl', 'bold', Theme.colors.neutral[900]),
    letterSpacing: -0.5,
  },
  paymentButton: {
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.full,
  },

  // Period Selector
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.white,
    padding: 4,
    borderRadius: Theme.borderRadius.xl,
    gap: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
  },
  activePeriodButton: {
    backgroundColor: Theme.colors.primary[500],
  },
  periodButtonText: {
    ...createTextStyle('sm', 'semibold', Theme.colors.neutral[500]),
  },
  activePeriodButtonText: {
    color: Theme.colors.white,
  },

  // Main Earnings Card
  earningsContainer: {
    marginTop: -30,
    paddingHorizontal: Theme.spacing['2xl'],
    marginBottom: Theme.spacing['3xl'],
  },
  mainEarningsCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.xl,
  },
  earningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.lg,
  },
  earningsTitle: {
    ...createTextStyle('lg', 'semibold', Theme.colors.neutral[900]),
  },
  earningsAmount: {
    ...createTextStyle('4xl', 'bold', Theme.colors.primary[500]),
    marginBottom: Theme.spacing.xl,
    flexShrink: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: Theme.colors.neutral[200],
  },
  statValue: {
    ...createTextStyle('lg', 'bold', Theme.colors.neutral[900]),
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.xs,
    flexShrink: 1,
  },
  statLabel: {
    ...createTextStyle('xs', 'medium', Theme.colors.neutral[500]),
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

  // Recent Earnings Card
  recentEarningsCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.xl,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  viewAllText: {
    ...createTextStyle('sm', 'semibold', Theme.colors.primary[500]),
  },
  earningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[100],
  },
  earningItemLast: {
    borderBottomWidth: 0,
  },
  earningLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    flex: 1,
  },
  earningInfo: {
    flex: 1,
  },
  earningDateText: {
    ...createTextStyle('base', 'semibold', Theme.colors.neutral[900]),
    marginBottom: 2,
  },
  earningDetails: {
    ...createTextStyle('xs', 'medium', Theme.colors.neutral[500]),
  },
  earningRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  earningAmount: {
    ...createTextStyle('base', 'bold', Theme.colors.primary[500]),
    flexShrink: 1,
  },

  // Payment Info Card
  paymentInfoCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.xl,
  },
  paymentHeader: {
    marginBottom: Theme.spacing.lg,
  },
  paymentDateContainer: {
    gap: Theme.spacing.xs,
  },
  paymentDate: {
    ...createTextStyle('sm', 'medium', Theme.colors.neutral[500]),
  },
  paymentAmount: {
    ...createTextStyle('3xl', 'bold', Theme.colors.primary[500]),
    flexShrink: 1,
  },
  paymentDivider: {
    height: 1,
    backgroundColor: Theme.colors.neutral[200],
    marginVertical: Theme.spacing.lg,
  },
  paymentDetails: {
    gap: Theme.spacing.md,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    ...createTextStyle('sm', 'medium', Theme.colors.neutral[500]),
    flex: 1,
  },
  paymentValue: {
    ...createTextStyle('sm', 'semibold', Theme.colors.neutral[900]),
    flexShrink: 1,
  },
  paymentTotalLabel: {
    ...createTextStyle('base', 'bold', Theme.colors.neutral[900]),
    flex: 1,
  },
  paymentTotalValue: {
    ...createTextStyle('lg', 'bold', Theme.colors.primary[500]),
    flexShrink: 1,
  },
});