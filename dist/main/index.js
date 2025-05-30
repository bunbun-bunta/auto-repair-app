"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/main/index.ts (修正版 - IPCハンドラー完全対応)
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const handlers_1 = require("./handlers");
let mainWindow = null;
let handlerManager = null;
// 詳細なパス情報を表示
function debugPaths() {
    console.log('=== 🔍 パス情報デバッグ ===');
    console.log('現在の作業ディレクトリ:', process.cwd());
    console.log('__dirname:', __dirname);
    console.log('app.getAppPath():', electron_1.app.getAppPath());
    // 複数のプリロードパス候補をチェック
    const preloadCandidates = [
        path_1.default.join(__dirname, '../preload/index.js'),
        path_1.default.join(__dirname, '../../dist/preload/index.js'),
        path_1.default.join(process.cwd(), 'dist/preload/index.js'),
        path_1.default.join(electron_1.app.getAppPath(), 'dist/preload/index.js'),
    ];
    console.log('プリロードパス候補:');
    preloadCandidates.forEach((candidate, index) => {
        const exists = fs_1.default.existsSync(candidate);
        console.log(`  ${index + 1}. ${candidate} -> ${exists ? '✅存在' : '❌不存在'}`);
    });
    console.log('=== デバッグ終了 ===\n');
}
// 基本IPCハンドラー
function setupBasicIPC() {
    console.log('🔵 [MAIN] 基本IPC設定開始');
    // システムテスト
    electron_1.ipcMain.handle('system:test:connection', async () => {
        console.log('✅ [MAIN] 接続テスト呼び出し');
        return {
            success: true,
            data: {
                status: 'connected',
                timestamp: new Date().toISOString(),
                message: 'IPC通信成功！'
            }
        };
    });
    // アプリバージョン取得
    electron_1.ipcMain.handle('app:getVersion', async () => {
        console.log('✅ [MAIN] アプリバージョン要求');
        return {
            success: true,
            data: {
                version: electron_1.app.getVersion(),
                name: electron_1.app.getName()
            }
        };
    });
    // アプリパス取得
    electron_1.ipcMain.handle('app:getPath', async () => {
        console.log('✅ [MAIN] アプリパス要求');
        return {
            success: true,
            data: {
                userData: electron_1.app.getPath('userData'),
                documents: electron_1.app.getPath('documents'),
                temp: electron_1.app.getPath('temp')
            }
        };
    });
    // 通知表示
    electron_1.ipcMain.handle('notification:show', async (event, title, body) => {
        console.log('✅ [MAIN] 通知表示要求:', { title, body });
        // Electronの通知機能を使用
        const { Notification } = require('electron');
        if (Notification.isSupported()) {
            const notification = new Notification({ title, body });
            notification.show();
            return {
                success: true,
                data: {
                    shown: true,
                    message: '通知を表示しました'
                }
            };
        }
        else {
            return {
                success: false,
                error: '通知がサポートされていません'
            };
        }
    });
    console.log('✅ [MAIN] 基本IPC設定完了');
}
// ハンドラーマネージャー初期化
async function setupHandlers() {
    try {
        console.log('🔵 [MAIN] ハンドラーマネージャー初期化開始');
        handlerManager = new handlers_1.HandlerManager();
        await handlerManager.initialize();
        console.log('✅ [MAIN] ハンドラーマネージャー初期化完了');
    }
    catch (error) {
        console.error('❌ [MAIN] ハンドラーマネージャー初期化失敗:', error);
        // ハンドラーマネージャーが失敗しても基本機能は動かす
        console.log('⚠️ [MAIN] 基本IPCのみで継続します');
    }
}
function createWindow() {
    console.log('🔵 [MAIN] ウィンドウ作成開始');
    // パス情報をデバッグ
    debugPaths();
    // 最も確実なプリロードパスを選択
    let preloadPath = '';
    const candidates = [
        path_1.default.join(__dirname, '../preload/index.js'),
        path_1.default.join(process.cwd(), 'dist/preload/index.js'),
        path_1.default.join(__dirname, '../../dist/preload/index.js'),
    ];
    for (const candidate of candidates) {
        if (fs_1.default.existsSync(candidate)) {
            preloadPath = candidate;
            console.log('✅ [MAIN] 使用するプリロードパス:', preloadPath);
            break;
        }
    }
    if (!preloadPath) {
        console.error('❌ [MAIN] プリロードファイルが見つかりません！');
        console.log('💡 [MAIN] 解決方法: npm run build:preload を実行してください');
        // プリロードなしでウィンドウを作成（デバッグ用）
        console.log('⚠️ [MAIN] プリロードなしでウィンドウを作成します（デバッグ用）');
    }
    // セキュリティ設定を改善（開発環境では一部緩和）
    const isDev = process.env.NODE_ENV === 'development';
    const webPreferences = {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: !isDev,
        devTools: true,
        allowRunningInsecureContent: isDev, // 開発環境のみ
    };
    // プリロードパスが有効な場合のみ設定
    if (preloadPath) {
        webPreferences.preload = preloadPath;
    }
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        show: false,
        webPreferences,
    });
    // 開発サーバーに接続
    console.log('🔍 [MAIN] 開発モード:', isDev);
    if (isDev) {
        console.log('🔵 [MAIN] 開発サーバーに接続中...');
        const connectToDevServer = async () => {
            const maxRetries = 10;
            let retries = 0;
            while (retries < maxRetries) {
                try {
                    await mainWindow.loadURL('http://localhost:3000');
                    console.log('✅ [MAIN] 開発サーバーに接続成功');
                    break;
                }
                catch (error) {
                    retries++;
                    console.log(`🔄 [MAIN] 開発サーバー接続試行 ${retries}/${maxRetries}`);
                    if (retries >= maxRetries) {
                        console.error('❌ [MAIN] 開発サーバーに接続できませんでした');
                        console.log('💡 [MAIN] npm run dev:renderer が起動しているか確認してください');
                    }
                    else {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            }
        };
        connectToDevServer();
        // 開発者ツールを開く
        mainWindow.webContents.openDevTools();
    }
    else {
        // 本番環境での静的ファイル読み込み
        const rendererPath = path_1.default.join(__dirname, '../renderer/index.html');
        console.log('🔵 [MAIN] 静的ファイル読み込み:', rendererPath);
        mainWindow.loadFile(rendererPath);
    }
    // ウィンドウイベント
    mainWindow.once('ready-to-show', () => {
        console.log('✅ [MAIN] ウィンドウ準備完了');
        mainWindow?.show();
        // プリロード確認（3秒後と10秒後）
        setTimeout(() => {
            console.log('🔍 [MAIN] プリロード状態確認中（3秒後）...');
            checkPreloadStatus();
        }, 3000);
        setTimeout(() => {
            console.log('🔍 [MAIN] プリロード状態確認中（10秒後）...');
            checkPreloadStatus();
        }, 10000);
    });
    mainWindow.webContents.on('did-finish-load', () => {
        console.log('✅ [MAIN] ページ読み込み完了');
    });
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('❌ [MAIN] ページ読み込み失敗:', errorCode, errorDescription);
    });
    // プリロードエラーを監視
    mainWindow.webContents.on('preload-error', (event, preloadPath, error) => {
        console.error('❌ [MAIN] プリロードエラー:', { preloadPath, error });
    });
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
// プリロード状態確認関数
function checkPreloadStatus() {
    if (!mainWindow)
        return;
    mainWindow.webContents.executeJavaScript(`
        // プリロード状態をチェック
        const hasElectronAPI = typeof window.electronAPI !== 'undefined';
        
        console.log('🔍 [RENDERER] プリロード確認:', {
            electronAPI存在: hasElectronAPI,
            electronAPIタイプ: typeof window.electronAPI,
            electronAPIキー: hasElectronAPI ? Object.keys(window.electronAPI) : null,
            windowプロパティ数: Object.keys(window).length
        });
        
        // テスト実行
        if (hasElectronAPI && window.electronAPI.testConnection) {
            try {
                window.electronAPI.testConnection().then(result => {
                    console.log('✅ [RENDERER] テスト実行成功:', result);
                    return 'プリロード完全成功';
                }).catch(error => {
                    console.error('❌ [RENDERER] テスト実行失敗:', error);
                    return 'プリロード部分的成功';
                });
            } catch (error) {
                console.error('❌ [RENDERER] テスト実行失敗:', error);
                return 'プリロード部分的成功';
            }
        } else {
            console.error('❌ [RENDERER] electronAPIが存在しません');
            return 'プリロード失敗';
        }
    `).then(result => {
        console.log('🔍 [MAIN] プリロード確認結果:', result);
    }).catch(error => {
        console.error('❌ [MAIN] プリロード確認エラー:', error);
    });
}
async function initialize() {
    console.log('🔵 [MAIN] アプリ初期化開始');
    console.log('🔍 [MAIN] Electronバージョン:', process.versions.electron);
    console.log('🔍 [MAIN] Nodeバージョン:', process.versions.node);
    try {
        // 1. 基本IPCを先に設定
        setupBasicIPC();
        // 2. ウィンドウ作成
        createWindow();
        // 3. ハンドラーマネージャー初期化（非同期）
        setTimeout(async () => {
            await setupHandlers();
        }, 1000);
        console.log('✅ [MAIN] アプリ初期化完了');
    }
    catch (error) {
        console.error('❌ [MAIN] 初期化エラー:', error);
    }
}
// アプリイベント
electron_1.app.whenReady().then(() => {
    console.log('✅ [MAIN] Electron準備完了');
    initialize();
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
// アプリ終了時のクリーンアップ
electron_1.app.on('before-quit', async () => {
    console.log('🔵 [MAIN] アプリ終了処理開始');
    if (handlerManager) {
        try {
            await handlerManager.close();
            console.log('✅ [MAIN] ハンドラーマネージャーを正常終了');
        }
        catch (error) {
            console.error('❌ [MAIN] ハンドラーマネージャー終了エラー:', error);
        }
    }
    console.log('✅ [MAIN] アプリ終了処理完了');
});
// エラーハンドリング
process.on('uncaughtException', (error) => {
    console.error('❌ [MAIN] 未処理例外:', error);
});
process.on('unhandledRejection', (reason) => {
    console.error('❌ [MAIN] 未処理Promise拒否:', reason);
});
//# sourceMappingURL=index.js.map