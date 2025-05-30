"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TABLE_NAMES = exports.DATABASE_CONFIG = void 0;
// データベース関連の定数
exports.DATABASE_CONFIG = {
    FILE_NAME: 'auto_repair.sqlite',
    BACKUP_INTERVAL: 24 * 60 * 60 * 1000,
    MAX_BACKUP_FILES: 30,
    CONNECTION_TIMEOUT: 5000, // 接続タイムアウト（5秒）
};
exports.TABLE_NAMES = {
    SCHEDULES: 'schedules',
    STAFF: 'staff',
    CUSTOMERS: 'customers',
    VEHICLE_TYPES: 'vehicle_types',
    BUSINESS_CATEGORIES: 'business_categories',
};
//# sourceMappingURL=database.js.map