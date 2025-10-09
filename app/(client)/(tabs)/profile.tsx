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
  CreditCard,
  MapPin,
  Phone,
  Mail,
  LogOut,
  ChevronRight,
  Package,
} from 'lucide-react-native';
import { Theme, createTextStyle } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { profileMenuItems } from '@/constants/profile-menu-items';
import { Client } from '@/types/auth';
import { DeliveryRequest } from '@/types/client';
import { deliveryService } from '@/services/deliveryService';

export default function ClientProfileScreen() {
  const { entity: client, logout } = useAuth<Client>();
  const [orders, setOrders] = useState<DeliveryRequest[]>([]);

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
    const fetchOrders = async () => {
      const clientMissions = await deliveryService.getClientMissions();
      if (clientMissions && Array.isArray(clientMissions.payload)) {
        setOrders(clientMissions.payload);
      } else {
        setOrders([]);
      }
    };

    fetchOrders();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!client) {
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
            {client.profilePicture ? (
              <Image
                source={{ uri: client.profilePicture }}
                style={styles.profilePicture}
              />
            ) : (
              <View style={styles.profilePicture}>
                <Text style={styles.initialsText}>
                  {(client.firstName + ' ' + client.lastName)
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </Text>
              </View>
            )}
            <Text style={styles.userName}>{client.name}</Text>
            <Text style={styles.memberSince}>
              Membre depuis {client.createdAt?.split('T')[0]}
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
              <Text style={styles.statValue}>{orders.length || 0}</Text>
              <Text style={styles.statLabel}>Commandes</Text>
            </View>
          </View>
        </Animated.View>

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
              <Text style={styles.infoText}>{client.email}</Text>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoItem}>
              <Phone
                size={Theme.layout.iconSize.sm}
                color={Theme.colors.neutral[500]}
                strokeWidth={2}
              />
              <Text style={styles.infoText}>{client.phone}</Text>
            </View>

            {client.defaultAddress && (
              <>
                <View style={styles.infoDivider} />
                <View style={styles.infoItem}>
                  <MapPin
                    size={Theme.layout.iconSize.sm}
                    color={Theme.colors.neutral[500]}
                    strokeWidth={2}
                  />
                  <Text style={styles.infoText}>{client.defaultAddress}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Payment Info */}
        {client.mobileMoneyNumber && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Paiement principal</Text>
            <View style={styles.paymentCard}>
              <View style={styles.paymentContent}>
                <CreditCard
                  size={Theme.layout.iconSize.md}
                  color={Theme.colors.primary[500]}
                  strokeWidth={2}
                />
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentTitle}>Mobile Money</Text>
                  <Text style={styles.paymentNumber}>
                    {client.mobileMoneyNumber}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.section}>
          <View style={styles.menuCard}>
            {profileMenuItems.map(({ icon: Icon, ...item }, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  index === profileMenuItems.length - 1 && styles.menuItemLast,
                ]}
                onPress={item.action}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <Icon
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
          <Text style={styles.versionText}>Version Client 1.0.0</Text>
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
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 4,
    borderColor: Theme.colors.white,
    marginBottom: Theme.spacing.lg,
    backgroundColor: Theme.colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    ...createTextStyle('4xl', 'bold', Theme.colors.primary[500]),
    letterSpacing: 2,
  },
  userName: {
    ...createTextStyle('3xl', 'bold', Theme.colors.neutral[900]),
    marginBottom: Theme.spacing.xs,
    letterSpacing: -0.5,
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
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...createTextStyle('4xl', 'bold', Theme.colors.neutral[900]),
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.xs,
  },
  statLabel: {
    ...createTextStyle('sm', 'medium', Theme.colors.neutral[500]),
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

  // Payment Card
  paymentCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.xl,
  },
  paymentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.lg,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    ...createTextStyle('sm', 'medium', Theme.colors.neutral[500]),
    marginBottom: Theme.spacing.xs,
  },
  paymentNumber: {
    ...createTextStyle('lg', 'semibold', Theme.colors.neutral[900]),
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
});
