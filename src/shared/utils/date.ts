// 日付操作のユーティリティ
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