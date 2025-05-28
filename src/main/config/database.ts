// データベース設定
export const DatabaseConfig = {
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
    INTERVAL: 24 * 60 * 60 * 1000, // 24時間
    MAX_BACKUPS: 30,
  },
  
  // パフォーマンス設定
  PERFORMANCE: {
    ENABLE_FOREIGN_KEYS: true,
    ENABLE_TRIGGERS: true,
    AUTO_VACUUM: 'INCREMENTAL',
    PAGE_SIZE: 4096,
  },
} as const;