import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react-native';
import { Theme, createTextStyle } from '@/constants/theme';

type PaymentStatus = 'success' | 'cancelled' | 'refunded' | 'error' | 'pending';

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    status?: string;
    ref?: string;
    amount?: string;
    message?: string;
    error?: string;
  }>();

  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Simuler un petit délai pour l'affichage
    const timer = setTimeout(() => {
      setIsProcessing(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const status = (params.status || 'pending') as PaymentStatus;
  const orderRef = params.ref || 'N/A';
  const amount = params.amount || '0';
  const message = params.message || 'Traitement du paiement...';

  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: CheckCircle,
          iconColor: Theme.colors.success[500],
          backgroundColor: Theme.colors.success[50],
          title: 'Paiement réussi',
          subtitle: 'Votre commande a été confirmée',
          primaryAction: 'Voir ma commande',
          primaryActionRoute: '/(client)/(tabs)/orders',
          secondaryAction: 'Retour à l\'accueil',
          secondaryActionRoute: '/(client)/(tabs)',
        };
      case 'cancelled':
        return {
          icon: XCircle,
          iconColor: Theme.colors.error[500],
          backgroundColor: Theme.colors.error[50],
          title: 'Paiement annulé',
          subtitle: 'Vous avez annulé le paiement',
          primaryAction: 'Réessayer',
          primaryActionRoute: '/(client)/(tabs)/search',
          secondaryAction: 'Retour à l\'accueil',
          secondaryActionRoute: '/(client)/(tabs)',
        };
      case 'refunded':
        return {
          icon: RefreshCw,
          iconColor: Theme.colors.warning[500],
          backgroundColor: Theme.colors.warning[50],
          title: 'Paiement remboursé',
          subtitle: 'Votre paiement a été remboursé',
          primaryAction: 'Voir ma commande',
          primaryActionRoute: '/(client)/(tabs)/orders',
          secondaryAction: 'Retour à l\'accueil',
          secondaryActionRoute: '/(client)/(tabs)',
        };
      case 'error':
        return {
          icon: AlertCircle,
          iconColor: Theme.colors.error[500],
          backgroundColor: Theme.colors.error[50],
          title: 'Erreur de paiement',
          subtitle: 'Une erreur est survenue lors du traitement',
          primaryAction: 'Réessayer',
          primaryActionRoute: '/(client)/(tabs)/search',
          secondaryAction: 'Contacter le support',
          secondaryActionRoute: '/help',
        };
      default:
        return {
          icon: AlertCircle,
          iconColor: Theme.colors.neutral[500],
          backgroundColor: Theme.colors.neutral[50],
          title: 'Paiement en cours',
          subtitle: 'Traitement de votre paiement...',
          primaryAction: 'Voir mes commandes',
          primaryActionRoute: '/(client)/(tabs)/orders',
          secondaryAction: 'Retour à l\'accueil',
          secondaryActionRoute: '/(client)/(tabs)',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  if (isProcessing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.white} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary[500]} />
          <Text style={styles.loadingText}>Traitement du paiement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.white} />
      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: config.backgroundColor }]}>
          <Icon size={80} color={config.iconColor} strokeWidth={1.5} />
        </View>

        {/* Title and Subtitle */}
        <Text style={styles.title}>{config.title}</Text>
        <Text style={styles.subtitle}>{config.subtitle}</Text>

        {/* Payment Details */}
        <View style={styles.detailsCard}>
          {message && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Message</Text>
              <Text style={styles.detailValue}>{message}</Text>
            </View>
          )}
          {orderRef && orderRef !== 'N/A' && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Référence</Text>
              <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="middle">
                {orderRef}
              </Text>
            </View>
          )}
          {amount && amount !== '0' && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Montant</Text>
              <Text style={[styles.detailValue, styles.amountValue]}>
                {new Intl.NumberFormat('fr-FR', {
                  style: 'decimal',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(Number(amount))} FCFA
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push(config.primaryActionRoute as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>{config.primaryAction}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push(config.secondaryActionRoute as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>{config.secondaryAction}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Theme.spacing.lg,
  },
  loadingText: {
    ...createTextStyle('base', 'medium', Theme.colors.neutral[600]),
  },
  content: {
    flex: 1,
    paddingHorizontal: Theme.spacing['2xl'],
    paddingVertical: Theme.spacing['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing['2xl'],
  },
  title: {
    ...createTextStyle('3xl', 'bold', Theme.colors.neutral[900]),
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    ...createTextStyle('base', 'normal', Theme.colors.neutral[600]),
    textAlign: 'center',
    marginBottom: Theme.spacing['2xl'],
  },
  detailsCard: {
    width: '100%',
    backgroundColor: Theme.colors.neutral[50],
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.xl,
    marginBottom: Theme.spacing['2xl'],
    gap: Theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xs,
  },
  detailLabel: {
    ...createTextStyle('sm', 'medium', Theme.colors.neutral[500]),
    flex: 1,
  },
  detailValue: {
    ...createTextStyle('sm', 'semibold', Theme.colors.neutral[900]),
    flex: 2,
    textAlign: 'right',
  },
  amountValue: {
    ...createTextStyle('base', 'bold', Theme.colors.primary[500]),
  },
  actionsContainer: {
    width: '100%',
    gap: Theme.spacing.md,
  },
  primaryButton: {
    backgroundColor: Theme.colors.primary[500],
    paddingVertical: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.xl,
    alignItems: 'center',
    shadowColor: Theme.colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    ...createTextStyle('base', 'bold', Theme.colors.white),
  },
  secondaryButton: {
    backgroundColor: Theme.colors.white,
    paddingVertical: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.neutral[300],
  },
  secondaryButtonText: {
    ...createTextStyle('base', 'semibold', Theme.colors.neutral[700]),
  },
});
