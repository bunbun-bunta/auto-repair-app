export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
export declare const ValidationUtils: {
    validateRequired: (value: any) => ValidationResult;
    validateEmail: (email: string) => ValidationResult;
    validateDateRange: (startDate: string, endDate: string) => ValidationResult;
    combineValidationResults: (results: ValidationResult[]) => ValidationResult;
};
