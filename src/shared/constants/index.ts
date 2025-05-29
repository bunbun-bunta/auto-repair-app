// src/shared/constants/index.ts
export * from './database';
export * from './business';
export * from './calendar';
export * from './validation';

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

// 権限レベル
export const PERMISSION_LEVELS = {
    ADMIN: '管理者',
    GENERAL: '一般',
} as const;

// 業務カテゴリ
export const BUSINESS_CATEGORIES = {
    REPAIR: '修理',
    INSPECTION: '点検',
    VEHICLE_INSPECTION: '車検',
    DELIVERY: '納車',
    PICKUP: '引取り',
    CONSULTATION: '相談',
    OTHER: 'その他',
} as const;

// 請求状況
export const BILLING_STATUS = {
    UNBILLED: '未請求',
    BILLED: '請求済み',
    PAID: '入金済み',
    CANCELLED: 'キャンセル',
} as const;

// エラーメッセージ
export const ERROR_MESSAGES = {
    REQUIRED: '必須項目です',
    INVALID_FORMAT: '形式が正しくありません',
    INVALID_EMAIL: 'メールアドレスの形式が正しくありません',
    INVALID_PHONE: '電話番号の形式が正しくありません',
    INVALID_DATE: '日付の形式が正しくありません',
    DATE_RANGE_ERROR: '終了日時は開始日時より後に設定してください',
    DUPLICATE_ERROR: '既に登録されています',
    DATABASE_ERROR: 'データベースエラーが発生しました',
    NETWORK_ERROR: 'ネットワークエラーが発生しました',
    GOOGLE_AUTH_ERROR: 'Google認証でエラーが発生しました',
} as const;