// Validation utilities for registration forms

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Email validation
export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email je obavezan';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Email adresa nije validna';
  return null;
};

// Phone validation
export const validatePhone = (phone: string): string | null => {
  if (!phone) return 'Broj telefona je obavezan';
  const phoneRegex = /^[\d\s\+\-\(\)]+$/;
  if (!phoneRegex.test(phone)) return 'Broj telefona nije u validnom formatu';
  if (phone.replace(/\D/g, '').length < 8) return 'Broj telefona je prekratak';
  return null;
};

// Password validation
export const validatePassword = (password: string): string | null => {
  if (!password) return 'Lozinka je obavezna';
  if (password.length < 12) return 'Lozinka mora imati najmanje 12 karaktera';
  if (!/[A-Z]/.test(password)) return 'Lozinka mora sadržavati veliko slovo';
  if (!/[a-z]/.test(password)) return 'Lozinka mora sadržavati malo slovo';
  if (!/[0-9]/.test(password)) return 'Lozinka mora sadržavati broj';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Lozinka mora sadržavati specijalni karakter';
  return null;
};

// Password confirmation validation
export const validatePasswordConfirmation = (password: string, confirmation: string): string | null => {
  if (!confirmation) return 'Potvrda lozinke je obavezna';
  if (password !== confirmation) return 'Lozinke se ne poklapaju';
  return null;
};

// Required field validation
export const validateRequired = (value: any, fieldName: string): string | null => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} je obavezan`;
  }
  return null;
};

// URL validation
export const validateUrl = (url: string): string | null => {
  if (!url) return null; // URL is optional
  try {
    // Auto-add https:// if missing
    const urlToTest = url.startsWith('http://') || url.startsWith('https://') 
      ? url 
      : `https://${url}`;
    new URL(urlToTest);
    return null;
  } catch {
    return 'Website mora biti validna URL adresa (npr. wizmedik.com)';
  }
};

// Min length validation
export const validateMinLength = (value: string, minLength: number, fieldName: string): string | null => {
  if (!value) return null;
  if (value.length < minLength) {
    return `${fieldName} mora imati najmanje ${minLength} karaktera`;
  }
  return null;
};

// Max length validation
export const validateMaxLength = (value: string, maxLength: number, fieldName: string): string | null => {
  if (!value) return null;
  if (value.length > maxLength) {
    return `${fieldName} ne smije biti duži od ${maxLength} karaktera`;
  }
  return null;
};

// Care Home specific validation
export const validateCareHomeForm = (formData: any): ValidationResult => {
  const errors: Record<string, string> = {};

  // Basic info
  const nazivError = validateRequired(formData.naziv, 'Naziv doma');
  if (nazivError) errors.naziv = nazivError;

  const adresaError = validateRequired(formData.adresa, 'Adresa');
  if (adresaError) errors.adresa = adresaError;

  const gradError = validateRequired(formData.grad, 'Grad');
  if (gradError) errors.grad = gradError;

  const telefonError = validatePhone(formData.telefon);
  if (telefonError) errors.telefon = telefonError;

  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;

  const websiteError = validateUrl(formData.website);
  if (websiteError) errors.website = websiteError;

  const opisError = validateRequired(formData.opis, 'Opis');
  if (opisError) errors.opis = opisError;

  // Contact person
  const kontaktImeError = validateRequired(formData.kontakt_ime, 'Ime kontakt osobe');
  if (kontaktImeError) errors.kontakt_ime = kontaktImeError;

  // Account credentials
  const accountEmailError = validateEmail(formData.account_email);
  if (accountEmailError) errors.account_email = accountEmailError;

  const passwordError = validatePassword(formData.password);
  if (passwordError) errors.password = passwordError;

  const passwordConfirmationError = validatePasswordConfirmation(formData.password, formData.password_confirmation);
  if (passwordConfirmationError) errors.password_confirmation = passwordConfirmationError;

  // Terms
  if (!formData.prihvatam_uslove) {
    errors.prihvatam_uslove = 'Morate prihvatiti uslove korištenja';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Spa specific validation
export const validateSpaForm = (formData: any): ValidationResult => {
  const errors: Record<string, string> = {};

  const nazivError = validateRequired(formData.naziv, 'Naziv banje');
  if (nazivError) errors.naziv = nazivError;

  const adresaError = validateRequired(formData.adresa, 'Adresa');
  if (adresaError) errors.adresa = adresaError;

  const gradError = validateRequired(formData.grad, 'Grad');
  if (gradError) errors.grad = gradError;

  const telefonError = validatePhone(formData.telefon);
  if (telefonError) errors.telefon = telefonError;

  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;

  const websiteError = validateUrl(formData.website);
  if (websiteError) errors.website = websiteError;

  const opisError = validateRequired(formData.opis, 'Opis');
  if (opisError) errors.opis = opisError;

  const kontaktImeError = validateRequired(formData.kontakt_ime, 'Ime');
  if (kontaktImeError) errors.kontakt_ime = kontaktImeError;

  const kontaktPrezimeError = validateRequired(formData.kontakt_prezime, 'Prezime');
  if (kontaktPrezimeError) errors.kontakt_prezime = kontaktPrezimeError;

  const accountEmailError = validateEmail(formData.account_email);
  if (accountEmailError) errors.account_email = accountEmailError;

  const passwordError = validatePassword(formData.password);
  if (passwordError) errors.password = passwordError;

  const passwordConfirmationError = validatePasswordConfirmation(formData.password, formData.password_confirmation);
  if (passwordConfirmationError) errors.password_confirmation = passwordConfirmationError;

  if (!formData.prihvatam_uslove) {
    errors.prihvatam_uslove = 'Morate prihvatiti uslove korištenja';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Generic form validation
export const validateForm = (formData: any, rules: Record<string, (value: any) => string | null>): ValidationResult => {
  const errors: Record<string, string> = {};

  Object.keys(rules).forEach(field => {
    const error = rules[field](formData[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Patient registration validation
export const validatePatientForm = (formData: any): ValidationResult => {
  const errors: Record<string, string> = {};

  const imeError = validateRequired(formData.ime, 'Ime');
  if (imeError) errors.ime = imeError;

  const prezimeError = validateRequired(formData.prezime, 'Prezime');
  if (prezimeError) errors.prezime = prezimeError;

  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;

  // Password validation - minimum 8 characters for patients (less strict than providers)
  if (!formData.password) {
    errors.password = 'Lozinka je obavezna';
  } else if (formData.password.length < 8) {
    errors.password = 'Lozinka mora imati najmanje 8 karaktera';
  }

  // Telefon is optional for patients, but validate if provided
  if (formData.telefon) {
    const telefonError = validatePhone(formData.telefon);
    if (telefonError) errors.telefon = telefonError;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
