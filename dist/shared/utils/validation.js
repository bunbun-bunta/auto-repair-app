"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationUtils = void 0;
// src/shared/utils/validation.ts
const constants_1 = require("../constants");
exports.ValidationUtils = {
    validateRequired: (value) => {
        const isValid = value !== undefined && value !== null && value !== '';
        return {
            isValid,
            errors: isValid ? [] : [constants_1.ERROR_MESSAGES.REQUIRED],
        };
    },
    validateEmail: (email) => {
        if (!email)
            return { isValid: true, errors: [] }; // Optional field
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);
        return {
            isValid,
            errors: isValid ? [] : [constants_1.ERROR_MESSAGES.INVALID_EMAIL],
        };
    },
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
    combineValidationResults: (results) => {
        const allErrors = results.flatMap(result => result.errors);
        return {
            isValid: allErrors.length === 0,
            errors: allErrors,
        };
    },
};
//# sourceMappingURL=validation.js.map