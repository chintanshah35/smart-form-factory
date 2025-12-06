'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  Eye, 
  EyeOff, 
  AlertCircle,
  Sparkles,
  Info,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react';
import { useFormFactoryStore } from '@/lib/store';
import { FormField, groupFieldsByStep } from '@/lib/schema-parser';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';

interface FormFieldComponentProps {
  field: FormField;
  register: ReturnType<typeof useForm>['register'];
  errors: Record<string, { message?: string }>;
}

function FormFieldComponent({ field, register, errors }: FormFieldComponentProps) {
  const error = errors[field.name];
  const [showPassword, setShowPassword] = useState(false);

  const inputClasses = cn(
    'form-input',
    error && 'border-destructive focus:border-destructive focus:ring-destructive/20'
  );

  const renderInput = () => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.id}
            {...register(field.name)}
            placeholder={field.placeholder}
            rows={field.rows || 4}
            className={cn(inputClasses, 'resize-y')}
            aria-describedby={error ? `${field.id}-error` : undefined}
            aria-invalid={!!error}
          />
        );

      case 'select':
        return (
          <select
            id={field.id}
            {...register(field.name)}
            className={inputClasses}
            aria-describedby={error ? `${field.id}-error` : undefined}
            aria-invalid={!!error}
          >
            <option value="">Select {field.label.toLowerCase()}...</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div 
            className="space-y-2" 
            role="radiogroup" 
            aria-label={field.label}
          >
            {field.options?.map((option) => (
              <label 
                key={option.value} 
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="radio"
                  value={option.value}
                  {...register(field.name)}
                  className="w-4 h-4 border-2 border-border text-primary focus:ring-2 focus:ring-primary/20 focus:ring-offset-0"
                  disabled={option.disabled}
                />
                <span className="text-sm text-foreground/90 group-hover:text-foreground transition-colors">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              {...register(field.name)}
              defaultChecked={field.defaultValue as boolean}
              className="w-5 h-5 rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary/20 focus:ring-offset-0"
            />
            <span className="text-sm text-foreground/90 group-hover:text-foreground transition-colors">
              {field.label}
            </span>
          </label>
        );

      case 'password':
        return (
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id={field.id}
              {...register(field.name)}
              placeholder={field.placeholder}
              className={cn(inputClasses, 'pr-10')}
              aria-describedby={error ? `${field.id}-error` : undefined}
              aria-invalid={!!error}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        );

      case 'number':
      case 'range':
        return (
          <input
            type={field.type}
            id={field.id}
            {...register(field.name, { valueAsNumber: true })}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
            className={field.type === 'range' ? 'w-full accent-primary' : inputClasses}
            aria-describedby={error ? `${field.id}-error` : undefined}
            aria-invalid={!!error}
          />
        );

      case 'file':
        return (
          <input
            type="file"
            id={field.id}
            {...register(field.name)}
            accept={field.accept}
            multiple={field.multiple}
            className={cn(
              inputClasses,
              'file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0',
              'file:bg-primary file:text-primary-foreground file:font-medium',
              'file:cursor-pointer hover:file:bg-primary/90',
              'cursor-pointer'
            )}
            aria-describedby={error ? `${field.id}-error` : undefined}
            aria-invalid={!!error}
          />
        );

      case 'color':
        return (
          <div className="flex items-center gap-3">
            <input
              type="color"
              id={field.id}
              {...register(field.name)}
              className="w-12 h-12 rounded-lg border border-border cursor-pointer overflow-hidden p-1"
            />
            <span className="text-sm text-muted-foreground">Choose a color</span>
          </div>
        );

      default:
        return (
          <input
            type={field.type}
            id={field.id}
            {...register(field.name)}
            placeholder={field.placeholder}
            minLength={field.minLength}
            maxLength={field.maxLength}
            pattern={field.pattern}
            className={inputClasses}
            aria-describedby={error ? `${field.id}-error` : undefined}
            aria-invalid={!!error}
          />
        );
    }
  };

  if (field.type === 'checkbox') {
    return (
      <motion.div 
        className="form-group"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderInput()}
        <AnimatePresence>
          {error && (
            <motion.p
              id={`${field.id}-error`}
              className="form-error flex items-center gap-1"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              {error.message || 'This field is required'}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="form-group"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <label htmlFor={field.id} className="form-label">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </label>
      
      {renderInput()}
      
      {field.description && (
        <p className="text-sm text-muted-foreground flex items-start gap-1.5 mt-1.5">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          {field.description}
        </p>
      )}
      
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${field.id}-error`}
            className="form-error flex items-center gap-1"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            {error.message || 'This field is required'}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FormPreview() {
  const { parsedFields, formTitle } = useFormFactoryStore();
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = useMemo(() => groupFieldsByStep(parsedFields), [parsedFields]);
  const isMultiStep = steps.length > 1;
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    trigger,
  } = useForm();

  const onSubmit = async (data: Record<string, unknown>) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Form data:', data);
    alert('Form submitted successfully! Check console for data.');
    reset();
    setCurrentStep(0);
  };

  const handleNext = async () => {
    const currentFields = steps[currentStep].fields.map(f => f.name);
    const isValid = await trigger(currentFields);
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (parsedFields.length === 0) {
    return (
      <motion.div 
        className="h-full flex flex-col items-center justify-center p-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Form Generated Yet</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          Paste a JSON schema in the editor and click &quot;Generate Form&quot; to see a live preview here.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Preview Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-secondary" />
          <h2 className="font-semibold text-sm">Live Preview</h2>
        </div>
        <span className="badge-secondary text-xs">
          {isMultiStep ? `${steps.length} steps` : `${parsedFields.length} fields`}
        </span>
      </div>

      {/* Form Preview */}
      <div className="flex-1 overflow-auto p-6">
        <motion.div 
          className="max-w-lg mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="card-hover">
            <h2 className="text-xl font-bold mb-1 gradient-text">
              {formTitle}
            </h2>
            
            {/* Step Progress */}
            {isMultiStep && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  {steps.map((step, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                          index < currentStep
                            ? 'bg-success text-success-foreground'
                            : index === currentStep
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={cn(
                            'h-0.5 w-8 sm:w-16 mx-1',
                            index < currentStep ? 'bg-success' : 'bg-muted'
                          )}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Step {currentStep + 1} of {steps.length}
                </p>
              </div>
            )}

            {!isMultiStep && (
              <p className="text-sm text-muted-foreground mb-6">
                Fill out the form below
              </p>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  {steps[currentStep].fields.map((field, index) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <FormFieldComponent
                        field={field}
                        register={register}
                        errors={errors as Record<string, { message?: string }>}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-6">
                {isMultiStep && currentStep > 0 && (
                  <motion.button
                    type="button"
                    onClick={handlePrev}
                    className="btn-ghost flex-1 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </motion.button>
                )}
                
                {isMultiStep && currentStep < steps.length - 1 ? (
                  <motion.button
                    type="button"
                    onClick={handleNext}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary flex-1"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </motion.button>
                )}
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
