export declare const FormatUtils: {
    currency: (amount: number) => string;
    number: (num: number) => string;
    truncate: (text: string, maxLength: number) => string;
    capitalizeFirst: (text: string) => string;
    removeHtmlTags: (html: string) => string;
    sanitizeFileName: (fileName: string) => string;
    formatPhoneNumber: (phone: string) => string;
    minutesToTimeString: (minutes: number) => string;
};
export declare const JAPANESE_WEEKDAYS: readonly ["日", "月", "火", "水", "木", "金", "土"];
export declare const JAPANESE_MONTHS: readonly ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
