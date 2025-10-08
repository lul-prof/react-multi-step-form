import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMultiStepForm } from "./use-multi-step-form";
import type { AllFormFields, Step, StepFormData } from "./types";

export default function MultiStepForm() {
  const {
    currentStep,
    formData,
    isFirstStep,
    isLastStep,
    isSubmitted,
    steps,
    goToNextStep,
    goToPreviousStep,
    updateFormData,
    submitForm,
    resetForm,
    getCurrentStepSchema,
  } = useMultiStepForm();

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    setValue,
    reset,
  } = useForm<StepFormData>({
    resolver: zodResolver(getCurrentStepSchema()),
    mode: "onChange",
    defaultValues: formData,
  });

  React.useEffect(() => {
    reset(formData);
  }, [currentStep, formData, reset]);

  const onNext = async (data: StepFormData) => {
    const isValid = await trigger();
    if (!isValid) return;

    const updatedData = { ...formData, ...data };
    updateFormData(updatedData);

    if (isLastStep) {
      try {
        submitForm(updatedData);
      } catch (error) {
        console.error("Submission failed:", error);
      }
    } else {
      goToNextStep();
    }
  };

  const onPrevious = () => goToPreviousStep();

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Success!</h2>
            <p className="text-gray-600 mb-6">Your form has been submitted.</p>
            <Button onClick={resetForm} className="w-full">
              Submit Another Form
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <ProgressSteps currentStep={currentStep} steps={steps} />
        </CardHeader>

        <CardContent className="space-y-6">
          {currentStep === 0 && (
            <PersonalInfoStep register={register} errors={errors} />
          )}
          {currentStep === 1 && (
            <ProfessionalInfoStep
              register={register}
              errors={errors}
              setValue={setValue}
            />
          )}
          {currentStep === 2 && (
            <BillingInfoStep register={register} errors={errors} />
          )}

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              disabled={isFirstStep}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button type="button" onClick={handleSubmit(onNext)}>
              {isLastStep ? "Submit" : "Next"}
              {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/** --- Progress Steps --- */
function ProgressSteps({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: Step[];
}) {
  return (
    <div className="flex justify-between items-center">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : isCurrent
                    ? "bg-primary text-primary-foreground"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span className="text-xs mt-2 font-medium">{step.name}</span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-[2px] mx-2 transition-colors ${
                  isCompleted ? "bg-primary" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/** --- Step Components --- */
interface StepProps {
  register: ReturnType<typeof useForm<StepFormData>>["register"];
  errors: Record<string, { message?: string }>;
  setValue?: ReturnType<typeof useForm<StepFormData>>["setValue"];
}

function PersonalInfoStep({ register, errors }: StepProps) {
  return (
    <div className="space-y-4">
      <CardTitle className="text-xl">Personal Information</CardTitle>
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

function ProfessionalInfoStep({ register, errors, setValue }: StepProps) {
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

      <div className="space-y-2">
        <Label htmlFor="experience">Years of Experience</Label>
        <Select
          onValueChange={(value) => {
            setValue?.(
              "experience",
              value as Extract<
                StepFormData,
                { experience: string }
              >["experience"],
              { shouldValidate: true }
            );
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

/** --- Reusable Input Field --- */
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
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} maxLength={maxLength} {...register(id)} />
      {errors[id] && (
        <p className="text-sm text-destructive">{errors[id]?.message}</p>
      )}
    </div>
  );
}
