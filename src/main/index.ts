// src/main/index.ts (修正版 - IPCハンドラー完全対応)
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { HandlerManager } from './handlers';

let mainWindow: BrowserWindow | null = null;
let handlerManager: HandlerManager | null = null;

// 詳細なパス情報を表示
function debugPaths() {
    console.log('=== 🔍 パス情報デバッグ ===');
    console.log('現在の作業ディレクトリ:', process.cwd());
    console.log('__dirname:', __dirname);
    console.log('app.getAppPath():', app.getAppPath());

    // 複数のプリロードパス候補をチェック
    const preloadCandidates = [
        path.join(__dirname, '../preload/index.js'),
        path.join(__dirname, '../../dist/preload/index.js'),
        path.join(process.cwd(), 'dist/preload/index.js'),
        path.join(app.getAppPath(), 'dist/preload/index.js'),
    ];

    console.log('プリロードパス候補:');
    preloadCandidates.forEach((candidate, index) => {
        const exists = fs.existsSync(candidate);
        console.log(`  ${index + 1}. ${candidate} -> ${exists ? '✅存在' : '❌不存在'}`);
    });
    console.log('=== デバッグ終了 ===\n');
}

// 基本IPCハンドラー
function setupBasicIPC() {
    console.log('🔵 [MAIN] 基本IPC設定開始');

    // システムテスト
    ipcMain.handle('system:test:connection', async () => {
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
    ipcMain.handle('app:getVersion', async () => {
        console.log('✅ [MAIN] アプリバージョン要求');
        return {
            success: true,
            data: {
                version: app.getVersion(),
                name: app.getName()
            }
        };
    });

    // アプリパス取得
    ipcMain.handle('app:getPath', async () => {
        console.log('✅ [MAIN] アプリパス要求');
        return {
            success: true,
            data: {
                userData: app.getPath('userData'),
                documents: app.getPath('documents'),
                temp: app.getPath('temp')
            }
        };
    });

    // 通知表示
    ipcMain.handle('notification:show', async (event, title: string, body: string) => {
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
        } else {
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

        handlerManager = new HandlerManager();
        await handlerManager.initialize();

        console.log('✅ [MAIN] ハンドラーマネージャー初期化完了');
    } catch (error) {
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
        path.join(__dirname, '../preload/index.js'),
        path.join(process.cwd(), 'dist/preload/index.js'),
        path.join(__dirname, '../../dist/preload/index.js'),
    ];

    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
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
    const webPreferences: any = {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: !isDev,  // 開発環境では無効化
        devTools: true,
        allowRunningInsecureContent: isDev,  // 開発環境のみ
    };

    // プリロードパスが有効な場合のみ設定
    if (preloadPath) {
        webPreferences.preload = preloadPath;
    }

    mainWindow = new BrowserWindow({
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
                    await mainWindow!.loadURL('http://localhost:3000');
                    console.log('✅ [MAIN] 開発サーバーに接続成功');
                    break;
                } catch (error) {
                    retries++;
                    console.log(`🔄 [MAIN] 開発サーバー接続試行 ${retries}/${maxRetries}`);

                    if (retries >= maxRetries) {
                        console.error('❌ [MAIN] 開発サーバーに接続できませんでした');
                        console.log('💡 [MAIN] npm run dev:renderer が起動しているか確認してください');
                    } else {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            }
        };

        connectToDevServer();

        // 開発者ツールを開く
        mainWindow.webContents.openDevTools();
    } else {
        // 本番環境での静的ファイル読み込み
        const rendererPath = path.join(__dirname, '../renderer/index.html');
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
    if (!mainWindow) return;

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
    } catch (error) {
        console.error('❌ [MAIN] 初期化エラー:', error);
    }
}

// アプリイベント
app.whenReady().then(() => {
    console.log('✅ [MAIN] Electron準備完了');
    initialize();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// アプリ終了時のクリーンアップ
app.on('before-quit', async () => {
    console.log('🔵 [MAIN] アプリ終了処理開始');

    if (handlerManager) {
        try {
            await handlerManager.close();
            console.log('✅ [MAIN] ハンドラーマネージャーを正常終了');
        } catch (error) {
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