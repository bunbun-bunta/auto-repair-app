// src/shared/utils/validation.ts
import { ERROR_MESSAGES } from '../constants';

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export const ValidationUtils = {
    validateRequired: (value: any): ValidationResult => {
        const isValid = value !== undefined && value !== null && value !== '';
        return {
            isValid,
            errors: isValid ? [] : [ERROR_MESSAGES.REQUIRED],
        };
    },

    validateEmail: (email: string): ValidationResult => {
        if (!email) return { isValid: true, errors: [] }; // Optional field

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);
        return {
            isValid,
            errors: isValid ? [] : [ERROR_MESSAGES.INVALID_EMAIL],
        };
    },

    validateDateRange: (startDate: string, endDate: string): ValidationResult => {
        if (!startDate || !endDate) return { isValid: true, errors: [] };

        const start = new Date(startDate);
        const end = new Date(endDate);
        const isValid = start <= end;

        return {
            isValid,
            errors: isValid ? [] : [ERROR_MESSAGES.DATE_RANGE_ERROR],
        };
    },

    combineValidationResults: (results: ValidationResult[]): ValidationResult => {
        const allErrors = results.flatMap(result => result.errors);
        return {
            isValid: allErrors.length === 0,
            errors: allErrors,
        };
    },
};