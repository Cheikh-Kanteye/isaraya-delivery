import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Truck,
  Zap,
  CreditCard,
  MapPin,
  ArrowRight,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import AuthLoader from '@/components/common/AuthLoader';
import { BaseUser } from '@/types/auth';
import { Theme } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreenModern() {
  const router = useRouter();
  const { isAuthenticated, entity, isLoading } = useAuth<BaseUser>();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const iconAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Redirect authenticated users
    if (isAuthenticated && entity) {
      if (entity.role === 'client') {
        router.replace('/(client)/(tabs)');
      } else if (entity.role === 'deliver') {
        router.replace('/(deliver)/(tabs)');
      }
      return;
    }

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Stagger icon animations
    iconAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: 800 + index * 150,
        useNativeDriver: true,
      }).start();
    });

    // Floating animation for decorative elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation for button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [isAuthenticated, entity, router]);

  if (isLoading) {
    return <AuthLoader message="Vérification de vos informations..." />;
  }

  const floatInterpolate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <LinearGradient
        colors={['#FFFFFF', '#FEF3C7', '#FFFFFF']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container}>
          {/* Decorative animated circles */}
          <Animated.View
            style={[
              styles.decorCircle1,
              {
                transform: [{ translateY: floatInterpolate }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.decorCircle2,
              {
                transform: [
                  {
                    translateY: floatAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 15],
                    }),
                  },
                ],
              },
            ]}
          />

          <View style={styles.content}>
            {/* Animated Header */}
            <Animated.View
              style={[
                styles.header,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                },
              ]}
            >
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#FCD34D', Theme.colors.primary[500]]}
                  style={styles.logoGradient}
                >
                  <Truck size={40} color="#FFFFFF" strokeWidth={2.5} />
                </LinearGradient>
              </View>

              <Text style={styles.appTitle}>
                i<Text style={{ color: Theme.colors.black }}>Delivery</Text>
              </Text>
              <Text style={styles.subtitle}>
                Votre solution de livraison rapide et fiable
              </Text>
            </Animated.View>

            {/* Animated Features Cards */}
            <View style={styles.featuresSection}>
              {[
                {
                  icon: Zap,
                  text: 'Livraison express',
                  color: Theme.colors.primary[500],
                },
                { icon: CreditCard, text: 'Paiement mobile', color: '#8B5CF6' },
                { icon: MapPin, text: 'Suivi temps réel', color: '#3B82F6' },
              ].map((feature, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.featureCard,
                    {
                      opacity: iconAnims[index],
                      transform: [
                        {
                          translateX: iconAnims[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [-50, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[`${feature.color}20`, `${feature.color}10`]}
                    style={styles.featureIconContainer}
                  >
                    <feature.icon
                      size={24}
                      color={feature.color}
                      strokeWidth={2.5}
                    />
                  </LinearGradient>
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureText}>{feature.text}</Text>
                  </View>
                </Animated.View>
              ))}
            </View>

            {/* Animated Button */}
            <Animated.View
              style={[
                styles.buttonSection,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => router.push('/auth')}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[Theme.colors.primary[500], '#D97706']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.startButtonText}>Commencer</Text>
                  <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.5} />
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.bottomText}>
                Rejoignez des milliers d&apos;utilisateurs satisfaits 🚀
              </Text>
            </Animated.View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },

  // Decorative elements
  decorCircle1: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(252, 211, 77, 0.2)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -80,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },

  // Header
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.colors.primary[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: Theme.colors.primary[500],
    marginBottom: 12,
    letterSpacing: -1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },

  // Features
  featuresSection: {
    gap: 16,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featureText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    letterSpacing: -0.3,
  },
  featureBadge: {
    backgroundColor: Theme.colors.primary[50],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.primary[200],
  },
  featureBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.primary[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Button
  buttonSection: {
    alignItems: 'center',
    gap: 16,
  },
  startButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Theme.colors.primary[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 12,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  bottomText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
});
