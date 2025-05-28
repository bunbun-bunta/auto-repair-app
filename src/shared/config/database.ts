// src/shared/config/database.ts
import path from 'path';

export const DatabaseConfig = {
    // データベースファイルのパス（動的に設定される）
    DATABASE_PATH: './data/database.sqlite',

    // バックアップ設定
    BACKUP: {
        ENABLED: true,
        INTERVAL: 24 * 60 * 60 * 1000, // 24時間
        MAX_BACKUPS: 30,
        PATH: './data/backups',
    },

    // 接続設定
    CONNECTION: {
        TIMEOUT: 30000,
        BUSY_TIMEOUT: 30000,
        JOURNAL_MODE: 'WAL',
        SYNCHRONOUS: 'NORMAL',
        CACHE_SIZE: -64000, // 64MB
    },

    // マイグレーション設定
    MIGRATION: {
        TABLE_NAME: 'migrations',
        PATH: './src/main/database/migrations',
    },

    // パフォーマンス設定
    PERFORMANCE: {
        ENABLE_FOREIGN_KEYS: true,
        ENABLE_TRIGGERS: true,
        AUTO_VACUUM: 'INCREMENTAL',
        PAGE_SIZE: 4096,
    },
} as const;

// Electronアプリ初期化後に正しいパスを取得
export const getDatabasePath = (): string => {
    try {
        const { app } = require('electron');
        if (app && app.isReady()) {
            return path.join(app.getPath('userData'), 'database.sqlite');
        }
    } catch (error) {
        // Electronが利用できない場合
    }
    return DatabaseConfig.DATABASE_PATH;
};

// データベース接続文字列を生成
export const getDatabaseConnectionString = (dbPath?: string): string => {
    const actualPath = dbPath || getDatabasePath();
    const params = new URLSearchParams({
        timeout: DatabaseConfig.CONNECTION.TIMEOUT.toString(),
        journal_mode: DatabaseConfig.CONNECTION.JOURNAL_MODE,
        synchronous: DatabaseConfig.CONNECTION.SYNCHRONOUS,
        cache_size: DatabaseConfig.CONNECTION.CACHE_SIZE.toString(),
    });

    return `${actualPath}?${params.toString()}`;
};