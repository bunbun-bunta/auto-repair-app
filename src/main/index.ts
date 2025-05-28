// src/main/index.ts （修正版 - Electron設定修正）
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { HandlerManager } from './handlers';

let handlerManager: HandlerManager | null = null;
let mainWindow: BrowserWindow | null = null;

// メインウィンドウ作成
function createWindow(): void {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 800,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, '../preload/index.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false, // 開発時のみ
            // enableRemoteModule は削除（新しいElectronでは不要）
        },
    });

    // 開発時はlocalhost、本番時はローカルファイル
    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    // 準備完了後に表示
    mainWindow.once('ready-to-show', () => {
        if (mainWindow) {
            mainWindow.show();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

async function initializeApp(): Promise<void> {
    try {
        // ハンドラー管理を初期化
        handlerManager = new HandlerManager();
        await handlerManager.initialize();

        // メインウィンドウ作成
        createWindow();

        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Application initialization failed:', error);
        app.quit();
    }
}

app.whenReady().then(initializeApp);

app.on('window-all-closed', async () => {
    if (handlerManager) {
        await handlerManager.close();
    }

    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});