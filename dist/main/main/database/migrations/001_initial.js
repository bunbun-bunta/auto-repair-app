"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migration001Initial = void 0;
exports.migration001Initial = {
    id: 1,
    name: '001_initial_tables',
    up: async (db) => {
        // 担当者テーブル
        await runQuery(db, `
      CREATE TABLE staff (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        display_color TEXT NOT NULL DEFAULT '#1976d2',
        email TEXT,
        oauth_status TEXT DEFAULT '未認証',
        permission_level TEXT DEFAULT '一般',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // 車種マスタテーブル
        await runQuery(db, `
      CREATE TABLE vehicle_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        display_order INTEGER DEFAULT 0,
        usage_count INTEGER DEFAULT 0,
        last_used_at DATETIME,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // 顧客マスタテーブル
        await runQuery(db, `
      CREATE TABLE customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        contact_info TEXT,
        last_service_date DATETIME,
        display_order INTEGER DEFAULT 0,
        usage_count INTEGER DEFAULT 0,
        last_used_at DATETIME,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // 業務カテゴリマスタテーブル
        await runQuery(db, `
      CREATE TABLE business_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        icon TEXT,
        estimated_duration INTEGER, -- 推定作業時間（分）
        display_order INTEGER DEFAULT 0,
        usage_count INTEGER DEFAULT 0,
        last_used_at DATETIME,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // 予定テーブル
        await runQuery(db, `
      CREATE TABLE schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        vehicle_type TEXT,
        vehicle_number TEXT,
        contact_info TEXT,
        staff_id INTEGER NOT NULL,
        start_datetime TEXT NOT NULL,
        end_datetime TEXT,
        actual_start_datetime TEXT,
        actual_end_datetime TEXT,
        business_category TEXT NOT NULL,
        business_detail TEXT,
        billing_status TEXT DEFAULT '未請求',
        notes TEXT,
        google_event_id TEXT, -- Googleカレンダー連携用
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (staff_id) REFERENCES staff (id)
      )
    `);
        // 初期データの挿入
        await insertInitialData(db);
    },
    down: async (db) => {
        // テーブルを削除（逆順）
        await runQuery(db, 'DROP TABLE IF EXISTS schedules');
        await runQuery(db, 'DROP TABLE IF EXISTS business_categories');
        await runQuery(db, 'DROP TABLE IF EXISTS customers');
        await runQuery(db, 'DROP TABLE IF EXISTS vehicle_types');
        await runQuery(db, 'DROP TABLE IF EXISTS staff');
    }
};
// SQL実行ヘルパー関数
function runQuery(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
// 初期データ挿入
async function insertInitialData(db) {
    // デフォルト担当者
    await runQuery(db, `
    INSERT INTO staff (name, display_color, permission_level) 
    VALUES ('管理者', '#1976d2', '管理者')
  `);
    // デフォルト業務カテゴリ
    const categories = [
        ['修理', '🔧', 120],
        ['点検', '🔍', 60],
        ['車検', '📋', 180],
        ['納車', '🚗', 30],
        ['引取り', '📦', 30],
        ['相談', '💬', 45],
        ['その他', '📝', 60]
    ];
    for (let i = 0; i < categories.length; i++) {
        const [name, icon, duration] = categories[i];
        await runQuery(db, `
      INSERT INTO business_categories (name, icon, estimated_duration, display_order) 
      VALUES (?, ?, ?, ?)
    `, [name, icon, duration, i + 1]);
    }
    // サンプル車種データ
    const vehicleTypes = [
        'トヨタプリウス', 'ホンダフィット', 'ニッサンノート',
        'スズキワゴンR', 'ダイハツタント', 'マツダデミオ'
    ];
    for (let i = 0; i < vehicleTypes.length; i++) {
        await runQuery(db, `
      INSERT INTO vehicle_types (name, display_order) 
      VALUES (?, ?)
    `, [vehicleTypes[i], i + 1]);
    }
    console.log('初期データを挿入しました');
}
//# sourceMappingURL=001_initial.js.map