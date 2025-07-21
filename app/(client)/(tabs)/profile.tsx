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
  CreditCard,
  MapPin,
  Phone,
  Mail,
  LogOut,
  ChevronRight,
  Package,
  Star,
  Gift,
} from 'lucide-react-native';
import { Theme, createCardStyle, createTextStyle } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { profileMenuItems } from '@/constants/profile-menu-items';
import { Client } from '@/types/auth';

export default function ClientProfileScreen() {
  const { entity: client, logout } = useAuth<Client>();

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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={{
              uri:
                client.profilePicture ||
                'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150',
            }}
            style={styles.profilePicture}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{client.name}</Text>
            <Text style={styles.memberSince}>
              Membre depuis {client.memberSince}
            </Text>
          </View>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Package
              size={Theme.layout.iconSize.md}
              color={Theme.colors.primary[500]}
            />
            <Text style={styles.statValue}>{client.totalDeliveries}</Text>
            <Text style={styles.statLabel}>Commandes</Text>
          </View>
          <View style={styles.statItem}>
            <Star
              size={Theme.layout.iconSize.md}
              color={Theme.colors.accent[500]}
            />
            <Text style={styles.statValue}>4.9</Text>
            <Text style={styles.statLabel}>Note moyenne</Text>
          </View>
          <View style={styles.statItem}>
            <Gift
              size={Theme.layout.iconSize.md}
              color={Theme.colors.secondary[500]}
            />
            <Text style={styles.statValue}>1,250</Text>
            <Text style={styles.statLabel}>Points fidélité</Text>
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
            <Text style={styles.contactText}>{client.email}</Text>
          </View>

          <View style={styles.contactItem}>
            <Phone
              size={Theme.layout.iconSize.xs}
              color={Theme.colors.neutral[500]}
            />
            <Text style={styles.contactText}>{client.phone}</Text>
          </View>

          {client.defaultAddress && (
            <View style={styles.contactItem}>
              <MapPin
                size={Theme.layout.iconSize.xs}
                color={Theme.colors.neutral[500]}
              />
              <Text style={styles.contactText}>{client.defaultAddress}</Text>
            </View>
          )}
        </View>

        {/* Payment Info */}
        {client.mobileMoneyNumber && (
          <View style={styles.paymentCard}>
            <Text style={styles.sectionTitle}>Paiement principal</Text>
            <View style={styles.paymentMethod}>
              <View style={styles.paymentIcon}>
                <CreditCard
                  size={Theme.layout.iconSize.sm}
                  color={Theme.colors.accent[500]}
                />
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>Mobile Money</Text>
                <Text style={styles.paymentNumber}>
                  {client.mobileMoneyNumber}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuCard}>
          {profileMenuItems.map(({ icon: Icon, ...item }) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.action}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  <Icon
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
  header: {
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.lg,
    backgroundColor: Theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[200],
  },
  headerTitle: {
    ...createTextStyle('2xl', 'bold', Theme.colors.neutral[900]),
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    ...createCardStyle('md'),
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: Theme.borderRadius.full,
    marginRight: Theme.spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    ...createTextStyle('xl', 'bold', Theme.colors.neutral[900]),
    marginBottom: Theme.spacing.xs,
  },
  memberSince: {
    ...createTextStyle('sm', 'normal', Theme.colors.neutral[500]),
  },
  statsCard: {
    ...createCardStyle('md'),
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...createTextStyle('xl', 'bold', Theme.colors.neutral[900]),
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.xs,
  },
  statLabel: {
    ...createTextStyle('xs', 'normal', Theme.colors.neutral[500]),
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
  paymentCard: {
    ...createCardStyle('md'),
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.lg,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    width: Theme.layout.iconSize.xl,
    height: Theme.layout.iconSize.xl,
    backgroundColor: Theme.colors.accent[100],
    borderRadius: Theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    ...createTextStyle('base', 'semibold', Theme.colors.neutral[900]),
    marginBottom: Theme.spacing.xs,
  },
  paymentNumber: {
    ...createTextStyle('sm', 'normal', Theme.colors.neutral[500]),
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


