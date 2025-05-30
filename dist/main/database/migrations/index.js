"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationManager = exports.migrations = void 0;
const _001_initial_1 = require("./001_initial");
const _002_add_indexes_1 = require("./002_add_indexes");
// 全マイグレーションの配列
exports.migrations = [
    _001_initial_1.migration001Initial,
    _002_add_indexes_1.migration002AddIndexes,
];
// マイグレーション管理クラス
class MigrationManager {
    constructor(db) {
        this.db = db;
    }
    // マイグレーション実行
    async runMigrations() {
        try {
            // マイグレーション管理テーブルを作成
            await this.createMigrationTable();
            // 実行済みマイグレーションを取得
            const executedMigrations = await this.getExecutedMigrations();
            // 未実行のマイグレーションを実行
            for (const migration of exports.migrations) {
                if (!executedMigrations.includes(migration.id)) {
                    console.log(`マイグレーション実行中: ${migration.name}`);
                    await migration.up(this.db);
                    await this.recordMigration(migration.id, migration.name);
                    console.log(`マイグレーション完了: ${migration.name}`);
                }
            }
            console.log('全マイグレーションが完了しました');
        }
        catch (error) {
            console.error('マイグレーションエラー:', error);
            throw error;
        }
    }
    // マイグレーション管理テーブルを作成
    createMigrationTable() {
        return new Promise((resolve, reject) => {
            const sql = `
        CREATE TABLE IF NOT EXISTS migrations (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;
            this.db.run(sql, (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    // 実行済みマイグレーションを取得
    getExecutedMigrations() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT id FROM migrations ORDER BY id', (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows.map(row => row.id));
            });
        });
    }
    // マイグレーション実行記録
    recordMigration(id, name) {
        return new Promise((resolve, reject) => {
            this.db.run('INSERT INTO migrations (id, name) VALUES (?, ?)', [id, name], (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
}
exports.MigrationManager = MigrationManager;
//# sourceMappingURL=index.js.map