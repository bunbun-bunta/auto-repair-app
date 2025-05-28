"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnvironmentConfig = exports.AppConfig = void 0;
// アプリケーション基本設定
exports.AppConfig = {
    APP_NAME: 'Auto Repair Manager',
    APP_VERSION: '1.0.0',
    // 開発/本番環境の判定
    IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
    // ウィンドウ設定
    WINDOW: {
        MIN_WIDTH: 1200,
        MIN_HEIGHT: 800,
        DEFAULT_WIDTH: 1400,
        DEFAULT_HEIGHT: 900,
        SHOW: false, // 準備ができるまで非表示
    },
    // エクスポート設定
    EXPORT: {
        MAX_FILE_SIZE: 50 * 1024 * 1024,
        SUPPORTED_FORMATS: ['xlsx', 'csv', 'pdf'],
    },
};
// 環境変数から設定を読み込む関数
const loadEnvironmentConfig = () => {
    return {
        DATABASE_ENCRYPTION_KEY: process.env.DATABASE_ENCRYPTION_KEY || 'default-key',
        LOG_LEVEL: process.env.LOG_LEVEL || 'info',
        DEBUG_MODE: process.env.DEBUG_MODE === 'true',
    };
};
exports.loadEnvironmentConfig = loadEnvironmentConfig;
//# sourceMappingURL=app.js.map