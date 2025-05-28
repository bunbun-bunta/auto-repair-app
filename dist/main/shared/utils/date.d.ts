export declare const DateUtils: {
    format: (date: Date | string, format?: string) => string;
    isValid: (date: Date | string) => boolean;
    addDays: (date: Date, days: number) => Date;
    isSameDay: (date1: Date, date2: Date) => boolean;
};
