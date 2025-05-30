"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENT_COLORS = exports.CALENDAR_CONFIG = void 0;
// カレンダー関連の定数
exports.CALENDAR_CONFIG = {
    DEFAULT_VIEW: 'month',
    VIEWS: ['month', 'week', 'day'],
    TIME_FORMAT: 'HH:mm',
    DATE_FORMAT: 'YYYY-MM-DD',
    DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
    COLORS: {
        PRIMARY: '#1976d2',
        SECONDARY: '#dc004e',
        SUCCESS: '#2e7d32',
        WARNING: '#ed6c02',
        ERROR: '#d32f2f', // エラー色
    },
};
// カレンダーイベントの色一覧
exports.EVENT_COLORS = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFEAA7',
    '#DDA0DD',
    '#98D8C8',
    '#F7DC6F' // 黄緑系
];
//# sourceMappingURL=calendar.js.map