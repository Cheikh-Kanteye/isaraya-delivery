import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Truck, Package, Zap, CreditCard, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import AuthLoader from '@/components/common/AuthLoader';
import { BaseUser } from '@/types/auth';

export default function WelcomeScreenClean() {
  const router = useRouter();
  const { isAuthenticated, entity, isLoading } = useAuth<BaseUser>();

  useEffect(() => {
    // Redirect authenticated users to appropriate screens
    if (isAuthenticated && entity) {
      if (entity.role === 'client') {
        router.replace('/(client)/(tabs)');
      } else if (entity.role === 'deliver') {
        router.replace('/(deliver)/(tabs)');
      }
      return;
    }
  }, [isAuthenticated, entity, router]);

  // Show loading indicator while authentication is being checked
  if (isLoading) {
    return <AuthLoader message="Vérification de vos informations..." />;
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Header épuré */}
          <View style={styles.header}>
            <Text style={styles.appTitle}>Livraison</Text>
            <Text style={styles.subtitle}>
              Choisissez votre profil pour commencer
            </Text>
          </View>

          {/* Cartes de profil épurées */}
          <View style={styles.profileSection}>
            <TouchableOpacity
              style={[styles.profileCard, styles.clientCard]}
              onPress={() => router.push('/(client)/client-auth')}
              activeOpacity={0.95}
            >
              <View style={styles.cardContent}>
                <View style={[styles.iconContainer, styles.clientIcon]}>
                  <Package size={28} color="#6366F1" strokeWidth={2} />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>Client</Text>
                  <Text style={styles.cardDescription}>
                    Commander une livraison
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.profileCard, styles.driverCard]}
              onPress={() => router.push('/(deliver)/deliver-auth')}
              activeOpacity={0.95}
            >
              <View style={styles.cardContent}>
                <View style={[styles.iconContainer, styles.driverIcon]}>
                  <Truck size={28} color="#10B981" strokeWidth={2} />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>Livreur</Text>
                  <Text style={styles.cardDescription}>
                    Effectuer des livraisons
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Fonctionnalités épurées */}
          <View style={styles.featuresSection}>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Zap size={20} color="#F59E0B" strokeWidth={2} />
              </View>
              <Text style={styles.featureText}>Livraison express</Text>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <CreditCard size={20} color="#F59E0B" strokeWidth={2} />
              </View>
              <Text style={styles.featureText}>Paiement mobile</Text>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <MapPin size={20} color="#F59E0B" strokeWidth={2} />
              </View>
              <Text style={styles.featureText}>Suivi en temps réel</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },

  // Header épuré
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Section des profils
  profileSection: {
    marginBottom: 48,
    gap: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  clientCard: {
    borderColor: '#E0E7FF',
    backgroundColor: '#FEFEFE',
  },
  driverCard: {
    borderColor: '#D1FAE5',
    backgroundColor: '#FEFEFE',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  clientIcon: {
    backgroundColor: '#EEF2FF',
  },
  driverIcon: {
    backgroundColor: '#ECFDF5',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  cardDescription: {
    fontSize: 15,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 20,
  },

  // Section des fonctionnalités
  featuresSection: {
    gap: 20,
    paddingHorizontal: 8,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    letterSpacing: -0.1,
  },
});
