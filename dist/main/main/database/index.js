"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseManager = void 0;
// src/main/database/index.ts （修正版）
const sqlite3_1 = require("sqlite3");
const config_1 = require("../../shared/config");
const staff_repository_1 = require("./repositories/staff-repository");
class DatabaseManager {
    constructor() {
        this.db = null;
        this.staffRepository = null;
    }
    async initialize() {
        try {
            console.log('Initializing database...');
            // データベース接続
            this.db = new sqlite3_1.Database(config_1.DatabaseConfig.DATABASE_PATH, (err) => {
                if (err) {
                    console.error('Database connection failed:', err);
                    throw err;
                }
                console.log('Connected to SQLite database');
            });
            // WALモードを有効化（パフォーマンス向上）
            this.db.exec('PRAGMA journal_mode = WAL;');
            this.db.exec('PRAGMA synchronous = NORMAL;');
            this.db.exec('PRAGMA cache_size = -64000;'); // 64MB
            this.db.exec('PRAGMA foreign_keys = ON;');
            // テーブル作成
            await this.createTables();
            // リポジトリ初期化
            this.staffRepository = new staff_repository_1.StaffRepository(this.db);
            console.log('Database initialized successfully');
        }
        catch (error) {
            console.error('Database initialization failed:', error);
            throw error;
        }
    }
    async createTables() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not connected'));
                return;
            }
            const queries = [
                // スタッフテーブル
                `CREATE TABLE IF NOT EXISTS staff (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          display_color TEXT,
          email TEXT,
          oauth_status TEXT DEFAULT '未認証',
          permission_level TEXT DEFAULT '一般',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`,
                // 予定テーブル（将来の実装用）
                `CREATE TABLE IF NOT EXISTS schedules (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_name TEXT NOT NULL,
          vehicle_type TEXT,
          vehicle_number TEXT,
          contact_info TEXT,
          staff_id INTEGER,
          start_datetime TEXT NOT NULL,
          end_datetime TEXT,
          actual_start_datetime TEXT,
          actual_end_datetime TEXT,
          business_category TEXT NOT NULL,
          business_detail TEXT,
          billing_status TEXT DEFAULT '未請求',
          notes TEXT,
          google_event_id TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (staff_id) REFERENCES staff (id)
        )`,
                // インデックス作成
                `CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email)`,
                `CREATE INDEX IF NOT EXISTS idx_schedules_staff_id ON schedules(staff_id)`,
            ];
            let completed = 0;
            const total = queries.length;
            queries.forEach((query) => {
                this.db.exec(query, (err) => {
                    if (err) {
                        console.error('Table creation error:', err);
                        reject(err);
                        return;
                    }
                    completed++;
                    if (completed === total) {
                        console.log('All tables created successfully');
                        resolve();
                    }
                });
            });
        });
    }
    getStaffRepository() {
        if (!this.staffRepository) {
            throw new Error('StaffRepository not initialized');
        }
        return this.staffRepository;
    }
    async close() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve();
                return;
            }
            this.db.close((err) => {
                if (err) {
                    console.error('Database close error:', err);
                    reject(err);
                }
                else {
                    console.log('Database connection closed');
                    this.db = null;
                    this.staffRepository = null;
                    resolve();
                }
            });
        });
    }
}
exports.DatabaseManager = DatabaseManager;
//# sourceMappingURL=index.js.map