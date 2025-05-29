// src/preload/index.ts (修正版 - IPC通信対応)
import { contextBridge, ipcRenderer } from 'electron';

console.log('[PRELOAD] プリロードスクリプトが開始されました');

// 型安全なIPC通信のためのAPI定義
const electronAPI = {
    // 基本的なIPC通信メソッド
    invoke: async (channel: string, ...args: any[]): Promise<any> => {
        console.log(`[PRELOAD] IPC呼び出し: ${channel}`, args);
        try {
            const result = await ipcRenderer.invoke(channel, ...args);
            console.log(`[PRELOAD] IPC応答: ${channel}`, result);
            return result;
        } catch (error) {
            console.error(`[PRELOAD] IPCエラー: ${channel}`, error);
            throw error;
        }
    },

    // イベントリスナー登録
    on: (channel: string, callback: (...args: any[]) => void) => {
        console.log(`[PRELOAD] イベントリスナー登録: ${channel}`);
        const subscription = (event: any, ...args: any[]) => callback(...args);
        ipcRenderer.on(channel, subscription);

        // クリーンアップ用の関数を返す
        return () => {
            console.log(`[PRELOAD] イベントリスナー削除: ${channel}`);
            ipcRenderer.removeListener(channel, subscription);
        };
    },

    // イベントリスナー削除
    removeListener: (channel: string, callback: (...args: any[]) => void) => {
        console.log(`[PRELOAD] イベントリスナー削除: ${channel}`);
        ipcRenderer.removeListener(channel, callback);
    },

    // よく使用されるAPI群
    // システム情報
    getAppVersion: async () => {
        return await ipcRenderer.invoke('app:getVersion');
    },

    getAppPath: async () => {
        return await ipcRenderer.invoke('app:getPath');
    },

    // 接続テスト
    testConnection: async () => {
        return await ipcRenderer.invoke('system:test:connection');
    },

    // 将来の拡張用
    showNotification: async (title: string, body: string) => {
        return await ipcRenderer.invoke('notification:show', title, body);
    },

    // デバッグ用（開発時のみ）
    _debug: {
        listChannels: () => {
            console.log('[PRELOAD] 利用可能なチャンネル:', [
                'system:test:connection',
                'app:getVersion',
                'app:getPath',
                'notification:show'
            ]);
        }
    }
};

// コンテキストブリッジでAPI公開
try {
    contextBridge.exposeInMainWorld('electronAPI', electronAPI);
    console.log('[PRELOAD] electronAPIを正常に公開しました');

    // 利用可能なメソッドをログ出力
    console.log('[PRELOAD] 公開されたAPI:', Object.keys(electronAPI));
} catch (error) {
    console.error('[PRELOAD] contextBridge.exposeInMainWorldでエラー:', error);
}

// DOM読み込み完了時のイベント
window.addEventListener('DOMContentLoaded', () => {
    console.log('[PRELOAD] DOM読み込み完了');
});

// エラーハンドリング
window.addEventListener('error', (event) => {
    console.error('[PRELOAD] グローバルエラー:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('[PRELOAD] 未処理のPromise拒否:', event.reason);
});

console.log('[PRELOAD] プリロードスクリプトの設定が完了しました');