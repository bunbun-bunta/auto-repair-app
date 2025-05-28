// src/shared/utils/index.ts
export * from './validation';
export * from './color';

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

    combineValidationResults: (results: ValidationResult[]): ValidationResult => {
        const allErrors = results.flatMap(result => result.errors);
        return {
            isValid: allErrors.length === 0,
            errors: allErrors,
        };
    },
};

// src/shared/utils/color.ts
export const ColorUtils = {
    hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        } : null;
    },

    rgbToHex: (r: number, g: number, b: number): string => {
        return `#${[r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('')}`;
    },

    isValidHexColor: (color: string): boolean => {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
    },
};