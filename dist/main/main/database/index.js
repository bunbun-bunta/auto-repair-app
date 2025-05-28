"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabasePath = exports.getDatabase = exports.closeDatabase = exports.initializeDatabase = void 0;
const connection_1 = require("./connection");
const migrations_1 = require("./migrations");
// データベース初期化
async function initializeDatabase() {
    try {
        console.log('データベース初期化開始...');
        // データベースに接続
        const db = await connection_1.dbConnection.connect();
        // マイグレーション実行
        const migrationManager = new migrations_1.MigrationManager(db);
        await migrationManager.runMigrations();
        console.log('データベース初期化完了');
    }
    catch (error) {
        console.error('データベース初期化エラー:', error);
        throw error;
    }
}
exports.initializeDatabase = initializeDatabase;
// アプリ終了時のクリーンアップ
async function closeDatabase() {
    try {
        await connection_1.dbConnection.close();
        console.log('データベースを正常に閉じました');
    }
    catch (error) {
        console.error('データベースクローズエラー:', error);
    }
}
exports.closeDatabase = closeDatabase;
// データベース接続を取得
function getDatabase() {
    return connection_1.dbConnection.getDatabase();
}
exports.getDatabase = getDatabase;
// データベースパスを取得
function getDatabasePath() {
    return connection_1.dbConnection.getDatabasePath();
}
exports.getDatabasePath = getDatabasePath;
//# sourceMappingURL=index.js.map