"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConfig = void 0;
// データベース設定
exports.DatabaseConfig = {
    // 接続設定
    CONNECTION: {
        TIMEOUT: 30000,
        BUSY_TIMEOUT: 30000,
        JOURNAL_MODE: 'WAL',
        SYNCHRONOUS: 'NORMAL',
        CACHE_SIZE: -64000, // 64MB
    },
    // バックアップ設定
    BACKUP: {
        ENABLED: true,
        INTERVAL: 24 * 60 * 60 * 1000,
        MAX_BACKUPS: 30,
    },
    // パフォーマンス設定
    PERFORMANCE: {
        ENABLE_FOREIGN_KEYS: true,
        ENABLE_TRIGGERS: true,
        AUTO_VACUUM: 'INCREMENTAL',
        PAGE_SIZE: 4096,
    },
};
//# sourceMappingURL=database.js.map