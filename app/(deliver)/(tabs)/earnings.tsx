import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  Target,
  Award,
  CreditCard,
  Eye,
  ChevronRight
} from 'lucide-react-native';
import { Theme, createCardStyle, createTextStyle, createButtonStyle } from '@/constants/theme';
// No direct use of useAuth or authService in this file, but keeping the import style consistent
// import { useAuth } from '@/contexts/AuthContext';
// import { authService } from '@/services/authService';

export default function EarningsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');

  // Helper function to format CFA currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' FCFA';
  };

  const earningsData = {
    day: {
      total: 83000,
      deliveries: 12,
      hours: '6h 45m',
      average: 6900,
    },
    week: {
      total: 548100,
      deliveries: 78,
      hours: '42h 30m',
      average: 7030,
    },
    month: {
      total: 2111070,
      deliveries: 298,
      hours: '165h 20m',
      average: 7080,
    },
  };

  const currentData = earningsData[selectedPeriod];

  const recentEarnings = [
    { id: '1', date: '2024-01-15', amount: 83000, deliveries: 12, hours: '6h 45m' },
    { id: '2', date: '2024-01-14', amount: 64200, deliveries: 9, hours: '5h 30m' },
    { id: '3', date: '2024-01-13', amount: 101600, deliveries: 14, hours: '8h 15m' },
    { id: '4', date: '2024-01-12', amount: 73000, deliveries: 11, hours: '6h 20m' },
    { id: '5', date: '2024-01-11', amount: 58100, deliveries: 8, hours: '4h 45m' },
  ];

  const weeklyGoal = {
    current: 548100,
    target: 650000,
    percentage: 84.3,
  };

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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gains</Text>
        <TouchableOpacity style={styles.paymentButton}>
          <CreditCard size={Theme.layout.iconSize.sm} color={Theme.colors.primary[500]} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'day' && styles.activePeriodButton]}
            onPress={() => setSelectedPeriod('day')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === 'day' && styles.activePeriodButtonText]}>
              Jour
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'week' && styles.activePeriodButton]}
            onPress={() => setSelectedPeriod('week')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === 'week' && styles.activePeriodButtonText]}>
              Semaine
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'month' && styles.activePeriodButton]}
            onPress={() => setSelectedPeriod('month')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === 'month' && styles.activePeriodButtonText]}>
              Mois
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Earnings Card */}
        <View style={styles.mainEarningsCard}>
          <View style={styles.earningsHeader}>
            <DollarSign size={Theme.layout.iconSize.md} color={Theme.colors.primary[500]} />
            <Text style={styles.earningsTitle}>Gains totaux</Text>
          </View>

          <Text style={styles.earningsAmount}>{formatCurrency(currentData.total)}</Text>

          <View style={styles.earningsStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentData.deliveries}</Text>
              <Text style={styles.statLabel}>Livraisons</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentData.hours}</Text>
              <Text style={styles.statLabel}>Temps actif</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatCurrency(currentData.average)}</Text>
              <Text style={styles.statLabel}>Par livraison</Text>
            </View>
          </View>
        </View>

        {/* Weekly Goal */}
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Target size={Theme.layout.iconSize.sm} color={Theme.colors.secondary[500]} />
            <Text style={styles.goalTitle}>Objectif Hebdomadaire</Text>
          </View>

          <View style={styles.goalProgress}>
            <View style={styles.goalAmounts}>
              <Text style={styles.goalCurrent}>{formatCurrency(weeklyGoal.current)}</Text>
              <Text style={styles.goalTarget}>/ {formatCurrency(weeklyGoal.target)}</Text>
            </View>

            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${weeklyGoal.percentage}%` }]} />
            </View>

            <Text style={styles.goalPercentage}>{weeklyGoal.percentage}% atteint</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <TrendingUp size={Theme.layout.iconSize.sm} color={Theme.colors.primary[500]} />
            </View>
            <Text style={styles.actionTitle}>Statistiques</Text>
            <Text style={styles.actionSubtitle}>Voir les détails</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <Award size={Theme.layout.iconSize.sm} color={Theme.colors.accent[500]} />
            </View>
            <Text style={styles.actionTitle}>Bonus</Text>
            <Text style={styles.actionSubtitle}>Voir les bonus</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Earnings */}
        <View style={styles.recentEarningsCard}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Historique récent</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Eye size={Theme.layout.iconSize.xs} color={Theme.colors.primary[500]} />
              <Text style={styles.viewAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {recentEarnings.map((earning) => (
            <TouchableOpacity key={earning.id} style={styles.earningItem}>
              <View style={styles.earningDate}>
                <Calendar size={Theme.layout.iconSize.xs} color={Theme.colors.neutral[500]} />
                <Text style={styles.earningDateText}>{formatDate(earning.date)}</Text>
              </View>

              <View style={styles.earningDetails}>
                <Text style={styles.earningAmount}>{formatCurrency(earning.amount)}</Text>
                <Text style={styles.earningInfo}>
                  {earning.deliveries} livraisons · {earning.hours}
                </Text>
              </View>

              <ChevronRight size={Theme.layout.iconSize.xs} color={Theme.colors.neutral[300]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Info */}
        <View style={styles.paymentInfoCard}>
          <View style={styles.paymentHeader}>
            <CreditCard size={Theme.layout.iconSize.sm} color={Theme.colors.neutral[500]} />
            <Text style={styles.paymentTitle}>Prochain paiement</Text>
          </View>

          <Text style={styles.paymentDate}>Vendredi 19 janvier</Text>
          <Text style={styles.paymentAmount}>{formatCurrency(548100)}</Text>

          <View style={styles.paymentDetails}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Gains de la semaine</Text>
              <Text style={styles.paymentValue}>{formatCurrency(548100)}</Text>
            </View>

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Frais de service</Text>
              <Text style={styles.paymentValue}>-{formatCurrency(27400)}</Text>
            </View>

            <View style={[styles.paymentRow, styles.paymentTotal]}>
              <Text style={styles.paymentTotalLabel}>Net à recevoir</Text>
              <Text style={styles.paymentTotalValue}>{formatCurrency(520700)}</Text>
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
  headerTitle: {
    ...createTextStyle('2xl', 'bold', Theme.colors.neutral[900]),
  },
  paymentButton: {
    padding: Theme.spacing.sm,
    backgroundColor: Theme.colors.neutral[100],
    borderRadius: Theme.borderRadius.md,
  },
  scrollView: {
    flex: 1,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.white,
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.lg,
    padding: 4,
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadows.sm,
  },
  periodButton: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
  },
  activePeriodButton: {
    backgroundColor: Theme.colors.primary[500],
  },
  periodButtonText: {
    ...createTextStyle('sm', 'medium', Theme.colors.neutral[500]),
  },
  activePeriodButtonText: {
    color: Theme.colors.white,
  },
  mainEarningsCard: {
    ...createCardStyle('md'),
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.lg,
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
  },
  earningsStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...createTextStyle('lg', 'semibold', Theme.colors.neutral[900]),
    marginBottom: Theme.spacing.xs,
  },
  statLabel: {
    ...createTextStyle('xs', 'normal', Theme.colors.neutral[500]),
  },
  goalCard: {
    ...createCardStyle('md'),
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.lg,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.lg,
  },
  goalTitle: {
    ...createTextStyle('lg', 'semibold', Theme.colors.neutral[900]),
  },
  goalProgress: {
    gap: Theme.spacing.sm,
  },
  goalAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Theme.spacing.xs,
  },
  goalCurrent: {
    ...createTextStyle('2xl', 'bold', Theme.colors.secondary[500]),
  },
  goalTarget: {
    ...createTextStyle('base', 'medium', Theme.colors.neutral[500]),
  },
  progressBar: {
    height: 8,
    backgroundColor: Theme.colors.neutral[200],
    borderRadius: Theme.borderRadius.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Theme.colors.secondary[500],
    borderRadius: Theme.borderRadius.sm,
  },
  goalPercentage: {
    ...createTextStyle('sm', 'medium', Theme.colors.secondary[500]),
    textAlign: 'right',
  },
  quickActions: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.lg,
  },
  actionCard: {
    ...createCardStyle('sm'),
    flex: 1,
    alignItems: 'center',
  },
  actionIcon: {
    width: Theme.layout.iconSize.xl,
    height: Theme.layout.iconSize.xl,
    backgroundColor: Theme.colors.neutral[100],
    borderRadius: Theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.sm,
  },
  actionTitle: {
    ...createTextStyle('sm', 'semibold', Theme.colors.neutral[900]),
    marginBottom: 2,
  },
  actionSubtitle: {
    ...createTextStyle('xs', 'normal', Theme.colors.neutral[500]),
  },
  recentEarningsCard: {
    ...createCardStyle('md'),
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.lg,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  recentTitle: {
    ...createTextStyle('lg', 'semibold', Theme.colors.neutral[900]),
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  viewAllText: {
    ...createTextStyle('sm', 'medium', Theme.colors.primary[500]),
  },
  earningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[100],
  },
  earningDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    width: 120,
  },
  earningDateText: {
    ...createTextStyle('sm', 'normal', Theme.colors.neutral[500]),
  },
  earningDetails: {
    flex: 1,
  },
  earningAmount: {
    ...createTextStyle('base', 'semibold', Theme.colors.neutral[900]),
    marginBottom: 2,
  },
  earningInfo: {
    ...createTextStyle('xs', 'normal', Theme.colors.neutral[500]),
  },
  paymentInfoCard: {
    ...createCardStyle('md'),
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.lg,
  },
  paymentTitle: {
    ...createTextStyle('lg', 'semibold', Theme.colors.neutral[900]),
  },
  paymentDate: {
    ...createTextStyle('sm', 'normal', Theme.colors.neutral[500]),
    marginBottom: Theme.spacing.xs,
  },
  paymentAmount: {
    ...createTextStyle('2xl', 'bold', Theme.colors.primary[500]),
    marginBottom: Theme.spacing.lg,
  },
  paymentDetails: {
    gap: Theme.spacing.sm,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    ...createTextStyle('sm', 'normal', Theme.colors.neutral[500]),
  },
  paymentValue: {
    ...createTextStyle('sm', 'medium', Theme.colors.neutral[900]),
  },
  paymentTotal: {
    paddingTop: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.neutral[200],
  },
  paymentTotalLabel: {
    ...createTextStyle('base', 'semibold', Theme.colors.neutral[900]),
  },
  paymentTotalValue: {
    ...createTextStyle('base', 'bold', Theme.colors.primary[500]),
  },
});


