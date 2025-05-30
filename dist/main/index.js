"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/main/index.ts (デバッグ強化版)
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
let mainWindow = null;
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
    // distディレクトリの内容確認
    const distPath = path_1.default.join(process.cwd(), 'dist');
    console.log('\ndistディレクトリ:', distPath);
    try {
        if (fs_1.default.existsSync(distPath)) {
            const distContents = fs_1.default.readdirSync(distPath);
            console.log('distディレクトリの内容:', distContents);
            // preloadディレクトリの確認
            const preloadDir = path_1.default.join(distPath, 'preload');
            if (fs_1.default.existsSync(preloadDir)) {
                const preloadContents = fs_1.default.readdirSync(preloadDir);
                console.log('dist/preloadディレクトリの内容:', preloadContents);
            }
            else {
                console.log('❌ dist/preloadディレクトリが存在しません');
            }
        }
        else {
            console.log('❌ distディレクトリが存在しません');
        }
    }
    catch (error) {
        console.error('ディレクトリ読み取りエラー:', error);
    }
    console.log('=== デバッグ終了 ===\n');
}
// 基本IPCハンドラー
function setupIPC() {
    console.log('🔵 [MAIN] IPC設定開始');
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
    console.log('✅ [MAIN] IPC設定完了');
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
    const webPreferences = {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: false,
        devTools: true,
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
    const isDev = process.env.NODE_ENV === 'development';
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
        if (hasElectronAPI && window.electronAPI.test) {
            try {
                const result = window.electronAPI.test();
                console.log('✅ [RENDERER] テスト実行成功:', result);
                return 'プリロード完全成功';
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
        setupIPC();
        createWindow();
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
// エラーハンドリング
process.on('uncaughtException', (error) => {
    console.error('❌ [MAIN] 未処理例外:', error);
});
process.on('unhandledRejection', (reason) => {
    console.error('❌ [MAIN] 未処理Promise拒否:', reason);
});
//# sourceMappingURL=index.js.map