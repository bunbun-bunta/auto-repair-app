"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/main/index.ts (修正版 - IPC通信対応)
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
let mainWindow = null;
// 基本的なIPCハンドラーを登録
function registerBasicHandlers() {
    // 接続テスト用ハンドラー
    electron_1.ipcMain.handle('system:test:connection', async () => {
        console.log('[IPC] 接続テストが呼び出されました');
        return {
            success: true,
            data: {
                status: 'connected',
                timestamp: new Date().toISOString(),
                message: 'IPC通信が正常に動作しています'
            }
        };
    });
    // アプリ情報取得ハンドラー
    electron_1.ipcMain.handle('app:getVersion', async () => {
        console.log('[IPC] バージョン情報が要求されました');
        return {
            success: true,
            data: {
                version: electron_1.app.getVersion(),
                name: electron_1.app.getName()
            }
        };
    });
    // パス情報取得ハンドラー
    electron_1.ipcMain.handle('app:getPath', async () => {
        console.log('[IPC] パス情報が要求されました');
        return {
            success: true,
            data: {
                userData: electron_1.app.getPath('userData'),
                documents: electron_1.app.getPath('documents'),
                temp: electron_1.app.getPath('temp')
            }
        };
    });
    console.log('[IPC] 基本ハンドラーを登録しました');
}
// メインウィンドウ作成
function createWindow() {
    console.log('[MAIN] メインウィンドウを作成中...');
    mainWindow = new electron_1.BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 800,
        show: false,
        webPreferences: {
            preload: path_1.default.join(__dirname, '../preload/index.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false, // 開発時のみ
        },
        icon: path_1.default.join(__dirname, '../../resources/icon.png'), // 存在しなくてもOK
    });
    // 開発時はlocalhost、本番時はローカルファイル
    const isDev = process.env.NODE_ENV === 'development';
    console.log('[MAIN] 開発モード:', isDev);
    if (isDev) {
        console.log('[MAIN] 開発サーバーに接続中: http://localhost:3000');
        mainWindow.loadURL('http://localhost:3000');
        // 開発者ツールを開く
        mainWindow.webContents.openDevTools();
    }
    else {
        const rendererPath = path_1.default.join(__dirname, '../renderer/index.html');
        console.log('[MAIN] レンダラーファイルを読み込み:', rendererPath);
        mainWindow.loadFile(rendererPath);
    }
    // 準備完了後に表示
    mainWindow.once('ready-to-show', () => {
        console.log('[MAIN] ウィンドウの準備が完了しました');
        if (mainWindow) {
            mainWindow.show();
        }
    });
    // ウィンドウクローズイベント
    mainWindow.on('closed', () => {
        console.log('[MAIN] メインウィンドウが閉じられました');
        mainWindow = null;
    });
    // Web Contents関連のイベント
    mainWindow.webContents.on('did-finish-load', () => {
        console.log('[MAIN] ページの読み込みが完了しました');
    });
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('[MAIN] ページの読み込みに失敗:', errorCode, errorDescription);
    });
}
// アプリケーション初期化
async function initializeApp() {
    try {
        console.log('[MAIN] アプリケーション初期化開始');
        // 基本IPCハンドラーを登録
        registerBasicHandlers();
        // メインウィンドウ作成
        createWindow();
        console.log('[MAIN] アプリケーション初期化完了');
    }
    catch (error) {
        console.error('[MAIN] アプリケーション初期化でエラーが発生:', error);
        electron_1.app.quit();
    }
}
// Electronアプリのライフサイクル
electron_1.app.whenReady().then(() => {
    console.log('[MAIN] Electronアプリが準備完了');
    initializeApp();
});
electron_1.app.on('window-all-closed', () => {
    console.log('[MAIN] すべてのウィンドウが閉じられました');
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    console.log('[MAIN] アプリがアクティベートされました');
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
// アプリ終了前の処理
electron_1.app.on('before-quit', () => {
    console.log('[MAIN] アプリケーションを終了中...');
});
// 未処理の例外をキャッチ
process.on('uncaughtException', (error) => {
    console.error('[MAIN] 未処理の例外:', error);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('[MAIN] 未処理のPromise拒否:', reason, 'at:', promise);
});
//# sourceMappingURL=index.js.map