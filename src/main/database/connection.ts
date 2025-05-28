import sqlite3 from 'sqlite3';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

// データベース接続クラス
export class DatabaseConnection {
    private db: sqlite3.Database | null = null;
    private dbPath: string;

    constructor() {
        // データベースファイルのパスを設定
        const userDataPath = app.getPath('userData');
        this.dbPath = path.join(userDataPath, 'auto_repair.sqlite');

        // データフォルダが存在しない場合は作成
        if (!fs.existsSync(userDataPath)) {
            fs.mkdirSync(userDataPath, { recursive: true });
        }
    }

    // データベースに接続
    async connect(): Promise<sqlite3.Database> {
        return new Promise((resolve, reject) => {
            if (this.db) {
                resolve(this.db);
                return;
            }

            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('データベース接続エラー:', err);
                    reject(err);
                } else {
                    console.log('データベースに接続しました:', this.dbPath);
                    this.configurePragmas();
                    resolve(this.db!);
                }
            });
        });
    }

    // データベース設定を最適化
    private configurePragmas(): void {
        if (!this.db) return;

        // WALモード（高速化）
        this.db.run('PRAGMA journal_mode = WAL');
        // 外部キー制約を有効化
        this.db.run('PRAGMA foreign_keys = ON');
        // 同期設定
        this.db.run('PRAGMA synchronous = NORMAL');
        // キャッシュサイズ設定
        this.db.run('PRAGMA cache_size = -64000');
    }

    // データベースを閉じる
    async close(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve();
                return;
            }

            this.db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('データベース接続を閉じました');
                    this.db = null;
                    resolve();
                }
            });
        });
    }

    // データベースインスタンスを取得
    getDatabase(): sqlite3.Database | null {
        return this.db;
    }

    // データベースパスを取得
    getDatabasePath(): string {
        return this.dbPath;
    }
}

// シングルトンパターンでデータベース接続を管理
export const dbConnection = new DatabaseConnection();