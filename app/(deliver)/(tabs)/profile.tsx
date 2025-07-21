import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Settings,
  Bell,
  CreditCard,
  FileText,
  CircleHelp as HelpCircle,
  LogOut,
  ChevronRight,
  Star,
  Shield,
  Truck,
  Phone,
  Mail,
  MapPin,
  CreditCard as Edit,
} from 'lucide-react-native';
import { Theme, createCardStyle, createTextStyle } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { Deliver } from '@/types/auth';

export default function ProfileScreen() {
  const { entity: deliver, logout } = useAuth<Deliver>();

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
      title: 'Notifications',
      icon: Bell,
      subtitle: 'Gérer les notifications',
      action: () => console.log('Notifications'),
    },
    {
      id: 3,
      title: 'Paiements',
      icon: CreditCard,
      subtitle: 'Méthodes de paiement',
      action: () => console.log('Payments'),
    },
    {
      id: 4,
      title: 'Documents',
      icon: FileText,
      subtitle: 'Permis, assurance, etc.',
      action: () => console.log('Documents'),
    },
    {
      id: 5,
      title: 'Véhicule',
      icon: Truck,
      subtitle: 'Gérer votre véhicule',
      action: () => console.log('Vehicle'),
    },
    {
      id: 6,
      title: 'Paramètres',
      icon: Settings,
      subtitle: "Préférences de l'app",
      action: () => console.log('Settings'),
    },
    {
      id: 7,
      title: 'Aide et support',
      icon: HelpCircle,
      subtitle: 'FAQ et contact',
      action: () => console.log('Help'),
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
    return null; // This shouldn't happen due to AuthGuard, but just in case
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
        <TouchableOpacity style={styles.editButton}>
          <Edit
            size={Theme.layout.iconSize.sm}
            color={Theme.colors.primary[500]}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Profile Picture */}
          <View style={styles.profilePictureContainer}>
            <Image
              source={{
                uri:
                  deliver.profilePicture ||
                  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
              }}
              style={styles.profilePicture}
            />
            <View style={styles.verificationBadge}>
              <Shield
                size={Theme.layout.iconSize.xs}
                color={Theme.colors.primary[500]}
              />
            </View>
          </View>

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{deliver.name}</Text>
            <View style={styles.ratingContainer}>
              <Star
                size={Theme.layout.iconSize.xs}
                color={Theme.colors.accent[500]}
              />
              <Text style={styles.rating}>{deliver.rating}</Text>
              <Text style={styles.ratingText}>
                ({deliver.totalDeliveries} livraisons)
              </Text>
            </View>
            <Text style={styles.joinDate}>
              Membre depuis {deliver.joinDate}
            </Text>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.contactCard}>
          <Text style={styles.sectionTitle}>Informations de contact</Text>

          <View style={styles.contactItem}>
            <Mail
              size={Theme.layout.iconSize.xs}
              color={Theme.colors.neutral[500]}
            />
            <Text style={styles.contactText}>{deliver.email}</Text>
          </View>

          <View style={styles.contactItem}>
            <Phone
              size={Theme.layout.iconSize.xs}
              color={Theme.colors.neutral[500]}
            />
            <Text style={styles.contactText}>{deliver.phoneNumber}</Text>
          </View>

          <View style={styles.contactItem}>
            <MapPin
              size={Theme.layout.iconSize.xs}
              color={Theme.colors.neutral[500]}
            />
            <Text style={styles.contactText}>{deliver.address}</Text>
          </View>
        </View>

        {/* Vehicle Info */}
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleHeader}>
            <Truck
              size={Theme.layout.iconSize.sm}
              color={Theme.colors.secondary[500]}
            />
            <Text style={styles.vehicleTitle}>Véhicule</Text>
          </View>

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

        {/* Menu Items */}
        <View style={styles.menuCard}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.action}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  <item.icon
                    size={Theme.layout.iconSize.sm}
                    color={Theme.colors.neutral[500]}
                  />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <ChevronRight
                size={Theme.layout.iconSize.sm}
                color={Theme.colors.neutral[300]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Statistiques</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{deliver.totalDeliveries}</Text>
              <Text style={styles.statLabel}>Livraisons totales</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>{deliver.rating}</Text>
              <Text style={styles.statLabel}>Note moyenne</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>98%</Text>
              <Text style={styles.statLabel}>Taux de réussite</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>156</Text>
              <Text style={styles.statLabel}>Jours actifs</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut
            size={Theme.layout.iconSize.sm}
            color={Theme.colors.error[500]}
          />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.2.3</Text>
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
  editButton: {
    padding: Theme.spacing.sm,
    backgroundColor: Theme.colors.neutral[100],
    borderRadius: Theme.borderRadius.md,
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    ...createCardStyle('md'),
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.lg,
    alignItems: 'center',
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: Theme.spacing.lg,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.neutral[100],
  },
  verificationBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadows.md,
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    ...createTextStyle('xl', 'bold', Theme.colors.neutral[900]),
    marginBottom: Theme.spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    marginBottom: Theme.spacing.xs,
  },
  rating: {
    ...createTextStyle('base', 'semibold', Theme.colors.accent[500]),
  },
  ratingText: {
    ...createTextStyle('sm', 'normal', Theme.colors.neutral[500]),
  },
  joinDate: {
    ...createTextStyle('sm', 'normal', Theme.colors.neutral[500]),
  },
  contactCard: {
    ...createCardStyle('md'),
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.lg,
  },
  sectionTitle: {
    ...createTextStyle('lg', 'semibold', Theme.colors.neutral[900]),
    marginBottom: Theme.spacing.lg,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  contactText: {
    ...createTextStyle('base', 'normal', Theme.colors.neutral[700]),
  },
  vehicleCard: {
    ...createCardStyle('md'),
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.lg,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  vehicleTitle: {
    ...createTextStyle('lg', 'semibold', Theme.colors.neutral[900]),
  },
  vehicleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleType: {
    ...createTextStyle('base', 'medium', Theme.colors.neutral[700]),
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
    ...createTextStyle('sm', 'medium'),
  },
  verifiedText: {
    color: Theme.colors.success[800],
  },
  pendingText: {
    color: Theme.colors.warning[800],
  },
  menuCard: {
    ...createCardStyle('md'),
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.lg,
    padding: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[100],
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: Theme.layout.iconSize.xl,
    height: Theme.layout.iconSize.xl,
    backgroundColor: Theme.colors.neutral[100],
    borderRadius: Theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    ...createTextStyle('base', 'medium', Theme.colors.neutral[900]),
    marginBottom: 2,
  },
  menuItemSubtitle: {
    ...createTextStyle('sm', 'normal', Theme.colors.neutral[500]),
  },
  statsCard: {
    ...createCardStyle('md'),
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.lg,
  },
  statsTitle: {
    ...createTextStyle('lg', 'semibold', Theme.colors.neutral[900]),
    marginBottom: Theme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.lg,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.neutral[50],
    borderRadius: Theme.borderRadius.md,
  },
  statValue: {
    ...createTextStyle('xl', 'bold', Theme.colors.neutral[900]),
    marginBottom: Theme.spacing.xs,
  },
  statLabel: {
    ...createTextStyle('xs', 'normal', Theme.colors.neutral[500]),
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.white,
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.lg,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    gap: Theme.spacing.sm,
    ...Theme.shadows.md,
  },
  logoutText: {
    ...createTextStyle('base', 'semibold', Theme.colors.error[500]),
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.xl,
  },
  versionText: {
    ...createTextStyle('sm', 'normal', Theme.colors.neutral[400]),
  },
});
