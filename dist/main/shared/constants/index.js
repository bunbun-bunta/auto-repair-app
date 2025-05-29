"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_MESSAGES = exports.PERMISSION_LEVELS = exports.EVENT_COLORS = exports.TABLE_NAMES = void 0;
// src/shared/constants/index.ts
__exportStar(require("./database"), exports);
__exportStar(require("./business"), exports);
__exportStar(require("./validation"), exports);
// src/shared/constants/database.ts
exports.TABLE_NAMES = {
    SCHEDULES: 'schedules',
    STAFF: 'staff',
    CUSTOMERS: 'customers',
    VEHICLE_TYPES: 'vehicle_types',
    BUSINESS_CATEGORIES: 'business_categories',
};
// src/shared/constants/business.ts
exports.EVENT_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
];
exports.PERMISSION_LEVELS = {
    ADMIN: '管理者',
    GENERAL: '一般',
};
// src/shared/constants/validation.ts
exports.ERROR_MESSAGES = {
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
};
//# sourceMappingURL=index.js.map