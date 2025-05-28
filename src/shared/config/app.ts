// src/shared/config/app.ts
import path from 'path';

// app.isReady()前でも安全に読み込める基本設定
export const AppConfig = {
    APP_NAME: 'Auto Repair Manager',
    APP_VERSION: '1.0.0',

    // 開発/本番環境の判定
    IS_DEVELOPMENT: process.env.NODE_ENV === 'development',

    // 静的パス設定（Electronアプリ初期化前でも使用可能）
    PATHS: {
        USER_DATA: './data',
        DOCUMENTS: './documents',
        TEMP: './temp',
        LOGS: './logs',
    },

    // ウィンドウ設定
    WINDOW: {
        MIN_WIDTH: 1200,
        MIN_HEIGHT: 800,
        DEFAULT_WIDTH: 1400,
        DEFAULT_HEIGHT: 900,
        SHOW: false, // 準備ができるまで非表示
    },

    // アプリケーション設定
    AUTO_UPDATER: {
        CHECK_INTERVAL: 24 * 60 * 60 * 1000, // 24時間
        ALLOW_PRERELEASE: false,
    },

    // エクスポート設定
    EXPORT: {
        DEFAULT_PATH: './exports',
        MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
        SUPPORTED_FORMATS: ['xlsx', 'csv', 'pdf'],
    },
} as const;

// Electronアプリ初期化後に使用する動的パス取得関数
export const getElectronPaths = () => {
    try {
        const { app } = require('electron');
        if (app && app.isReady()) {
            return {
                USER_DATA: app.getPath('userData'),
                DOCUMENTS: app.getPath('documents'),
                TEMP: app.getPath('temp'),
                LOGS: path.join(app.getPath('logs'), 'auto-repair-app'),
            };
        }
    } catch (error) {
        // Electronが利用できない場合（レンダラープロセスなど）
    }
    return AppConfig.PATHS;
};

// 環境変数から設定を読み込む関数
export const loadEnvironmentConfig = () => {
    return {
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
        DATABASE_ENCRYPTION_KEY: process.env.DATABASE_ENCRYPTION_KEY || 'default-key',
        LOG_LEVEL: process.env.LOG_LEVEL || 'info',
        DEBUG_MODE: process.env.DEBUG_MODE === 'true',
    };
};