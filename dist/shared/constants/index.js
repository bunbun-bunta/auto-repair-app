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
exports.ERROR_MESSAGES = exports.BILLING_STATUS = exports.BUSINESS_CATEGORIES = exports.PERMISSION_LEVELS = exports.EVENT_COLORS = void 0;
// src/shared/constants/index.ts (修正版)
__exportStar(require("./database"), exports);
__exportStar(require("./business"), exports);
__exportStar(require("./calendar"), exports);
__exportStar(require("./validation"), exports);
// カレンダーイベントの色一覧（ここで直接定義）
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
// 権限レベル
exports.PERMISSION_LEVELS = {
    ADMIN: '管理者',
    GENERAL: '一般',
};
// 業務カテゴリ
exports.BUSINESS_CATEGORIES = {
    REPAIR: '修理',
    INSPECTION: '点検',
    VEHICLE_INSPECTION: '車検',
    DELIVERY: '納車',
    PICKUP: '引取り',
    CONSULTATION: '相談',
    OTHER: 'その他',
};
// 請求状況
exports.BILLING_STATUS = {
    UNBILLED: '未請求',
    BILLED: '請求済み',
    PAID: '入金済み',
    CANCELLED: 'キャンセル',
};
// エラーメッセージ
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