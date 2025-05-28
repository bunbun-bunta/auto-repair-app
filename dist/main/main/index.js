"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/main/index.ts
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const config_1 = require("../shared/config");
const database_1 = require("./database");
const base_handler_1 = require("./handlers/base-handler");
// 開発環境判定
const isDevelopment = process.env.NODE_ENV === 'development';
// グローバル変数でウィンドウへの参照を保持
let mainWindow = null;
let systemHandler = null;
// ウィンドウ作成関数
function createMainWindow() {
    console.log('メインウィンドウを作成中...');
    // メインウィンドウ作成
    const window = new electron_1.BrowserWindow({
        width: config_1.AppConfig.WINDOW.DEFAULT_WIDTH,
        height: config_1.AppConfig.WINDOW.DEFAULT_HEIGHT,
        minWidth: config_1.AppConfig.WINDOW.MIN_WIDTH,
        minHeight: config_1.AppConfig.WINDOW.MIN_HEIGHT,
        show: false,
        webPreferences: {
            preload: path_1.default.join(__dirname, '../preload/index.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: !isDevelopment, // 開発時のみfalse
        },
        icon: path_1.default.join(__dirname, '../../resources/icon.png'), // アイコンは後で追加
    });
    // 開発時はDevToolsを開く
    if (isDevelopment) {
        window.webContents.openDevTools();
    }
    // ウィンドウの準備が完了したら表示
    window.once('ready-to-show', () => {
        console.log('ウィンドウの準備が完了しました');
        window.show();
        if (isDevelopment) {
            window.webContents.send('dev-mode', true);
        }
    });
    // ウィンドウが閉じられる時の処理
    window.on('closed', () => {
        mainWindow = null;
    });
    return window;
}
// アプリケーションメニュー設定
function createMenu() {
    const template = [
        {
            label: 'ファイル',
            submenu: [
                {
                    label: '新規予定',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        // 将来的に新規予定作成ダイアログを開く
                        console.log('新規予定作成');
                    }
                },
                { type: 'separator' },
                {
                    label: 'アプリを終了',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        electron_1.app.quit();
                    }
                }
            ]
        },
        {
            label: '表示',
            submenu: [
                { role: 'reload', label: '再読み込み' },
                { role: 'forceReload', label: '強制再読み込み' },
                { role: 'toggleDevTools', label: '開発者ツール' },
                { type: 'separator' },
                { role: 'resetZoom', label: 'ズームリセット' },
                { role: 'zoomIn', label: 'ズームイン' },
                { role: 'zoomOut', label: 'ズームアウト' },
                { type: 'separator' },
                { role: 'togglefullscreen', label: 'フルスクリーン切替' }
            ]
        },
        {
            label: 'ヘルプ',
            submenu: [
                {
                    label: 'バージョン情報',
                    click: () => {
                        // 将来的にバージョン情報ダイアログを表示
                        console.log(`${config_1.AppConfig.APP_NAME} v${config_1.AppConfig.APP_VERSION}`);
                    }
                }
            ]
        }
    ];
    const menu = electron_1.Menu.buildFromTemplate(template);
    electron_1.Menu.setApplicationMenu(menu);
}
// アプリケーション初期化
async function initializeApp() {
    console.log('アプリケーションを初期化中...');
    try {
        // データベース初期化
        console.log('データベースを初期化中...');
        await (0, database_1.initializeDatabase)();
        console.log('データベース初期化完了');
        // IPCハンドラー初期化
        console.log('IPCハンドラーを初期化中...');
        systemHandler = new base_handler_1.SystemHandler();
        console.log('IPCハンドラー初期化完了');
        // メニュー作成
        createMenu();
        console.log('アプリケーション初期化完了');
    }
    catch (error) {
        console.error('アプリケーション初期化でエラーが発生しました:', error);
        // エラーダイアログを表示（将来的に実装）
        process.exit(1);
    }
}
// Electronアプリのイベントハンドラー
electron_1.app.whenReady().then(async () => {
    console.log('Electronアプリが準備完了');
    // アプリケーション初期化
    await initializeApp();
    // メインウィンドウ作成
    mainWindow = createMainWindow();
    // レンダラープロセスのURL設定
    if (isDevelopment) {
        // 開発時：Vite開発サーバー
        const rendererUrl = 'http://localhost:3000';
        console.log(`開発サーバーに接続中: ${rendererUrl}`);
        await mainWindow.loadURL(rendererUrl);
    }
    else {
        // 本番時：ビルド済みファイル
        const rendererPath = path_1.default.join(__dirname, '../renderer/index.html');
        console.log(`レンダラーファイルを読み込み中: ${rendererPath}`);
        await mainWindow.loadFile(rendererPath);
    }
});
// すべてのウィンドウが閉じられた時
electron_1.app.on('window-all-closed', () => {
    console.log('すべてのウィンドウが閉じられました');
    // macOS以外では、すべてのウィンドウが閉じられたらアプリも終了
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
// アプリがアクティベートされた時（macOS）
electron_1.app.on('activate', async () => {
    console.log('アプリがアクティベートされました');
    // ウィンドウがない場合は新しく作成
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createMainWindow();
        if (isDevelopment) {
            await mainWindow.loadURL('http://localhost:3000');
        }
        else {
            await mainWindow.loadFile(path_1.default.join(__dirname, '../renderer/index.html'));
        }
    }
});
// アプリ終了前の処理
electron_1.app.on('before-quit', () => {
    console.log('アプリケーションを終了中...');
    // クリーンアップ処理
    if (systemHandler) {
        systemHandler.cleanup();
        systemHandler = null;
    }
});
// 未処理の例外をキャッチ
process.on('uncaughtException', (error) => {
    console.error('未処理の例外:', error);
    // 本番環境では適切なエラーレポーティングを実装
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('未処理のPromise拒否:', reason, 'at:', promise);
    // 本番環境では適切なエラーレポーティングを実装
});
//# sourceMappingURL=index.js.map