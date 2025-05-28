"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_MESSAGES = exports.VALIDATION_RULES = void 0;
// バリデーション用の定数
exports.VALIDATION_RULES = {
    CUSTOMER_NAME: {
        MIN_LENGTH: 1,
        MAX_LENGTH: 100,
    },
    VEHICLE_NUMBER: {
        MIN_LENGTH: 4,
        MAX_LENGTH: 20,
        PATTERN: /^[0-9A-Za-zひらがなカタカナ\-ー　]+$/,
    },
    STAFF_NAME: {
        MIN_LENGTH: 1,
        MAX_LENGTH: 50,
    },
    EMAIL: {
        PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
};
exports.ERROR_MESSAGES = {
    REQUIRED: '必須項目です',
    INVALID_FORMAT: '形式が正しくありません',
    INVALID_EMAIL: 'メールアドレスの形式が正しくありません',
    INVALID_DATE: '日付の形式が正しくありません',
    DATE_RANGE_ERROR: '終了日時は開始日時より後に設定してください',
    DATABASE_ERROR: 'データベースエラーが発生しました',
    NETWORK_ERROR: 'ネットワークエラーが発生しました',
};
//# sourceMappingURL=validation.js.map