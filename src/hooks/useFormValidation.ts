import { useState, useCallback } from 'react';

export interface ValidationErrors {
  [key: string]: string;
}

export interface UseFormValidationReturn {
  errors: ValidationErrors;
  touched: Record<string, boolean>;
  validateField: (field: string, value: any) => void;
  validateAllFields: (formData: any) => boolean;
  setFieldTouched: (field: string) => void;
  clearErrors: () => void;
  setErrors: (errors: ValidationErrors) => void;
}

export function useFormValidation(
  validationRules: Record<string, (value: any, formData?: any) => string | null>
): UseFormValidationReturn {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback((field: string, value: any, formData?: any) => {
    const validator = validationRules[field];
    if (!validator) return;

    const error = validator(value, formData);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
  }, [validationRules]);

  const validateAllFields = useCallback((formData: any): boolean => {
    const newErrors: ValidationErrors = {};
    const newTouched: Record<string, boolean> = {};

    Object.keys(validationRules).forEach(field => {
      newTouched[field] = true;
      const error = validationRules[field](formData[field], formData);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    setTouched(newTouched);

    return Object.keys(newErrors).length === 0;
  }, [validationRules]);

  const setFieldTouched = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  const setErrorsManually = useCallback((newErrors: ValidationErrors) => {
    setErrors(newErrors);
  }, []);

  return {
    errors,
    touched,
    validateField,
    validateAllFields,
    setFieldTouched,
    clearErrors,
    setErrors: setErrorsManually,
  };
}
