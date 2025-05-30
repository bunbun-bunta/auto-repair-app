// src/shared/utils/index.ts (更新版 - DateUtilsエクスポート追加)
export * from './validation';
export * from './color';
export * from './date';

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

// src/shared/utils/date.ts
export const DateUtils = {
    // 日付をフォーマット
    format: (date: Date | string, format: string = 'YYYY-MM-DD'): string => {
        const d = typeof date === 'string' ? new Date(date) : date;

        const map: Record<string, string> = {
            'YYYY': d.getFullYear().toString(),
            'MM': (d.getMonth() + 1).toString().padStart(2, '0'),
            'DD': d.getDate().toString().padStart(2, '0'),
            'HH': d.getHours().toString().padStart(2, '0'),
            'mm': d.getMinutes().toString().padStart(2, '0'),
        };

        return Object.entries(map).reduce((result, [key, value]) =>
            result.replace(key, value), format);
    },

    // 日付が有効かチェック
    isValid: (date: Date | string): boolean => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d instanceof Date && !isNaN(d.getTime());
    },

    // 日数を追加
    addDays: (date: Date, days: number): Date => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },

    // 同じ日かチェック
    isSameDay: (date1: Date, date2: Date): boolean => {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    },
};