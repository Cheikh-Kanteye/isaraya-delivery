import {
  User,
  MapPin,
  CreditCard,
  Bell,
  Gift,
  LucideIcon,
  Settings,
} from 'lucide-react-native';

type TMenu = {
  id: number;
  title: string;
  icon: LucideIcon;
  subtitle: string;
  action: () => void;
};

export const profileMenuItems: TMenu[] = [
  {
    id: 1,
    title: 'Informations personnelles',
    icon: User,
    subtitle: 'Gérer vos informations',
    action: () => console.log('Edit profile'),
  },
  {
    id: 2,
    title: 'Adresses',
    icon: MapPin,
    subtitle: 'Gérer vos adresses',
    action: () => console.log('Addresses'),
  },
  {
    id: 3,
    title: 'Moyens de paiement',
    icon: CreditCard,
    subtitle: 'Mobile Money, cartes',
    action: () => console.log('Payments'),
  },
  {
    id: 4,
    title: 'Notifications',
    icon: Bell,
    subtitle: 'Gérer les notifications',
    action: () => console.log('Notifications'),
  },
  {
    id: 5,
    title: 'Programme de fidélité',
    icon: Gift,
    subtitle: 'Points et récompenses',
    action: () => console.log('Loyalty'),
  },
  {
    id: 6,
    title: 'Paramètres',
    icon: Settings,
    subtitle: "Préférences de l'app",
    action: () => console.log('Settings'),
  },
];
