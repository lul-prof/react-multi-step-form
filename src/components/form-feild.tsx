import type { AllFormFields, StepFormData } from "@/types";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import type { useForm } from "react-hook-form";

/**
 * COMPONENT: FormField
 *
 * Reusable form field component that eliminates boilerplate.
 *
 * Why create this abstraction?
 * 1. DRY Principle - Don't Repeat Yourself
 *    - Without this: 40+ lines of repeated code per field
 *    - With this: 1 line per field
 *
 * 2. Consistency
 *    - All fields look and behave the same
 *    - Single source of truth for field structure
 *
 * 3. Maintainability
 *    - Need to change styling? Edit once, affects all fields
 *    - Need to add analytics? Add once, works everywhere
 *
 * 4. Reduced Bugs
 *    - Less code = fewer places for bugs
 *    - Single implementation = single testing point
 *
 * Component structure:
 * - Label (with htmlFor for accessibility)
 * - Input (registered with React Hook Form)
 * - Error message (conditionally shown)
 *
 * @param id - Field name (must match schema keys)
 * @param label - Display label for the field
 * @param register - React Hook Form register function
 * @param errors - Validation errors object
 * @param type - HTML input type (text, email, tel, etc.)
 * @param maxLength - Maximum character length
 */
function FormField({
  id,
  label,
  register,
  errors,
  type = "text",
  maxLength,
}: {
  id: keyof AllFormFields;
  label: string;
  register: ReturnType<typeof useForm<StepFormData>>["register"];
  errors: Record<string, { message?: string }>;
  type?: string;
  maxLength?: number;
}) {
  return (
    <div className="space-y-2">
      {/* 
        Label with htmlFor attribute
        
        Why htmlFor?
        - Accessibility: Screen readers associate label with input
        - UX: Clicking label focuses the input
        - Mobile: Larger click target
      */}
      <Label htmlFor={id}>{label}</Label>

      {/* 
        Input field registered with React Hook Form
        
        {...register(id)} spreads these properties:
        - name: Field identifier
        - onChange: Updates form state
        - onBlur: Triggers validation (depending on mode)
        - ref: React Hook Form needs ref to control the input
        
        Why spread instead of individual props?
        - Cleaner code
        - Forward compatibility (new props added by React Hook Form)
        - Less maintenance
      */}
      <Input id={id} type={type} maxLength={maxLength} {...register(id)} />

      {/* 
        Conditional Error Message
        
        Only renders when:
        1. errors[id] exists (field has error)
        2. errors[id].message exists (error has message)
        
        Styling:
        - text-sm: Smaller text
        - text-destructive: Red color (shadcn theme variable)
        
        Why conditional rendering?
        - Clean UI when no errors
        - No empty space reserved
        - Progressive disclosure pattern
      */}
      {errors[id] && (
        <p className="text-sm text-destructive">{errors[id]?.message}</p>
      )}
    </div>
  );
}

export default FormField;
