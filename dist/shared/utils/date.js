"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateUtils = void 0;
// src/shared/utils/date.ts
exports.DateUtils = {
    // 日付をフォーマット
    format: (date, format = 'YYYY-MM-DD') => {
        const d = typeof date === 'string' ? new Date(date) : date;
        const map = {
            'YYYY': d.getFullYear().toString(),
            'MM': (d.getMonth() + 1).toString().padStart(2, '0'),
            'DD': d.getDate().toString().padStart(2, '0'),
            'HH': d.getHours().toString().padStart(2, '0'),
            'mm': d.getMinutes().toString().padStart(2, '0'),
        };
        return Object.entries(map).reduce((result, [key, value]) => result.replace(key, value), format);
    },
    // 日付が有効かチェック
    isValid: (date) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d instanceof Date && !isNaN(d.getTime());
    },
    // 日数を追加
    addDays: (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },
    // 同じ日かチェック
    isSameDay: (date1, date2) => {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    },
};
//# sourceMappingURL=date.js.map