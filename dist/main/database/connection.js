"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConnection = exports.DatabaseConnection = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// データベース接続クラス
class DatabaseConnection {
    constructor() {
        this.db = null;
        // データベースファイルのパスを設定
        const userDataPath = electron_1.app.getPath('userData');
        this.dbPath = path_1.default.join(userDataPath, 'auto_repair.sqlite');
        // データフォルダが存在しない場合は作成
        if (!fs_1.default.existsSync(userDataPath)) {
            fs_1.default.mkdirSync(userDataPath, { recursive: true });
        }
    }
    // データベースに接続
    async connect() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                resolve(this.db);
                return;
            }
            this.db = new sqlite3_1.default.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('データベース接続エラー:', err);
                    reject(err);
                }
                else {
                    console.log('データベースに接続しました:', this.dbPath);
                    this.configurePragmas();
                    resolve(this.db);
                }
            });
        });
    }
    // データベース設定を最適化
    configurePragmas() {
        if (!this.db)
            return;
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
    async close() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve();
                return;
            }
            this.db.close((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    console.log('データベース接続を閉じました');
                    this.db = null;
                    resolve();
                }
            });
        });
    }
    // データベースインスタンスを取得
    getDatabase() {
        return this.db;
    }
    // データベースパスを取得
    getDatabasePath() {
        return this.dbPath;
    }
}
exports.DatabaseConnection = DatabaseConnection;
// シングルトンパターンでデータベース接続を管理
exports.dbConnection = new DatabaseConnection();
//# sourceMappingURL=connection.js.map