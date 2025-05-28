"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migration002AddIndexes = void 0;
exports.migration002AddIndexes = {
    id: 2,
    name: '002_add_indexes',
    up: async (db) => {
        // パフォーマンス向上のためのインデックス作成
        // 予定テーブルのインデックス
        await runQuery(db, `
      CREATE INDEX IF NOT EXISTS idx_schedules_staff_id 
      ON schedules(staff_id)
    `);
        await runQuery(db, `
      CREATE INDEX IF NOT EXISTS idx_schedules_start_datetime 
      ON schedules(start_datetime)
    `);
        await runQuery(db, `
      CREATE INDEX IF NOT EXISTS idx_schedules_billing_status 
      ON schedules(billing_status)
    `);
        await runQuery(db, `
      CREATE INDEX IF NOT EXISTS idx_schedules_customer_name 
      ON schedules(customer_name)
    `);
        // マスタテーブルのインデックス
        await runQuery(db, `
      CREATE INDEX IF NOT EXISTS idx_vehicle_types_usage_count 
      ON vehicle_types(usage_count DESC)
    `);
        await runQuery(db, `
      CREATE INDEX IF NOT EXISTS idx_customers_usage_count 
      ON customers(usage_count DESC)
    `);
        await runQuery(db, `
      CREATE INDEX IF NOT EXISTS idx_business_categories_usage_count 
      ON business_categories(usage_count DESC)
    `);
        console.log('インデックスを作成しました');
    },
    down: async (db) => {
        // インデックスを削除
        await runQuery(db, 'DROP INDEX IF EXISTS idx_schedules_staff_id');
        await runQuery(db, 'DROP INDEX IF EXISTS idx_schedules_start_datetime');
        await runQuery(db, 'DROP INDEX IF EXISTS idx_schedules_billing_status');
        await runQuery(db, 'DROP INDEX IF EXISTS idx_schedules_customer_name');
        await runQuery(db, 'DROP INDEX IF EXISTS idx_vehicle_types_usage_count');
        await runQuery(db, 'DROP INDEX IF EXISTS idx_customers_usage_count');
        await runQuery(db, 'DROP INDEX IF EXISTS idx_business_categories_usage_count');
    }
};
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
//# sourceMappingURL=002_add_indexes.js.map