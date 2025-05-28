// データベース関連の定数
export const DATABASE_CONFIG = {
    FILE_NAME: 'auto_repair.sqlite',           // データベースファイル名
    BACKUP_INTERVAL: 24 * 60 * 60 * 1000,     // バックアップ間隔（24時間）
    MAX_BACKUP_FILES: 30,                      // 最大バックアップファイル数
    CONNECTION_TIMEOUT: 5000,                  // 接続タイムアウト（5秒）
} as const;

export const TABLE_NAMES = {
    SCHEDULES: 'schedules',
    STAFF: 'staff',
    CUSTOMERS: 'customers',
    VEHICLE_TYPES: 'vehicle_types',
    BUSINESS_CATEGORIES: 'business_categories',
} as const;