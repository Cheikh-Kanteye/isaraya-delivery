import { User, MapPin, LucideIcon } from 'lucide-react-native';

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
];
