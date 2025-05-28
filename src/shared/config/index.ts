// src/shared/config/index.ts
export * from './database';

// src/shared/config/database.ts
import path from 'path';

export const DatabaseConfig = {
    // データベースファイルのパス（仮の設定）
    DATABASE_PATH: process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'database.sqlite'),

    // 接続設定
    CONNECTION: {
        TIMEOUT: 30000,
        BUSY_TIMEOUT: 30000,
        JOURNAL_MODE: 'WAL',
        SYNCHRONOUS: 'NORMAL',
        CACHE_SIZE: -64000, // 64MB
    },
} as const;