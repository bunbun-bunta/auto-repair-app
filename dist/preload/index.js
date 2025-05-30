"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/preload/index.ts (改良版 - contextIsolation確実対応)
const electron_1 = require("electron");
console.log('[PRELOAD] プリロードスクリプト開始');
console.log('[PRELOAD] contextIsolation:', process.contextIsolated);
// 型安全なIPC通信のためのAPI定義
const electronAPI = {
    // === 基本的なIPC通信メソッド ===
    invoke: async (channel, ...args) => {
        console.log(`[PRELOAD] IPC呼び出し: ${channel}`, args);
        try {
            const result = await electron_1.ipcRenderer.invoke(channel, ...args);
            console.log(`[PRELOAD] IPC応答成功: ${channel}`, result);
            return result;
        }
        catch (error) {
            console.error(`[PRELOAD] IPCエラー: ${channel}`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown IPC error',
                channel
            };
        }
    },
    // === イベントリスナー管理 ===
    on: (channel, callback) => {
        console.log(`[PRELOAD] イベントリスナー登録: ${channel}`);
        const subscription = (event, ...args) => {
            callback(...args);
        };
        electron_1.ipcRenderer.on(channel, subscription);
        return () => electron_1.ipcRenderer.removeListener(channel, subscription);
    },
    removeListener: (channel, callback) => {
        electron_1.ipcRenderer.removeListener(channel, callback);
    },
    // === システム情報API ===
    getAppVersion: async () => {
        console.log('[PRELOAD] アプリバージョン要求');
        return await electron_1.ipcRenderer.invoke('app:getVersion');
    },
    getAppPath: async () => {
        console.log('[PRELOAD] アプリパス要求');
        return await electron_1.ipcRenderer.invoke('app:getPath');
    },
    // === 接続テスト ===
    testConnection: async () => {
        console.log('[PRELOAD] 接続テスト実行');
        return await electron_1.ipcRenderer.invoke('system:test:connection');
    },
    // === 通知機能 ===
    showNotification: async (title, body) => {
        console.log('[PRELOAD] 通知表示要求:', { title, body });
        return await electron_1.ipcRenderer.invoke('notification:show', title, body);
    },
    // === スタッフ管理API ===
    staff: {
        getAll: async () => {
            console.log('[PRELOAD] スタッフ一覧取得');
            return await electron_1.ipcRenderer.invoke('staff:getAll');
        },
        getById: async (id) => {
            console.log('[PRELOAD] スタッフ取得:', id);
            return await electron_1.ipcRenderer.invoke('staff:getById', id);
        },
        create: async (data) => {
            console.log('[PRELOAD] スタッフ作成:', data);
            return await electron_1.ipcRenderer.invoke('staff:create', data);
        },
        update: async (id, data) => {
            console.log('[PRELOAD] スタッフ更新:', id, data);
            return await electron_1.ipcRenderer.invoke('staff:update', id, data);
        },
        delete: async (id) => {
            console.log('[PRELOAD] スタッフ削除:', id);
            return await electron_1.ipcRenderer.invoke('staff:delete', id);
        },
        updateOAuthStatus: async (id, status) => {
            console.log('[PRELOAD] OAuth状態更新:', id, status);
            return await electron_1.ipcRenderer.invoke('staff:updateOAuthStatus', id, status);
        },
        getStatistics: async () => {
            console.log('[PRELOAD] スタッフ統計取得');
            return await electron_1.ipcRenderer.invoke('staff:getStatistics');
        },
        checkColorUsage: async (color, excludeId) => {
            console.log('[PRELOAD] 色使用チェック:', color, excludeId);
            return await electron_1.ipcRenderer.invoke('staff:checkColorUsage', color, excludeId);
        },
        checkDependencies: async (id) => {
            console.log('[PRELOAD] 依存関係チェック:', id);
            return await electron_1.ipcRenderer.invoke('staff:checkDependencies', id);
        }
    },
    // === デバッグ機能 ===
    _debug: {
        listChannels: () => {
            const channels = [
                'system:test:connection',
                'app:getVersion',
                'app:getPath',
                'notification:show',
                'staff:getAll',
                'staff:getById',
                'staff:create',
                'staff:update',
                'staff:delete',
                'staff:updateOAuthStatus',
                'staff:getStatistics',
                'staff:checkColorUsage',
                'staff:checkDependencies'
            ];
            console.log('[PRELOAD] 利用可能なチャンネル:', channels);
            return channels;
        },
        getStatus: () => {
            return {
                electronAPI: 'loaded',
                contextIsolated: process.contextIsolated,
                timestamp: new Date().toISOString(),
                versions: process.versions
            };
        },
        test: () => {
            console.log('[PRELOAD] テスト関数実行');
            return 'プリロードAPI正常動作';
        }
    }
};
// contextBridgeでAPIを確実に公開
try {
    console.log('[PRELOAD] contextBridge.exposeInMainWorld 実行中...');
    // 重要: electronAPIを'electronAPI'として公開
    electron_1.contextBridge.exposeInMainWorld('electronAPI', electronAPI);
    console.log('[PRELOAD] ✅ electronAPIを公開しました');
    console.log('[PRELOAD] 公開キー: electronAPI');
    console.log('[PRELOAD] 公開メソッド:', Object.keys(electronAPI));
    // 公開成功の検証
    console.log('[PRELOAD] contextBridge公開成功');
}
catch (error) {
    console.error('[PRELOAD] ❌ contextBridge公開エラー:', error);
    // フォールバック1: 異なるアプローチ
    try {
        console.log('[PRELOAD] フォールバック1: 代替方法で公開');
        global.electronAPI = electronAPI;
        console.log('[PRELOAD] ✅ global経由で公開成功');
    }
    catch (fallbackError) {
        console.error('[PRELOAD] ❌ フォールバック1失敗:', fallbackError);
    }
}
// 初期化完了の通知
console.log('[PRELOAD] ✅ プリロードスクリプトの設定完了');
// レンダラープロセスが利用可能になったかの確認
const checkRendererAccess = () => {
    try {
        // DOM要素にアクセスして確認
        if (typeof window !== 'undefined') {
            console.log('[PRELOAD] window オブジェクト利用可能');
            // electronAPIがwindowで利用可能か確認
            const hasAPI = typeof window.electronAPI !== 'undefined';
            console.log(`[PRELOAD] window.electronAPI: ${hasAPI ? '✅ 利用可能' : '❌ 利用不可'}`);
            if (hasAPI) {
                console.log('[PRELOAD] 🎉 electronAPI正常にアクセス可能');
                const api = window.electronAPI;
                console.log('[PRELOAD] API詳細:', {
                    staffMethod: typeof api.staff,
                    getAppVersion: typeof api.getAppVersion,
                    testConnection: typeof api.testConnection
                });
            }
            return hasAPI;
        }
        else {
            console.log('[PRELOAD] window オブジェクト未利用');
            return false;
        }
    }
    catch (error) {
        console.error('[PRELOAD] レンダラーアクセス確認エラー:', error);
        return false;
    }
};
// DOM読み込み完了時の確認
window.addEventListener('DOMContentLoaded', () => {
    console.log('[PRELOAD] ✅ DOM読み込み完了');
    setTimeout(() => {
        const success = checkRendererAccess();
        if (success) {
            console.log('[PRELOAD] 🎉 レンダラープロセスでelectronAPI利用可能確認');
        }
        else {
            console.error('[PRELOAD] ❌ レンダラープロセスでelectronAPI利用不可');
        }
    }, 500);
});
// 段階的な確認
let attempts = 0;
const maxAttempts = 10;
const periodicCheck = () => {
    attempts++;
    if (typeof window !== 'undefined') {
        const hasAPI = typeof window.electronAPI !== 'undefined';
        console.log(`[PRELOAD] 確認 ${attempts}/${maxAttempts}: electronAPI ${hasAPI ? '✅' : '❌'}`);
        if (hasAPI) {
            console.log('[PRELOAD] 🎉 electronAPI利用可能確認完了');
            return; // 成功したので終了
        }
    }
    if (attempts < maxAttempts) {
        setTimeout(periodicCheck, 1000);
    }
    else {
        console.error('[PRELOAD] ❌ electronAPIの利用確認に失敗しました');
        // 最終診断
        console.log('[PRELOAD] 最終診断:');
        console.log('- contextIsolated:', process.contextIsolated);
        console.log('- window定義済み:', typeof window !== 'undefined');
        console.log('- contextBridge利用可能:', typeof electron_1.contextBridge !== 'undefined');
        if (typeof window !== 'undefined') {
            console.log('- windowのキー:', Object.keys(window).slice(0, 10));
        }
    }
};
// 少し遅延してから確認開始
setTimeout(periodicCheck, 500);
//# sourceMappingURL=index.js.map