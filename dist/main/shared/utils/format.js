"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JAPANESE_MONTHS = exports.JAPANESE_WEEKDAYS = exports.FormatUtils = void 0;
// フォーマット関連のユーティリティ
exports.FormatUtils = {
    // 金額を日本円形式でフォーマット
    currency: (amount) => {
        return new Intl.NumberFormat('ja-JP', {
            style: 'currency',
            currency: 'JPY',
        }).format(amount);
    },
    // 数値を3桁区切りでフォーマット
    number: (num) => {
        return new Intl.NumberFormat('ja-JP').format(num);
    },
    // 長いテキストを省略
    truncate: (text, maxLength) => {
        if (text.length <= maxLength)
            return text;
        return text.substring(0, maxLength) + '...';
    },
    // 最初の文字を大文字に
    capitalizeFirst: (text) => {
        if (!text)
            return text;
        return text.charAt(0).toUpperCase() + text.slice(1);
    },
    // HTMLタグを除去
    removeHtmlTags: (html) => {
        return html.replace(/<[^>]*>/g, '');
    },
    // ファイル名で使えない文字を置換
    sanitizeFileName: (fileName) => {
        return fileName.replace(/[<>:"/\\|?*]/g, '_');
    },
    // 電話番号をフォーマット（例：090-1234-5678）
    formatPhoneNumber: (phone) => {
        // 数字のみ抽出
        const numbers = phone.replace(/[^0-9]/g, '');
        // 11桁の携帯電話番号の場合
        if (numbers.length === 11 && numbers.startsWith('0')) {
            return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
        }
        // 10桁の固定電話番号の場合
        if (numbers.length === 10 && numbers.startsWith('0')) {
            return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6)}`;
        }
        // フォーマットできない場合は元の値を返す
        return phone;
    },
    // 時間を分単位から時間:分形式に変換（例：90分 → 1:30）
    minutesToTimeString: (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}:${mins.toString().padStart(2, '0')}`;
    },
};
// 日本語の曜日配列
exports.JAPANESE_WEEKDAYS = [
    '日', '月', '火', '水', '木', '金', '土'
];
// 日本語の月名配列
exports.JAPANESE_MONTHS = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
];
//# sourceMappingURL=format.js.map