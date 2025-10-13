import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  MessageCircle,
  HelpCircle,
  Book,
  Shield,
  CreditCard,
  Truck,
  Package,
} from 'lucide-react-native';
import { Theme, createTextStyle } from '@/constants/theme';
import { useRouter } from 'expo-router';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  icon: any;
  category: string;
}

const HelpScreen = () => {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const faqData: FAQItem[] = [
    {
      id: 1,
      category: 'Livraison',
      icon: Truck,
      question: 'Comment suivre ma livraison en temps réel ?',
      answer:
        'Vous pouvez suivre votre livraison en temps réel depuis l\'onglet "Livraisons". Une carte interactive vous montre la position exacte du livreur et le temps estimé d\'arrivée.',
    },
    {
      id: 2,
      category: 'Livraison',
      icon: Package,
      question: 'Quels sont les délais de livraison ?',
      answer:
        'Les délais varient selon le type de livraison : Express (30-60 min) ou Standard (2-4 heures). Le délai exact est calculé en fonction de la distance et du trafic.',
    },
    {
      id: 3,
      category: 'Paiement',
      icon: CreditCard,
      question: 'Quels modes de paiement sont acceptés ?',
      answer:
        'Nous acceptons les paiements par carte bancaire, mobile money (Orange Money, Wave, Free Money) et paiement à la livraison.',
    },
    {
      id: 4,
      category: 'Paiement',
      icon: CreditCard,
      question: 'Comment obtenir un remboursement ?',
      answer:
        'En cas de problème avec votre livraison, contactez notre support dans les 24h. Les remboursements sont traités sous 3-5 jours ouvrables.',
    },
    {
      id: 5,
      category: 'Compte',
      icon: Shield,
      question: 'Comment sécuriser mon compte ?',
      answer:
        'Utilisez un mot de passe fort, activez la vérification en deux étapes et ne partagez jamais vos identifiants. Déconnectez-vous après chaque session sur les appareils partagés.',
    },
    {
      id: 6,
      category: 'Compte',
      icon: HelpCircle,
      question: 'Comment modifier mes informations personnelles ?',
      answer:
        'Allez dans l\'onglet "Profil", puis cliquez sur "Informations personnelles". Vous pourrez modifier votre nom, email, téléphone et adresse.',
    },
    {
      id: 7,
      category: 'Livreur',
      icon: Truck,
      question: 'Comment devenir livreur Isaraya ?',
      answer:
        'Inscrivez-vous via l\'application livreur, fournissez vos documents (CNI, permis de conduire, assurance) et attendez la validation. Le processus prend 24-48h.',
    },
    {
      id: 8,
      category: 'Livreur',
      icon: Package,
      question: 'Comment sont calculés les gains des livreurs ?',
      answer:
        'Les gains dépendent de la distance parcourue, du type de livraison et des bonus. Vous pouvez consulter vos statistiques détaillées dans votre profil.',
    },
  ];

  const contactOptions = [
    {
      id: 1,
      title: 'Téléphone',
      subtitle: '+221 77 123 45 67',
      icon: Phone,
      action: () => Linking.openURL('tel:+221771234567'),
      color: Theme.colors.primary[500],
    },
    {
      id: 2,
      title: 'Email',
      subtitle: 'support@isaraya.sn',
      icon: Mail,
      action: () => Linking.openURL('mailto:support@isaraya.sn'),
      color: Theme.colors.secondary[500],
    },
    {
      id: 3,
      title: 'WhatsApp',
      subtitle: 'Chat en direct',
      icon: MessageCircle,
      action: () => Linking.openURL('https://wa.me/221771234567'),
      color: Theme.colors.success[500],
    },
  ];

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const groupedFAQ = faqData.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, FAQItem[]>);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ChevronLeft
            size={Theme.layout.iconSize.md}
            color={Theme.colors.neutral[900]}
            strokeWidth={2}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Aide et Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconContainer}>
            <HelpCircle
              size={48}
              color={Theme.colors.primary[500]}
              strokeWidth={2}
            />
          </View>
          <Text style={styles.heroTitle}>Comment pouvons-nous vous aider ?</Text>
          <Text style={styles.heroSubtitle}>
            Trouvez des réponses à vos questions ou contactez notre équipe
          </Text>
        </View>

        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contactez-nous</Text>
          <View style={styles.contactGrid}>
            {contactOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.contactCard}
                onPress={option.action}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.contactIconContainer,
                    { backgroundColor: `${option.color}15` },
                  ]}
                >
                  <option.icon
                    size={Theme.layout.iconSize.md}
                    color={option.color}
                    strokeWidth={2}
                  />
                </View>
                <Text style={styles.contactTitle}>{option.title}</Text>
                <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Questions fréquentes</Text>

          {Object.entries(groupedFAQ).map(([category, items]) => {
            const CategoryIcon = items[0].icon;
            return (
              <View key={category} style={styles.categoryContainer}>
                <View style={styles.categoryHeader}>
                  <CategoryIcon
                    size={Theme.layout.iconSize.sm}
                    color={Theme.colors.primary[500]}
                    strokeWidth={2}
                  />
                  <Text style={styles.categoryTitle}>{category}</Text>
                </View>

              {items.map((item) => (
                <View key={item.id} style={styles.faqCard}>
                  <TouchableOpacity
                    style={styles.faqHeader}
                    onPress={() => toggleExpand(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.faqQuestion}>{item.question}</Text>
                    {expandedId === item.id ? (
                      <ChevronUp
                        size={Theme.layout.iconSize.sm}
                        color={Theme.colors.primary[500]}
                        strokeWidth={2}
                      />
                    ) : (
                      <ChevronDown
                        size={Theme.layout.iconSize.sm}
                        color={Theme.colors.neutral[400]}
                        strokeWidth={2}
                      />
                    )}
                  </TouchableOpacity>

                  {expandedId === item.id && (
                    <View style={styles.faqAnswer}>
                      <Text style={styles.faqAnswerText}>{item.answer}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
            );
          })}
        </View>

        {/* Additional Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ressources supplémentaires</Text>
          <View style={styles.resourceCard}>
            <Book
              size={Theme.layout.iconSize.md}
              color={Theme.colors.primary[500]}
              strokeWidth={2}
            />
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>Guide d'utilisation</Text>
              <Text style={styles.resourceSubtitle}>
                Découvrez toutes les fonctionnalités de l'application
              </Text>
            </View>
          </View>

          <View style={styles.resourceCard}>
            <Shield
              size={Theme.layout.iconSize.md}
              color={Theme.colors.success[500]}
              strokeWidth={2}
            />
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>Politique de confidentialité</Text>
              <Text style={styles.resourceSubtitle}>
                Comment nous protégeons vos données
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.lg,
    backgroundColor: Theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[100],
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...createTextStyle('xl', 'bold', Theme.colors.neutral[900]),
  },
  placeholder: {
    width: 40,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingVertical: Theme.spacing['4xl'],
    paddingHorizontal: Theme.spacing['2xl'],
    backgroundColor: Theme.colors.primary[50],
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.xl,
  },
  heroTitle: {
    ...createTextStyle('3xl', 'bold', Theme.colors.neutral[900]),
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  },
  heroSubtitle: {
    ...createTextStyle('base', 'normal', Theme.colors.neutral[600]),
    textAlign: 'center',
    maxWidth: 300,
  },

  // Section
  section: {
    paddingHorizontal: Theme.spacing['2xl'],
    marginTop: Theme.spacing['3xl'],
  },
  sectionTitle: {
    ...createTextStyle('xl', 'bold', Theme.colors.neutral[900]),
    marginBottom: Theme.spacing.xl,
  },

  // Contact Grid
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.lg,
    justifyContent: 'space-between',
  },
  contactCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.xl,
    alignItems: 'center',
  },
  contactIconContainer: {
    width: 56,
    height: 56,
    borderRadius: Theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.md,
  },
  contactTitle: {
    ...createTextStyle('base', 'semibold', Theme.colors.neutral[900]),
    marginBottom: Theme.spacing.xs,
    textAlign: 'center',
  },
  contactSubtitle: {
    ...createTextStyle('sm', 'normal', Theme.colors.neutral[500]),
    textAlign: 'center',
  },

  // FAQ
  categoryContainer: {
    marginBottom: Theme.spacing['2xl'],
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.sm,
  },
  categoryTitle: {
    ...createTextStyle('lg', 'semibold', Theme.colors.neutral[800]),
  },
  faqCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.xl,
    marginBottom: Theme.spacing.md,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.xl,
    gap: Theme.spacing.md,
  },
  faqQuestion: {
    ...createTextStyle('base', 'semibold', Theme.colors.neutral[900]),
    flex: 1,
  },
  faqAnswer: {
    paddingHorizontal: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xl,
    paddingTop: 0,
  },
  faqAnswerText: {
    ...createTextStyle('base', 'normal', Theme.colors.neutral[600]),
    lineHeight: 24,
  },

  // Resources
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.xl,
    marginBottom: Theme.spacing.md,
    gap: Theme.spacing.lg,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    ...createTextStyle('base', 'semibold', Theme.colors.neutral[900]),
    marginBottom: Theme.spacing.xs,
  },
  resourceSubtitle: {
    ...createTextStyle('sm', 'normal', Theme.colors.neutral[500]),
  },

  // Bottom Spacing
  bottomSpacing: {
    height: Theme.spacing['4xl'],
  },
});
