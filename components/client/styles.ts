import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.neutral[50],
  },
  topSection: {
    backgroundColor: Theme.colors.primary[500],
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  headerContent: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Theme.colors.primary[100],
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Theme.colors.primary[300],
  },
  stepDotActive: {
    backgroundColor: Theme.colors.white,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: Theme.colors.primary[300],
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: Theme.colors.white,
  },
  scrollView: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: Theme.colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.neutral[800],
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors.neutral[700],
    marginBottom: 8,
  },
  textAreaWrapper: {
    backgroundColor: Theme.colors.neutral[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[200],
    padding: 12,
  },
  textArea: {
    fontSize: 16,
    color: Theme.colors.neutral[800],
    textAlignVertical: 'top',
    minHeight: 80,
  },
  urgencyOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  urgencyOption: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Theme.colors.neutral[200],
    backgroundColor: Theme.colors.white,
  },
  urgencyOptionSelected: {
    borderColor: Theme.colors.primary[500],
    backgroundColor: Theme.colors.primary[500],
  },
  urgencyIcon: {
    marginBottom: 8,
  },
  urgencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.neutral[800],
    marginBottom: 4,
  },
  urgencyTitleSelected: {
    color: Theme.colors.white,
  },
  urgencySubtext: {
    fontSize: 12,
    color: Theme.colors.neutral[500],
  },
  urgencySubtextSelected: {
    color: Theme.colors.white,
  },
  summaryContent: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryLabel: {
    fontSize: 14,
    color: Theme.colors.neutral[600],
    width: 80,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors.neutral[800],
    flex: 1,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.neutral[200],
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.neutral[800],
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.primary[500],
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Theme.colors.neutral[200],
    backgroundColor: Theme.colors.white,
  },
  paymentMethodSelected: {
    borderColor: Theme.colors.primary[500],
    backgroundColor: Theme.colors.primary[50],
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: '500',
    color: Theme.colors.neutral[800],
    flex: 1,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Theme.colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: Theme.colors.primary[500],
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Theme.colors.primary[500],
  },
  footer: {
    padding: 20,
    backgroundColor: Theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.neutral[200],
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Theme.colors.primary[500],
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.white,
  },
  secondaryButton: {
    backgroundColor: Theme.colors.neutral[100],
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.neutral[700],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
