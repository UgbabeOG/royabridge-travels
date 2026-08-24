/**
 * Input Validation Utilities for RoyaBridge Travels
 */

/**
 * Validates an email address format.
 * @param {string} email 
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email address is required.' };
  }

  const trimmed = email.trim();

  if (trimmed.length === 0) {
    return { isValid: false, error: 'Email address cannot be empty.' };
  }

  if (trimmed.length < 5 || trimmed.length > 254) {
    return { isValid: false, error: 'Email address must be between 5 and 254 characters.' };
  }

  // Standard RFC 5322 compliant regex for web forms
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@domain.com).' };
  }

  return { isValid: true, error: null };
}

/**
 * Validates a phone number format (supports local and international E.164 formats).
 * @param {string} phone 
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Phone or WhatsApp number is required.' };
  }

  const trimmed = phone.trim();

  if (trimmed.length === 0) {
    return { isValid: false, error: 'Phone or WhatsApp number cannot be empty.' };
  }

  // Extract digits only
  const digitsOnly = trimmed.replace(/\D/g, '');

  if (digitsOnly.length < 7) {
    return { isValid: false, error: 'Phone number must contain at least 7 digits.' };
  }

  if (digitsOnly.length > 15) {
    return { isValid: false, error: 'Phone number cannot exceed 15 digits (E.164 international standard).' };
  }

  // Valid format allows optional leading +, numbers, spaces, dashes, parentheses, dots
  const phonePattern = /^(\+?\d{1,4}[-.\s]?)?(\(?\d{1,4}\)?[-.\s]?)?[\d-.\s]{5,18}$/;

  if (!phonePattern.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid phone number (e.g. +1 555-234-5678).' };
  }

  return { isValid: true, error: null };
}

/**
 * Validates lead passenger Date of Birth (must be at least 18 years old).
 * @param {string} dob 
 * @returns {{ isValid: boolean, age?: number, error: string | null }}
 */
export function validateDob(dob) {
  if (!dob || typeof dob !== 'string') {
    return { isValid: false, error: 'Date of birth is required.' };
  }

  const trimmed = dob.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Date of birth is required for lead passenger.' };
  }

  const birthDate = new Date(trimmed);
  if (isNaN(birthDate.getTime())) {
    return { isValid: false, error: 'Please enter a valid date of birth.' };
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (birthDate > today) {
    return { isValid: false, error: 'Date of birth cannot be in the future.' };
  }

  if (age < 18) {
    return { isValid: false, age, error: 'Lead passenger must be at least 18 years old.' };
  }

  if (age > 120) {
    return { isValid: false, error: 'Please enter a valid date of birth.' };
  }

  return { isValid: true, age, error: null };
}

/**
 * Validates any passenger Date of Birth based on type (adult, child, infant) and lead status.
 * @param {string} dob 
 * @param {'adult' | 'child' | 'infant'} type 
 * @param {boolean} isLead 
 * @returns {{ isValid: boolean, age?: number, error: string | null }}
 */
export function validatePassengerDob(dob, type = 'adult', isLead = false) {
  if (!dob || typeof dob !== 'string') {
    return { isValid: false, error: 'Date of birth is required.' };
  }

  const trimmed = dob.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Date of birth is required.' };
  }

  const birthDate = new Date(trimmed);
  if (isNaN(birthDate.getTime())) {
    return { isValid: false, error: 'Please enter a valid date of birth.' };
  }

  const today = new Date();
  if (birthDate > today) {
    return { isValid: false, error: 'Date of birth cannot be in the future.' };
  }

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (isLead && age < 18) {
    return { isValid: false, age, error: 'Lead passenger must be at least 18 years old.' };
  }

  if (type === 'adult' && age < 12) {
    return { isValid: false, age, error: 'Adult passenger must be at least 12 years old.' };
  }

  if (type === 'child' && (age < 2 || age > 11)) {
    return { isValid: false, age, error: 'Child passenger must be between 2 and 11 years old (born 2014-2024).' };
  }

  if (type === 'infant' && age >= 2) {
    return { isValid: false, age, error: 'Infant passenger must be under 2 years old.' };
  }

  return { isValid: true, age, error: null };
}

/**
 * Validates lead passenger passport number.
 * @param {string} passport 
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validatePassport(passport) {
  if (!passport || typeof passport !== 'string') {
    return { isValid: false, error: 'Passport number is required.' };
  }

  const trimmed = passport.trim();
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Passport number is required.' };
  }

  if (trimmed.length < 5) {
    return { isValid: false, error: 'Passport number must be at least 5 characters.' };
  }

  if (trimmed.length > 20) {
    return { isValid: false, error: 'Passport number cannot exceed 20 characters.' };
  }

  if (!/^[a-zA-Z0-9\s\-]+$/.test(trimmed)) {
    return { isValid: false, error: 'Passport number should only contain letters and numbers.' };
  }

  return { isValid: true, error: null };
}


/**
 * Validates lead passenger full legal name.
 * @param {string} name 
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validateName(name) {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Full legal name is required.' };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { isValid: false, error: 'Full legal name must be at least 2 characters.' };
  }

  if (!/^[a-zA-Z\s'\-.]+$/.test(trimmed)) {
    return { isValid: false, error: 'Full legal name should only contain letters, spaces, hyphens, and apostrophes.' };
  }

  return { isValid: true, error: null };
}
