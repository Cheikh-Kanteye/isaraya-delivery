import { Theme } from '@/constants/theme';

export const formatCurrency = (amount: number): string => {
  return (
    new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' FCFA'
  );
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'available':
      return Theme.colors.accent[500];
    case 'accepted':
      return Theme.colors.secondary[500];
    case 'picked_up':
      return Theme.colors.primary[500];
    case 'delivered':
      return Theme.colors.neutral[500];
    case 'rejected':
      return Theme.colors.error[500];
    default:
      return Theme.colors.neutral[500];
  }
};

export const getStatusText = (status: string): string => {
  switch (status) {
    case 'available':
      return 'Disponible';
    case 'accepted':
      return 'Acceptée';
    case 'picked_up':
      return 'Récupérée';
    case 'delivered':
      return 'Livrée';
    case 'rejected':
      return 'Refusée';
    default:
      return status;
  }
};
