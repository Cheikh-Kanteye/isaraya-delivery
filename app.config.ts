import 'dotenv/config';

export default {
  expo: {
    name: "iDelivery",
    slug: "idelivery",
    version: "1.0.0",
    android: {
      package: "com.cheikhkante.idelivery",
      versionCode: 1
    },
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      eas: {
        projectId: "c62a74b3-d2b8-4828-b200-e65b60c5de63"
      }
    }
  }
};
