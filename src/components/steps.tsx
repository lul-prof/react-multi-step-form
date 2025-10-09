import React from "react";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardTitle } from "@/components/ui/card";
import FormField from "./form-feild";
import type { StepFormData } from "@/types";

/**
 * TYPE: StepProps
 * Shared props interface for all step components.
 *
 * Why define this?
 * - Type safety for all step components
 * - Clear contract of what props are available
 * - Easier refactoring (change in one place)
 * - Better IDE autocomplete
 *
 * setValue is optional because not all steps need it
 * (only needed for Select components that don't work with register)
 */
interface StepProps {
  register: ReturnType<typeof useForm<StepFormData>>["register"];
  errors: Record<string, { message?: string }>;
  setValue?: ReturnType<typeof useForm<StepFormData>>["setValue"];
}

/**
 * COMPONENT: PersonalInfoStep
 * Step 1 of the form - collects personal information.
 *
 * Fields:
 * - First Name (text)
 * - Last Name (text)
 * - Email (email type for keyboard optimization on mobile)
 * - Phone (tel type for numeric keyboard on mobile)
 *
 * Layout: 2-column grid for names, full-width for email/phone
 */
function PersonalInfoStep({ register, errors }: StepProps) {
  return (
    <div className="space-y-4">
      <CardTitle className="text-xl">Personal Information</CardTitle>

      {/* Two-column layout for first/last name */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          id="firstName"
          label="First Name"
          register={register}
          errors={errors}
        />
        <FormField
          id="lastName"
          label="Last Name"
          register={register}
          errors={errors}
        />
      </div>

      {/* Full-width fields */}
      <FormField
        id="email"
        label="Email Address"
        register={register}
        errors={errors}
        type="email"
      />
      <FormField
        id="phone"
        label="Phone Number"
        register={register}
        errors={errors}
        type="tel"
      />
    </div>
  );
}

/**
 * COMPONENT: ProfessionalInfoStep
 * Step 2 - collects professional/work information.
 *
 * Special handling for Select component:
 *
 * Why different from Input?
 * - shadcn/ui Select is a controlled component
 * - React Hook Form's register() doesn't work with it
 * - Must use setValue() to update form state manually
 * - Must maintain local state for the Select's value
 *
 * This is a common pattern with custom UI libraries.
 */
function ProfessionalInfoStep({ register, errors, setValue }: StepProps) {
  // Local state for Select component (controlled component pattern)
  const [experience, setExperience] = React.useState("");

  return (
    <div className="space-y-4">
      <CardTitle className="text-xl">Professional Details</CardTitle>

      <FormField
        id="company"
        label="Company"
        register={register}
        errors={errors}
      />
      <FormField
        id="position"
        label="Position"
        register={register}
        errors={errors}
      />

      {/* 
        Custom Select Component Handling
        shadcn Select requires special integration with React Hook Form
      */}
      <div className="space-y-2">
        <Label htmlFor="experience">Years of Experience</Label>
        <Select
          onValueChange={(value) => {
            // Update React Hook Form state (for validation)
            setValue?.(
              "experience",
              value as Extract<
                StepFormData,
                { experience: string }
              >["experience"],
              { shouldValidate: true } // Trigger validation immediately
            );
            // Update local state (for UI display)
            setExperience(value);
          }}
          value={experience}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select experience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0-2">0-2 years</SelectItem>
            <SelectItem value="3-5">3-5 years</SelectItem>
            <SelectItem value="6-10">6-10 years</SelectItem>
            <SelectItem value="10+">10+ years</SelectItem>
          </SelectContent>
        </Select>
        {/* Display validation error if exists */}
        {errors.experience && (
          <p className="text-sm text-destructive">
            {errors.experience.message}
          </p>
        )}
      </div>

      <FormField
        id="industry"
        label="Industry"
        register={register}
        errors={errors}
      />
    </div>
  );
}

/**
 * COMPONENT: BillingInfoStep
 * Step 3 - collects billing/payment information.
 *
 * Fields:
 * - Card Number (16 digits)
 * - Cardholder Name
 * - Expiry Date (MM/YY format)
 * - CVV (3-4 digits)
 *
 * Security note:
 * In production, NEVER handle real credit card data directly!
 * Use payment processors like:
 * - Stripe Elements
 * - PayPal
 * - Square
 * These handle PCI compliance for you.
 *
 * This example is for demonstration only.
 */
function BillingInfoStep({ register, errors }: StepProps) {
  return (
    <div className="space-y-4">
      <CardTitle className="text-xl">Billing Information</CardTitle>

      <FormField
        id="cardNumber"
        label="Card Number"
        register={register}
        errors={errors}
        maxLength={16}
      />
      <FormField
        id="cardHolder"
        label="Cardholder Name"
        register={register}
        errors={errors}
      />

      {/* Two-column layout for expiry and CVV */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          id="expiryDate"
          label="Expiry Date"
          register={register}
          errors={errors}
          maxLength={5}
        />
        <FormField
          id="cvv"
          label="CVV"
          register={register}
          errors={errors}
          maxLength={4}
        />
      </div>
    </div>
  );
}

export { PersonalInfoStep, ProfessionalInfoStep, BillingInfoStep };
