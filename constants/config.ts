// Configuration de l'application
export const CONFIG = {
  // URL de l'API backend
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  
  // Configuration de développement
  IS_DEVELOPMENT: __DEV__,
  
  // Timeout pour les requêtes API (en millisecondes)
  API_TIMEOUT: 10000,
} as const;

// Validation de la configuration
export const validateConfig = () => {
  const errors: string[] = [];
  
  if (!CONFIG.API_URL || CONFIG.API_URL === 'http://localhost:3000') {
    console.warn('⚠️  API_URL utilise la valeur par défaut. Configurez EXPO_PUBLIC_API_URL pour la production.');
  }
  
  if (errors.length > 0) {
    console.error('❌ Erreurs de configuration:', errors);
    return false;
  }
  
  console.log('✅ Configuration validée');
  return true;
};
