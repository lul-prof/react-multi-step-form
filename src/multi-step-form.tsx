import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useMultiStepForm } from "./use-multi-step-form";
import type { StepFormData } from "./types";
import ProgressSteps from "./components/progress-steps";
import {
  BillingInfoStep,
  PersonalInfoStep,
  ProfessionalInfoStep,
} from "./components/steps";

/**
 * MAIN COMPONENT: MultiStepForm
 *
 * This is the orchestrator component for the entire multi-step form.
 *
 * Architecture Pattern: Container/Presenter
 * - This component = Container (handles logic, state management)
 * - Step components = Presenters (pure display, receive props)
 *
 * Responsibilities:
 * 1. Integrate custom hook for step management
 * 2. Integrate React Hook Form for validation
 * 3. Coordinate navigation between steps
 * 4. Handle form submission
 * 5. Render appropriate step based on current state
 */
export default function MultiStepForm() {
  /**
   * CUSTOM HOOK INTEGRATION
   * All step management logic comes from our custom hook.
   *
   * Why destructure everything?
   * - Clear dependencies - we see exactly what we use
   * - TypeScript benefits - better autocomplete and type checking
   * - Easier to test - mock just what's needed
   */
  const {
    currentStep, // Which step we're on (0, 1, or 2)
    formData, // Accumulated data from all steps
    isFirstStep, // Boolean - are we on step 0?
    isLastStep, // Boolean - are we on the final step?
    isSubmitted, // Boolean - has form been submitted?
    steps, // Array of step metadata (for progress indicator)
    goToNextStep, // Function to advance
    goToPreviousStep, // Function to go back
    updateFormData, // Function to save step data
    submitForm, // Function for final submission
    resetForm, // Function to start over
    getCurrentStepSchema, // Function returning current Zod schema
  } = useMultiStepForm();

  /**
   * REACT HOOK FORM SETUP
   * Manages form state, validation, and submission.
   *
   * Key configurations explained:
   *
   * 1. resolver: zodResolver(getCurrentStepSchema())
   *    - Connects Zod validation to React Hook Form
   *    - getCurrentStepSchema() returns different schema per step
   *    - This enables per-step validation (not all-at-once)
   *
   * 2. mode: "onChange"
   *    - Validates as user types
   *    - Better UX than onSubmit (immediate feedback)
   *    - Alternative modes: onBlur, onTouched, onSubmit
   *
   * 3. defaultValues: formData
   *    - Pre-fills form with existing data
   *    - Critical for navigation: when user goes back, data is still there
   *    - Must be synced via useEffect when currentStep changes
   */
  const {
    register, // Function to register input fields
    handleSubmit, // Wrapper for submit handler (includes validation)
    formState: { errors }, // Object containing validation errors
    trigger, // Manually trigger validation (useful for multi-step)
    setValue, // Programmatically set field values (needed for Select)
    reset, // Reset form to default values
  } = useForm<StepFormData>({
    resolver: zodResolver(getCurrentStepSchema()),
    mode: "onChange",
    defaultValues: formData,
  });

  /**
   * EFFECT: Synchronize form with step changes
   *
   * Why is this needed?
   * - When currentStep changes, we need a different schema
   * - React Hook Form needs to be told about the new schema
   * - We also need to restore any previously entered data for this step
   *
   * Without this effect:
   * - Going back to a previous step would show empty fields
   * - Validation errors from previous step might persist
   *
   * Dependencies explained:
   * - currentStep: trigger when step changes
   * - formData: trigger when data updates
   * - reset: stable function reference (rarely changes)
   */
  React.useEffect(() => {
    reset(formData);
  }, [currentStep, formData, reset]);

  /**
   * HANDLER: onNext
   * Handles both "Next" button and "Submit" button clicks.
   *
   * This is the heart of the multi-step logic!
   *
   * Flow breakdown:
   * 1. Validate current step fields
   * 2. If invalid → stop and show errors
   * 3. If valid → merge data with previous steps
   * 4. Update global formData state
   * 5. Check if last step:
   *    - Yes → submit complete form
   *    - No → advance to next step
   *
   * @param data - Form data from current step (validated)
   *
   * Why async?
   * - trigger() returns a Promise
   * - Allows for async validation rules if needed
   *
   * Why trigger() when we have handleSubmit?
   * - Extra safety check
   * - Ensures validation runs even if form state is stale
   * - handleSubmit already validates, but trigger is explicit
   */
  const onNext = async (data: StepFormData) => {
    // Manual validation check
    const isValid = await trigger();
    if (!isValid) return; // Stop if validation fails

    // Merge current step data with all previous data
    // Spread operator ensures we keep everything
    const updatedData = { ...formData, ...data };
    updateFormData(updatedData);

    if (isLastStep) {
      // Last step - time to submit!
      try {
        submitForm(updatedData);
      } catch (error) {
        console.error("Submission failed:", error);
        // In production: show toast notification or error message
      }
    } else {
      // Not last step - just move forward
      goToNextStep();
    }
  };

  /**
   * HANDLER: onPrevious
   * Simple wrapper for going back.
   *
   * Why so simple?
   * - No validation needed when going backwards
   * - Data is already saved in formData state
   * - Just need to change the step number
   */
  const onPrevious = () => goToPreviousStep();

  /**
   * SUCCESS SCREEN RENDER
   * Shown after successful form submission.
   *
   * Early return pattern:
   * - Keeps main render logic clean
   * - Clear separation of success state
   * - Easier to maintain
   *
   * Design: Minimalistic centered card with success icon
   */
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            {/* Success icon - green circle with checkmark */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>

            <h2 className="text-2xl font-semibold mb-2">Success!</h2>
            <p className="text-gray-600 mb-6">Your form has been submitted.</p>

            {/* Allow user to submit another form */}
            <Button onClick={resetForm} className="w-full">
              Submit Another Form
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * MAIN FORM RENDER
   * The actual multi-step form interface.
   *
   * Layout structure:
   * - Full screen centered container
   * - Card component (shadcn/ui)
   * - Header: Progress indicator
   * - Content: Current step form
   * - Footer: Navigation buttons
   */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        {/* Header: Progress Steps Indicator */}
        <CardHeader>
          <ProgressSteps currentStep={currentStep} steps={steps} />
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 
            CONDITIONAL STEP RENDERING
            Only render the current step component.
            
            Why not render all and hide with CSS?
            - Performance: Don't mount unused components
            - Simpler: Clear which step is active
            - Memory: Don't keep unnecessary DOM nodes
            
            Pattern: Switch-like conditional rendering
          */}
          {currentStep === 0 && (
            <PersonalInfoStep register={register} errors={errors} />
          )}
          {currentStep === 1 && (
            <ProfessionalInfoStep
              register={register}
              errors={errors}
              setValue={setValue} // Needed for Select component
            />
          )}
          {currentStep === 2 && (
            <BillingInfoStep register={register} errors={errors} />
          )}

          {/* 
            NAVIGATION BUTTONS
            Fixed position at bottom of card.
            
            Previous button:
            - Disabled on first step (nowhere to go back)
            - Outline variant (secondary style)
            
            Next/Submit button:
            - Text changes based on isLastStep
            - Primary button style
            - Shows arrow icon when not last step
          */}
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
