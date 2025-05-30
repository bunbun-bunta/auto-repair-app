// src/main/database/index.ts (更新版 - MasterRepository対応)
import { Database } from 'sqlite3';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { StaffRepository } from './repositories/staff-repository';
import { ScheduleRepository } from './repositories/schedule-repository';
import { MasterRepository } from './repositories/master-repository';

export class DatabaseManager {
    private db: Database | null = null;
    private staffRepository: StaffRepository | null = null;
    private scheduleRepository: ScheduleRepository | null = null;
    private masterRepository: MasterRepository | null = null;
    private dbPath: string;

    constructor() {
        // データベースファイルのパスを動的に決定
        try {
            // Electronアプリの場合
            const userDataPath = app.getPath('userData');
            this.dbPath = path.join(userDataPath, 'auto_repair.sqlite');

            // データフォルダが存在しない場合は作成
            if (!fs.existsSync(userDataPath)) {
                fs.mkdirSync(userDataPath, { recursive: true });
            }
        } catch (error) {
            // Electronが利用できない場合（テスト環境など）
            this.dbPath = path.join(process.cwd(), 'data', 'auto_repair.sqlite');

            // dataフォルダを作成
            const dataDir = path.dirname(this.dbPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
        }

        console.log('[DB] データベースパス:', this.dbPath);
    }

    async initialize(): Promise<void> {
        try {
            console.log('[DB] データベース初期化開始...');

            // データベース接続
            await this.connect();

            // テーブル作成
            await this.createTables();

            // リポジトリ初期化
            this.staffRepository = new StaffRepository(this.db!);
            this.scheduleRepository = new ScheduleRepository(this.db!);
            this.masterRepository = new MasterRepository(this.db!);

            console.log('[DB] データベース初期化完了');
        } catch (error) {
            console.error('[DB] データベース初期化失敗:', error);
            throw error;
        }
    }

    private async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log('[DB] データベースに接続中:', this.dbPath);

            this.db = new Database(this.dbPath, (err) => {
                if (err) {
                    console.error('[DB] データベース接続失敗:', err);
                    reject(err);
                    return;
                }

                console.log('[DB] SQLiteデータベースに接続しました');

                // SQLite設定の最適化
                this.configurePragmas();
                resolve();
            });
        });
    }

    private configurePragmas(): void {
        if (!this.db) return;

        console.log('[DB] SQLite設定を最適化中...');

        // WALモード（パフォーマンス向上）
        this.db.exec('PRAGMA journal_mode = WAL;');
        // 外部キー制約を有効化
        this.db.exec('PRAGMA foreign_keys = ON;');
        // 同期設定
        this.db.exec('PRAGMA synchronous = NORMAL;');
        // キャッシュサイズ設定（64MB）
        this.db.exec('PRAGMA cache_size = -64000;');

        console.log('[DB] SQLite設定完了');
    }

    private async createTables(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('データベース接続がありません'));
                return;
            }

            console.log('[DB] テーブル作成中...');

            const queries = [
                // スタッフテーブル
                `CREATE TABLE IF NOT EXISTS staff (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    display_color TEXT NOT NULL DEFAULT '#1976d2',
                    email TEXT,
                    oauth_status TEXT DEFAULT '未認証',
                    permission_level TEXT DEFAULT '一般',
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                )`,

                // 車種マスタテーブル
                `CREATE TABLE IF NOT EXISTS vehicle_types (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE,
                    display_order INTEGER DEFAULT 0,
                    usage_count INTEGER DEFAULT 0,
                    last_used_at TEXT,
                    is_active BOOLEAN DEFAULT 1,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                )`,

                // 顧客マスタテーブル
                `CREATE TABLE IF NOT EXISTS customers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    contact_info TEXT,
                    last_service_date TEXT,
                    display_order INTEGER DEFAULT 0,
                    usage_count INTEGER DEFAULT 0,
                    last_used_at TEXT,
                    is_active BOOLEAN DEFAULT 1,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                )`,

                // 業務カテゴリマスタテーブル
                `CREATE TABLE IF NOT EXISTS business_categories (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE,
                    icon TEXT,
                    estimated_duration INTEGER,
                    display_order INTEGER DEFAULT 0,
                    usage_count INTEGER DEFAULT 0,
                    last_used_at TEXT,
                    is_active BOOLEAN DEFAULT 1,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                )`,

                // 予定テーブル
                `CREATE TABLE IF NOT EXISTS schedules (
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
                    google_event_id TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (staff_id) REFERENCES staff (id)
                )`,

                // インデックス作成
                `CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email)`,
                `CREATE INDEX IF NOT EXISTS idx_schedules_staff_id ON schedules(staff_id)`,
                `CREATE INDEX IF NOT EXISTS idx_schedules_start_datetime ON schedules(start_datetime)`,
                `CREATE INDEX IF NOT EXISTS idx_schedules_billing_status ON schedules(billing_status)`,
                `CREATE INDEX IF NOT EXISTS idx_schedules_customer_name ON schedules(customer_name)`,
                `CREATE INDEX IF NOT EXISTS idx_vehicle_types_usage_count ON vehicle_types(usage_count DESC)`,
                `CREATE INDEX IF NOT EXISTS idx_customers_usage_count ON customers(usage_count DESC)`,
                `CREATE INDEX IF NOT EXISTS idx_business_categories_usage_count ON business_categories(usage_count DESC)`,
            ];

            let completed = 0;
            const total = queries.length;

            queries.forEach((query, index) => {
                this.db!.exec(query, (err) => {
                    if (err) {
                        console.error(`[DB] テーブル作成エラー (${index}):`, err);
                        reject(err);
                        return;
                    }

                    completed++;
                    if (completed === total) {
                        console.log('[DB] 全テーブル作成完了');
                        this.insertInitialData().then(() => {
                            resolve();
                        }).catch(reject);
                    }
                });
            });
        });
    }

    private async insertInitialData(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('データベース接続がありません'));
                return;
            }

            console.log('[DB] 初期データ投入中...');

            // 既存データをチェック
            this.db.get('SELECT COUNT(*) as count FROM staff', (err, row: any) => {
                if (err) {
                    reject(err);
                    return;
                }

                // 既にデータがある場合はスキップ
                if (row.count > 0) {
                    console.log('[DB] 初期データは既に存在します');
                    resolve();
                    return;
                }

                // 初期データ投入
                const initialData = [
                    // デフォルトスタッフ
                    `INSERT INTO staff (name, display_color, permission_level) 
                     VALUES ('管理者', '#1976d2', '管理者')`,

                    // デフォルト業務カテゴリ
                    `INSERT INTO business_categories (name, icon, estimated_duration, display_order) VALUES
                     ('修理', '🔧', 120, 1),
                     ('点検', '🔍', 60, 2),
                     ('車検', '📋', 180, 3),
                     ('納車', '🚗', 30, 4),
                     ('引取り', '📦', 30, 5),
                     ('相談', '💬', 45, 6),
                     ('その他', '📝', 60, 7)`,

                    // サンプル車種データ
                    `INSERT INTO vehicle_types (name, display_order) VALUES
                     ('トヨタプリウス', 1),
                     ('ホンダフィット', 2),
                     ('ニッサンノート', 3),
                     ('スズキワゴンR', 4),
                     ('ダイハツタント', 5),
                     ('マツダデミオ', 6)`,

                    // サンプル顧客データ
                    `INSERT INTO customers (name, contact_info, display_order) VALUES
                     ('田中太郎', '090-1234-5678', 1),
                     ('佐藤花子', '080-9876-5432', 2),
                     ('山田次郎', '070-1111-2222', 3)`
                ];

                let insertCompleted = 0;
                const insertTotal = initialData.length;

                initialData.forEach((query, index) => {
                    this.db!.exec(query, (err) => {
                        if (err) {
                            console.error(`[DB] 初期データ投入エラー (${index}):`, err);
                            reject(err);
                            return;
                        }

                        insertCompleted++;
                        if (insertCompleted === insertTotal) {
                            console.log('[DB] 初期データ投入完了');
                            resolve();
                        }
                    });
                });
            });
        });
    }

    getStaffRepository(): StaffRepository {
        if (!this.staffRepository) {
            throw new Error('StaffRepository が初期化されていません');
        }
        return this.staffRepository;
    }

    getScheduleRepository(): ScheduleRepository {
        if (!this.scheduleRepository) {
            throw new Error('ScheduleRepository が初期化されていません');
        }
        return this.scheduleRepository;
    }

    getMasterRepository(): MasterRepository {
        if (!this.masterRepository) {
            throw new Error('MasterRepository が初期化されていません');
        }
        return this.masterRepository;
    }

    async close(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve();
                return;
            }

            console.log('[DB] データベース接続を閉じています...');

            this.db.close((err) => {
                if (err) {
                    console.error('[DB] データベース切断エラー:', err);
                    reject(err);
                } else {
                    console.log('[DB] データベース接続を閉じました');
                    this.db = null;
                    this.staffRepository = null;
                    this.scheduleRepository = null;
                    this.masterRepository = null;
                    resolve();
                }
            });
        });
    }

    // デバッグ用：データベース状態の確認
    async getStatus(): Promise<{
        connected: boolean;
        path: string;
        tables: string[];
        staffCount: number;
        scheduleCount: number;
        vehicleTypeCount: number;
        customerCount: number;
        businessCategoryCount: number;
    }> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve({
                    connected: false,
                    path: this.dbPath,
                    tables: [],
                    staffCount: 0,
                    scheduleCount: 0,
                    vehicleTypeCount: 0,
                    customerCount: 0,
                    businessCategoryCount: 0
                });
                return;
            }

            // テーブル一覧を取得
            this.db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables: any[]) => {
                if (err) {
                    reject(err);
                    return;
                }

                // 各テーブルのレコード数を取得
                const countQueries = [
                    'SELECT COUNT(*) as staff_count FROM staff',
                    'SELECT COUNT(*) as schedule_count FROM schedules',
                    'SELECT COUNT(*) as vehicle_type_count FROM vehicle_types WHERE is_active = 1',
                    'SELECT COUNT(*) as customer_count FROM customers WHERE is_active = 1',
                    'SELECT COUNT(*) as business_category_count FROM business_categories WHERE is_active = 1'
                ];

                Promise.all(countQueries.map(query =>
                    new Promise<number>((resolve, reject) => {
                        this.db!.get(query, (err, row: any) => {
                            if (err) reject(err);
                            else resolve(Object.values(row)[0] as number);
                        });
                    })
                )).then(([staffCount, scheduleCount, vehicleTypeCount, customerCount, businessCategoryCount]) => {
                    resolve({
                        connected: true,
                        path: this.dbPath,
                        tables: tables.map(t => t.name),
                        staffCount,
                        scheduleCount,
                        vehicleTypeCount,
                        customerCount,
                        businessCategoryCount
                    });
                }).catch(reject);
            });
        });
    }
}