import { VALIDATION_RULES, ERROR_MESSAGES } from '../constants';

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

// バリデーション関数
export const ValidationUtils = {
    // 必須チェック
    validateRequired: (value: any): ValidationResult => {
        const isValid = value !== undefined && value !== null && value !== '';
        return {
            isValid,
            errors: isValid ? [] : [ERROR_MESSAGES.REQUIRED],
        };
    },

    // メールアドレスチェック
    validateEmail: (email: string): ValidationResult => {
        if (!email) return { isValid: true, errors: [] }; // 任意項目

        const isValid = VALIDATION_RULES.EMAIL.PATTERN.test(email);
        return {
            isValid,
            errors: isValid ? [] : [ERROR_MESSAGES.INVALID_EMAIL],
        };
    },

    // 日付範囲チェック
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

    // 複数のバリデーション結果をまとめる
    combineValidationResults: (results: ValidationResult[]): ValidationResult => {
        const allErrors = results.flatMap(result => result.errors);
        return {
            isValid: allErrors.length === 0,
            errors: allErrors,
        };
    },
};