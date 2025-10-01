import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Keyboard } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

// Simulons le Theme
const Theme = {
  colors: {
    primary: { 500: '#6366F1', 600: '#4F46E5' },
    white: '#FFFFFF',
    neutral: { 100: '#F5F5F5', 200: '#E5E5E5' },
  },
};

const styles = {
  topSection: {
    backgroundColor: Theme.colors.primary[600],
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  // Version compacte pour quand le clavier est visible
  topSectionCompact: {
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerContent: {
    marginBottom: 16,
  },
  headerContentCompact: {
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Theme.colors.white,
    marginBottom: 4,
  },
  headerTitleCompact: {
    fontSize: 18,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  headerSubtitleCompact: {
    fontSize: 12,
  },
  stepIndicator: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  stepDotActive: {
    backgroundColor: Theme.colors.white,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: Theme.colors.white,
  },
};

export default function Header({ step = 1, onBack = () => {} }) {
  const [isKeyboardVisible, setKeyboardVisible] = React.useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <View
      style={[styles.topSection, isKeyboardVisible && styles.topSectionCompact]}
    >
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <AntDesign name="arrow-left" size={20} color={Theme.colors.white} />
      </TouchableOpacity>

      <View
        style={[
          styles.headerContent,
          isKeyboardVisible && styles.headerContentCompact,
        ]}
      >
        <Text
          style={[
            styles.headerTitle,
            isKeyboardVisible && styles.headerTitleCompact,
          ]}
        >
          Nouvelle commande
        </Text>
        <Text
          style={[
            styles.headerSubtitle,
            isKeyboardVisible && styles.headerSubtitleCompact,
          ]}
        >
          {step === 1 ? 'Détails de livraison' : 'Confirmation et paiement'}
        </Text>
      </View>

      {!isKeyboardVisible && (
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
          <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
          <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
        </View>
      )}
    </View>
  );
}
