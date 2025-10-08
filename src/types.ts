import { z } from "zod";

/** --- Step Schemas --- */
export const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Phone number is too short"),
});

export const professionalInfoSchema = z.object({
  company: z.string().min(1, "Company is required"),
  position: z.string().min(1, "Position is required"),
  experience: z.enum(["0-2", "3-5", "6-10", "10+"]),
  industry: z.string().min(1, "Industry is required"),
});

export const billingInfoSchema = z.object({
  cardNumber: z
    .string()
    .min(16, "Card number must be 16 digits")
    .max(16, "Card number must be 16 digits"),
  cardHolder: z.string().min(1, "Cardholder name is required"),
  expiryDate: z.string().min(4, "Invalid expiry date"),
  cvv: z.string().min(3, "Invalid CVV").max(4),
});

/** --- Step Data Types --- */
export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type ProfessionalInfo = z.infer<typeof professionalInfoSchema>;
export type BillingInfo = z.infer<typeof billingInfoSchema>;

/** --- Union of All Step Data --- */
export type StepFormData = PersonalInfo | ProfessionalInfo | BillingInfo;

export type AllFormFields = PersonalInfo & ProfessionalInfo & BillingInfo;

/** --- Step Metadata Type --- */
export interface Step {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}
