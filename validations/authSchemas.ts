import { z } from 'zod';

// Messages d'erreur personnalisés
const errorMessages = {
  required: 'Ce champ est requis',
  email: "Format d'email invalide",
  minLength: (min: number) => `Doit contenir au moins ${min} caractères`,
  maxLength: (max: number) => `Ne peut pas dépasser ${max} caractères`,
  phone: 'Format de téléphone invalide',
  passwordMatch: 'Les mots de passe ne correspondent pas',
};

// Schéma de base pour l'email
const emailSchema = z
  .string()
  .min(1, errorMessages.required)
  .email(errorMessages.email);

// Schéma de base pour le mot de passe
const passwordSchema = z
  .string()
  .min(1, errorMessages.required)
  .min(6, errorMessages.minLength(6))
  .max(100, errorMessages.maxLength(100));

// Schéma pour le téléphone sénégalais
const phoneSchema = z
  .string()
  .min(1, errorMessages.required)
  .regex(
    /^(\+221|00221)?[0-9]{9}$/,
    'Format invalide. Utilisez le format: +221 XX XXX XX XX'
  );

// Schéma pour le nom
const nameSchema = z
  .string()
  .min(1, errorMessages.required)
  .min(2, errorMessages.minLength(2))
  .max(50, errorMessages.maxLength(50))
  .regex(
    /^[a-zA-ZÀ-ÿ\s'-]+$/,
    'Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets'
  );

// Schéma pour l'adresse
const addressSchema = z
  .string()
  .min(1, errorMessages.required)
  .min(10, errorMessages.minLength(10))
  .max(200, errorMessages.maxLength(200));

// Schéma pour le véhicule
const vehicleSchema = z
  .string()
  .min(1, errorMessages.required)
  .refine(
    (value) =>
      ['Scooter', 'Moto', 'Vélo', 'Voiture', 'Camionnette'].includes(value),
    'Type de véhicule invalide'
  );

// Schéma de base pour l'inscription (sans refinement)
const baseRegisterSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phoneNumber: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, errorMessages.required),
  address: addressSchema.optional(),
  vehicle: vehicleSchema.optional(),
});

// Schéma d'inscription avec refinement
export const registerSchema = baseRegisterSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: errorMessages.passwordMatch,
    path: ['confirmPassword'],
  }
);

// Schéma d'inscription pour livreur
export const deliverRegisterSchema = baseRegisterSchema
  .extend({
    address: addressSchema, // address is now required
    vehicle: vehicleSchema, // vehicle is now required
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: errorMessages.passwordMatch,
    path: ['confirmPassword'],
  });

// Schéma d'inscription pour client
export const clientRegisterSchema = baseRegisterSchema
  .extend({
    address: addressSchema.optional(), // address remains optional
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: errorMessages.passwordMatch,
    path: ['confirmPassword'],
  });

// Schéma de connexion
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// Schéma de demande de réinitialisation de mot de passe
export const requestPasswordResetSchema = z.object({
  email: emailSchema,
});

// Schéma de réinitialisation de mot de passe
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requis'),
  newPassword: passwordSchema,
});

// Schéma de vérification d'email
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token de vérification requis'),
});

// Schéma de mise à jour du profil
export const updateProfileSchema = z
  .object({
    name: nameSchema.optional(),
    phone: phoneSchema.optional(),
    address: addressSchema.optional(),
    vehicle: vehicleSchema.optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'Au moins un champ doit être modifié',
    path: ['general'],
  });

// Schéma de changement de mot de passe
export const changePasswordSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, errorMessages.required),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: errorMessages.passwordMatch,
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Le nouveau mot de passe doit être différent de l'ancien",
    path: ['newPassword'],
  });

// Types TypeScript inférés des schémas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type DeliverRegisterFormData = z.infer<typeof deliverRegisterSchema>;
export type ClientRegisterFormData = z.infer<typeof clientRegisterSchema>;
export type RequestPasswordResetFormData = z.infer<
  typeof requestPasswordResetSchema
>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// Fonction utilitaire pour extraire les erreurs Zod
export const extractZodErrors = <T>(
  error: z.ZodError<T>
): Record<string, string> => {
  const errors: Record<string, string> = {};
  error.errors.forEach((err) => {
    const field = err.path.join('.');
    errors[field] = err.message;
  });
  return errors;
};

// Fonction utilitaire pour valider un champ spécifique
export const validateField = <T>(
  schema: z.ZodSchema<T>,
  field: keyof T,
  value: unknown
): string | undefined => {
  try {
    if (schema instanceof z.ZodObject) {
      const shape = schema.shape;
      const fieldSchema = shape[field as string];
      if (fieldSchema) {
        fieldSchema.parse(value);
      }
    }
    return undefined;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message;
    }
    return undefined;
  }
};
