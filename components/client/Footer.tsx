import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './styles';

type Props = {
  step: 1 | 2;
  isLoading: boolean;
  onCreateDelivery: () => void;
  onProcessPayment: () => void;
  onBack: () => void;
};

export function Footer({
  step,
  isLoading,
  onCreateDelivery,
  onProcessPayment,
  onBack,
}: Props) {
  return (
    <View style={styles.footer}>
      {step === 1 && (
        <TouchableOpacity
          style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
          onPress={onCreateDelivery}
          disabled={isLoading}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? 'Création...' : 'Continuer'}
          </Text>
        </TouchableOpacity>
      )}
      {step === 2 && (
        <View style={styles.footerButtons}>
          <TouchableOpacity
            style={[styles.secondaryButton, isLoading && styles.buttonDisabled]}
            onPress={onBack}
            disabled={isLoading}
          >
            <Text style={styles.secondaryButtonText}>Retour</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { flex: 2 },
              isLoading && styles.buttonDisabled,
            ]}
            onPress={onProcessPayment}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? 'Paiement...' : 'Confirmer'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
