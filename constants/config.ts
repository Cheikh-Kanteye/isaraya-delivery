import Constants from "expo-constants";

export const CONFIG = {
  API_URL:
    process.env.EXPO_PUBLIC_API_URL ||
    Constants.expoConfig?.extra?.apiUrl ||
    "http://localhost:3000",

  IS_DEVELOPMENT: __DEV__,

  API_TIMEOUT: 10000,
} as const;

export const validateConfig = () => {
  if (!CONFIG.API_URL || CONFIG.API_URL === "http://localhost:3000") {
    console.warn("⚠️  API_URL utilise la valeur par défaut. Configurez EXPO_PUBLIC_API_URL pour la production.");
  } else {
    console.log("✅ Configuration validée");
  }
};
