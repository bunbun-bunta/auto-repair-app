// src/shared/constants/index.ts
export * from './database';
export * from './business';
export * from './validation';

// src/shared/constants/database.ts
export const TABLE_NAMES = {
    SCHEDULES: 'schedules',
    STAFF: 'staff',
    CUSTOMERS: 'customers',
    VEHICLE_TYPES: 'vehicle_types',
    BUSINESS_CATEGORIES: 'business_categories',
} as const;

// src/shared/constants/business.ts
export const EVENT_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
] as const;

export const PERMISSION_LEVELS = {
    ADMIN: '管理者',
    GENERAL: '一般',
} as const;

// src/shared/constants/validation.ts
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