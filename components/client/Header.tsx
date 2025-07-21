import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { Theme } from '@/constants/theme';
import { styles } from './styles';

type Props = {
  step: 1 | 2;
  onBack: () => void;
};

export function Header({ step, onBack }: Props) {
  return (
    <View style={styles.topSection}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Nouvelle commande</Text>
        <Text style={styles.headerSubtitle}>
          {step === 1 ? 'Détails de livraison' : 'Confirmation et paiement'}
        </Text>
      </View>
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
        <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
        <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
      </View>
    </View>
  );
}
