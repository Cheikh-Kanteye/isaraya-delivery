import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Package,
  Clock,
  Phone,
  MessageCircle,
} from 'lucide-react-native';
import { Theme, createCardStyle, createTextStyle } from '@/constants/theme';
import { deliveryService } from '@/services/deliveryService';
import { DeliveryRequest } from '@/types/client';

export default function OrderTrackingScreen() {
  const params = useLocalSearchParams<{ missionId: string }>();
  const missionId = Array.isArray(params.missionId)
    ? params.missionId[0]
    : params.missionId;
  const router = useRouter();

  const [mission, setMission] = useState<DeliveryRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (missionId) {
      fetchMissionDetails();
      
      // Rafraîchissement automatique toutes les 15 secondes
      const interval = setInterval(() => {
        fetchMissionDetails(true);
      }, 15000);
      
      return () => clearInterval(interval);
    }
  }, [missionId]);

  // Rafraîchir les données quand l'écran devient actif
  useFocusEffect(
    useCallback(() => {
      if (missionId) {
        fetchMissionDetails(true);
      }
    }, [missionId])
  );

  const fetchMissionDetails = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log('Fetching mission with ID:', missionId);
      const response = await deliveryService.getMissionById(missionId);
      
      if (response?.payload) {
        setMission(response.payload);
      }
    } catch (error) {
      console.error('Error fetching mission:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchMissionDetails(true);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'IN_PROGRESS':
        return Theme.colors.primary[500];
      case 'DELIVERED':
        return Theme.colors.success[500];
      case 'PENDING':
        return Theme.colors.neutral[500];
      case 'ACCEPTED':
        return Theme.colors.accent[500];
      case 'CANCELLED':
        return Theme.colors.error[500];
      default:
        return Theme.colors.neutral[500];
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'IN_PROGRESS':
        return 'En cours de livraison';
      case 'DELIVERED':
        return 'Livré';
      case 'PENDING':
        return 'En attente d\'assignation';
      case 'ACCEPTED':
        return 'Accepté par le livreur';
      case 'CANCELLED':
        return 'Annulé';
      default:
        return status || 'Statut inconnu';
    }
  };

  const formatCurrency = (amount: number) => {
    return (
      new Intl.NumberFormat('fr-FR', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount) + ' FCFA'
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft
              size={Theme.layout.iconSize.md}
              color={Theme.colors.neutral[900]}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails de la commande</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary[500]} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!mission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft
              size={Theme.layout.iconSize.md}
              color={Theme.colors.neutral[900]}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails de la commande</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Mission introuvable</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft
            size={Theme.layout.iconSize.md}
            color={Theme.colors.neutral[900]}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Commande #{mission.id.slice(0, 8)}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(mission.status) + '20' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(mission.status) },
              ]}
            >
              {getStatusText(mission.status)}
            </Text>
          </View>
          {mission.estimatedDuration && (
            <View style={styles.estimatedTime}>
              <Clock
                size={Theme.layout.iconSize.sm}
                color={Theme.colors.neutral[500]}
              />
              <Text style={styles.estimatedTimeText}>
                {mission.estimatedDuration} minutes
              </Text>
            </View>
          )}
        </View>

        {/* Delivery Type */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Type de livraison</Text>
          <View
            style={[
              styles.deliveryTypeBadge,
              {
                backgroundColor:
                  mission.deliveryType === 'EXPRESS'
                    ? Theme.colors.primary[100]
                    : Theme.colors.secondary[100],
              },
            ]}
          >
            <Text
              style={[
                styles.deliveryTypeText,
                {
                  color:
                    mission.deliveryType === 'EXPRESS'
                      ? Theme.colors.primary[600]
                      : Theme.colors.secondary[600],
                },
              ]}
            >
              {mission.deliveryType === 'EXPRESS' ? 'Express' : 'Standard'}
            </Text>
          </View>
        </View>

        {/* Addresses */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Itinéraire</Text>
          <View style={styles.addressItem}>
            <View
              style={[
                styles.addressIcon,
                { backgroundColor: Theme.colors.warning[100] },
              ]}
            >
              <Package
                size={Theme.layout.iconSize.xs}
                color={Theme.colors.warning[600]}
              />
            </View>
            <View style={styles.addressInfo}>
              <Text style={styles.addressLabel}>Point de récupération</Text>
              <Text style={styles.addressText}>{mission.pickupAddress}</Text>
            </View>
          </View>

          <View style={styles.addressConnector} />

          <View style={styles.addressItem}>
            <View
              style={[
                styles.addressIcon,
                { backgroundColor: Theme.colors.success[100] },
              ]}
            >
              <MapPin
                size={Theme.layout.iconSize.xs}
                color={Theme.colors.success[600]}
              />
            </View>
            <View style={styles.addressInfo}>
              <Text style={styles.addressLabel}>Destination</Text>
              <Text style={styles.addressText}>{mission.destinationAddress}</Text>
            </View>
          </View>
        </View>

        {/* Delivery Info */}
        {mission.distance && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informations de livraison</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Distance</Text>
              <Text style={styles.infoValue}>
                {mission.distance.toFixed(1)} km
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Frais de livraison</Text>
              <Text style={styles.infoValue}>
                {formatCurrency(mission.deliveryFee)}
              </Text>
            </View>
          </View>
        )}

        {/* Contact Livreur */}
        {mission.livreurId && mission.status === 'IN_PROGRESS' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Contacter le livreur</Text>
            <View style={styles.contactButtons}>
              <TouchableOpacity style={styles.contactButton}>
                <Phone
                  size={Theme.layout.iconSize.sm}
                  color={Theme.colors.primary[500]}
                />
                <Text style={styles.contactButtonText}>Appeler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactButton}>
                <MessageCircle
                  size={Theme.layout.iconSize.sm}
                  color={Theme.colors.primary[500]}
                />
                <Text style={styles.contactButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[200],
  },
  headerTitle: {
    ...createTextStyle('lg', 'bold', Theme.colors.neutral[900]),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...createTextStyle('base', 'normal', Theme.colors.neutral[500]),
    marginTop: Theme.spacing.md,
  },
  errorText: {
    ...createTextStyle('base', 'medium', Theme.colors.error[500]),
  },
  scrollView: {
    flex: 1,
  },
  statusCard: {
    backgroundColor: Theme.colors.white,
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.lg,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.full,
    marginBottom: Theme.spacing.md,
  },
  statusText: {
    ...createTextStyle('base', 'bold'),
  },
  estimatedTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  estimatedTimeText: {
    ...createTextStyle('sm', 'medium', Theme.colors.neutral[600]),
  },
  card: {
    ...createCardStyle('md'),
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.lg,
  },
  cardTitle: {
    ...createTextStyle('base', 'bold', Theme.colors.neutral[900]),
    marginBottom: Theme.spacing.md,
  },
  deliveryTypeBadge: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    alignSelf: 'flex-start',
  },
  deliveryTypeText: {
    ...createTextStyle('sm', 'bold'),
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressIcon: {
    width: 32,
    height: 32,
    borderRadius: Theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.sm,
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    ...createTextStyle('xs', 'medium', Theme.colors.neutral[500]),
    marginBottom: Theme.spacing.xs,
  },
  addressText: {
    ...createTextStyle('sm', 'normal', Theme.colors.neutral[900]),
  },
  addressConnector: {
    width: 2,
    height: 24,
    backgroundColor: Theme.colors.neutral[200],
    marginLeft: 15,
    marginVertical: Theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.sm,
  },
  infoLabel: {
    ...createTextStyle('sm', 'normal', Theme.colors.neutral[600]),
  },
  infoValue: {
    ...createTextStyle('sm', 'semibold', Theme.colors.neutral[900]),
  },
  contactButtons: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.primary[50],
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    gap: Theme.spacing.sm,
  },
  contactButtonText: {
    ...createTextStyle('sm', 'semibold', Theme.colors.primary[600]),
  },
});
