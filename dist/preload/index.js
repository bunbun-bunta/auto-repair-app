"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/preload/index.ts (修正版 - より堅牢なIPC通信)
const electron_1 = require("electron");
console.log('[PRELOAD] プリロードスクリプト開始');
// プリロードスクリプトが正しく実行されているかの確認
console.log('[PRELOAD] Electron version:', process.versions.electron);
console.log('[PRELOAD] Node version:', process.versions.node);
console.log('[PRELOAD] Chrome version:', process.versions.chrome);
// 型安全なIPC通信のためのAPI定義
const electronAPI = {
    // 基本的なIPC通信メソッド（エラーハンドリング強化）
    invoke: async (channel, ...args) => {
        console.log(`[PRELOAD] IPC呼び出し: ${channel}`, args);
        try {
            const result = await electron_1.ipcRenderer.invoke(channel, ...args);
            console.log(`[PRELOAD] IPC応答: ${channel}`, result);
            return result;
        }
        catch (error) {
            console.error(`[PRELOAD] IPCエラー: ${channel}`, error);
            // エラーを再スローせず、エラー情報を含むレスポンスを返す
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown IPC error',
                channel
            };
        }
    },
    // イベントリスナー登録（改善版）
    on: (channel, callback) => {
        console.log(`[PRELOAD] イベントリスナー登録: ${channel}`);
        const subscription = (event, ...args) => {
            console.log(`[PRELOAD] イベント受信: ${channel}`, args);
            callback(...args);
        };
        electron_1.ipcRenderer.on(channel, subscription);
        // クリーンアップ用の関数を返す
        return () => {
            console.log(`[PRELOAD] イベントリスナー削除: ${channel}`);
            electron_1.ipcRenderer.removeListener(channel, subscription);
        };
    },
    // イベントリスナー削除
    removeListener: (channel, callback) => {
        console.log(`[PRELOAD] イベントリスナー削除: ${channel}`);
        electron_1.ipcRenderer.removeListener(channel, callback);
    },
    // === システム情報 ===
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
    // === スタッフ管理（新規追加） ===
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
        // プリロードの状態確認
        getStatus: () => {
            return {
                electronAPI: 'loaded',
                timestamp: new Date().toISOString(),
                versions: process.versions
            };
        }
    }
};
// コンテキストブリッジでAPI公開（エラーハンドリング追加）
try {
    console.log('[PRELOAD] contextBridge.exposeInMainWorld 実行中...');
    electron_1.contextBridge.exposeInMainWorld('electronAPI', electronAPI);
    console.log('[PRELOAD] ✅ electronAPIを正常に公開しました');
    console.log('[PRELOAD] 公開されたメソッド:', Object.keys(electronAPI));
}
catch (error) {
    console.error('[PRELOAD] ❌ contextBridge.exposeInMainWorldでエラー:', error);
    // フォールバック: 直接windowオブジェクトに追加（セキュリティ上推奨されないが、デバッグ用）
    try {
        window.electronAPI = electronAPI;
        console.log('[PRELOAD] ⚠️ フォールバック: windowオブジェクトに直接追加しました');
    }
    catch (fallbackError) {
        console.error('[PRELOAD] ❌ フォールバックも失敗:', fallbackError);
    }
}
// DOM読み込み完了時のイベント
window.addEventListener('DOMContentLoaded', () => {
    console.log('[PRELOAD] ✅ DOM読み込み完了');
    // 最終確認：APIが利用可能かテスト
    if (window.electronAPI) {
        console.log('[PRELOAD] ✅ electronAPIは利用可能です');
    }
    else {
        console.error('[PRELOAD] ❌ electronAPIが利用できません');
    }
});
// エラーハンドリング
window.addEventListener('error', (event) => {
    console.error('[PRELOAD] グローバルエラー:', event.error);
});
window.addEventListener('unhandledrejection', (event) => {
    console.error('[PRELOAD] 未処理のPromise拒否:', event.reason);
});
// プリロードスクリプトが完了したことを通知
console.log('[PRELOAD] ✅ プリロードスクリプトの設定完了');
// デバッグ用：5秒後に状態確認
setTimeout(() => {
    console.log('[PRELOAD] 5秒後状態確認:');
    console.log('- window.electronAPI:', window.electronAPI ? '✅ 利用可能' : '❌ 利用不可');
    console.log('- contextIsolation:', process.contextIsolated ? '有効' : '無効');
    console.log('- nodeIntegration:', process.versions.node ? '有効' : '無効');
}, 5000);
//# sourceMappingURL=index.js.map