"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseConnectionString = exports.getDatabasePath = exports.DatabaseConfig = void 0;
// src/shared/config/database.ts
const path_1 = __importDefault(require("path"));
exports.DatabaseConfig = {
    // データベースファイルのパス（動的に設定される）
    DATABASE_PATH: './data/database.sqlite',
    // バックアップ設定
    BACKUP: {
        ENABLED: true,
        INTERVAL: 24 * 60 * 60 * 1000,
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
};
// Electronアプリ初期化後に正しいパスを取得
const getDatabasePath = () => {
    try {
        const { app } = require('electron');
        if (app && app.isReady()) {
            return path_1.default.join(app.getPath('userData'), 'database.sqlite');
        }
    }
    catch (error) {
        // Electronが利用できない場合
    }
    return exports.DatabaseConfig.DATABASE_PATH;
};
exports.getDatabasePath = getDatabasePath;
// データベース接続文字列を生成
const getDatabaseConnectionString = (dbPath) => {
    const actualPath = dbPath || (0, exports.getDatabasePath)();
    const params = new URLSearchParams({
        timeout: exports.DatabaseConfig.CONNECTION.TIMEOUT.toString(),
        journal_mode: exports.DatabaseConfig.CONNECTION.JOURNAL_MODE,
        synchronous: exports.DatabaseConfig.CONNECTION.SYNCHRONOUS,
        cache_size: exports.DatabaseConfig.CONNECTION.CACHE_SIZE.toString(),
    });
    return `${actualPath}?${params.toString()}`;
};
exports.getDatabaseConnectionString = getDatabaseConnectionString;
//# sourceMappingURL=database.js.map