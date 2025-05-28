// カレンダー関連の定数
export const CALENDAR_CONFIG = {
    DEFAULT_VIEW: 'month',                    // デフォルト表示モード
    VIEWS: ['month', 'week', 'day'],         // 利用可能な表示モード
    TIME_FORMAT: 'HH:mm',                    // 時間の表示形式
    DATE_FORMAT: 'YYYY-MM-DD',               // 日付の表示形式
    DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',  // 日時の表示形式
    COLORS: {
        PRIMARY: '#1976d2',      // メイン色
        SECONDARY: '#dc004e',    // サブ色
        SUCCESS: '#2e7d32',      // 成功色
        WARNING: '#ed6c02',      // 警告色
        ERROR: '#d32f2f',        // エラー色
    },
} as const;

// カレンダーイベントの色一覧
export const EVENT_COLORS = [
    '#FF6B6B',  // 赤系
    '#4ECDC4',  // 青緑系
    '#45B7D1',  // 青系
    '#96CEB4',  // 緑系
    '#FFEAA7',  // 黄系
    '#DDA0DD',  // 紫系
    '#98D8C8',  // 水色系
    '#F7DC6F'   // 黄緑系
] as const;