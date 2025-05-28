"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationUtils = void 0;
const constants_1 = require("../constants");
// バリデーション関数
exports.ValidationUtils = {
    // 必須チェック
    validateRequired: (value) => {
        const isValid = value !== undefined && value !== null && value !== '';
        return {
            isValid,
            errors: isValid ? [] : [constants_1.ERROR_MESSAGES.REQUIRED],
        };
    },
    // メールアドレスチェック
    validateEmail: (email) => {
        if (!email)
            return { isValid: true, errors: [] }; // 任意項目
        const isValid = constants_1.VALIDATION_RULES.EMAIL.PATTERN.test(email);
        return {
            isValid,
            errors: isValid ? [] : [constants_1.ERROR_MESSAGES.INVALID_EMAIL],
        };
    },
    // 日付範囲チェック
    validateDateRange: (startDate, endDate) => {
        if (!startDate || !endDate)
            return { isValid: true, errors: [] };
        const start = new Date(startDate);
        const end = new Date(endDate);
        const isValid = start <= end;
        return {
            isValid,
            errors: isValid ? [] : [constants_1.ERROR_MESSAGES.DATE_RANGE_ERROR],
        };
    },
    // 複数のバリデーション結果をまとめる
    combineValidationResults: (results) => {
        const allErrors = results.flatMap(result => result.errors);
        return {
            isValid: allErrors.length === 0,
            errors: allErrors,
        };
    },
};
//# sourceMappingURL=validation.js.map