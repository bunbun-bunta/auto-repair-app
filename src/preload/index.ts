// src/preload/index.ts (改良版 - contextIsolation確実対応)
import { contextBridge, ipcRenderer } from 'electron';

console.log('[PRELOAD] プリロードスクリプト開始');
console.log('[PRELOAD] contextIsolation:', process.contextIsolated);

// 型安全なIPC通信のためのAPI定義
const electronAPI = {
    // === 基本的なIPC通信メソッド ===
    invoke: async (channel: string, ...args: any[]): Promise<any> => {
        console.log(`[PRELOAD] IPC呼び出し: ${channel}`, args);
        try {
            const result = await ipcRenderer.invoke(channel, ...args);
            console.log(`[PRELOAD] IPC応答成功: ${channel}`, result);
            return result;
        } catch (error) {
            console.error(`[PRELOAD] IPCエラー: ${channel}`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown IPC error',
                channel
            };
        }
    },

    // === イベントリスナー管理 ===
    on: (channel: string, callback: (...args: any[]) => void) => {
        console.log(`[PRELOAD] イベントリスナー登録: ${channel}`);
        const subscription = (event: any, ...args: any[]) => {
            callback(...args);
        };
        ipcRenderer.on(channel, subscription);
        return () => ipcRenderer.removeListener(channel, subscription);
    },

    removeListener: (channel: string, callback: (...args: any[]) => void) => {
        ipcRenderer.removeListener(channel, callback);
    },

    // === システム情報API ===
    getAppVersion: async () => {
        console.log('[PRELOAD] アプリバージョン要求');
        return await ipcRenderer.invoke('app:getVersion');
    },

    getAppPath: async () => {
        console.log('[PRELOAD] アプリパス要求');
        return await ipcRenderer.invoke('app:getPath');
    },

    // === 接続テスト ===
    testConnection: async () => {
        console.log('[PRELOAD] 接続テスト実行');
        return await ipcRenderer.invoke('system:test:connection');
    },

    // === 通知機能 ===
    showNotification: async (title: string, body: string) => {
        console.log('[PRELOAD] 通知表示要求:', { title, body });
        return await ipcRenderer.invoke('notification:show', title, body);
    },

    // === スタッフ管理API ===
    staff: {
        getAll: async () => {
            console.log('[PRELOAD] スタッフ一覧取得');
            return await ipcRenderer.invoke('staff:getAll');
        },

        getById: async (id: number) => {
            console.log('[PRELOAD] スタッフ取得:', id);
            return await ipcRenderer.invoke('staff:getById', id);
        },

        create: async (data: any) => {
            console.log('[PRELOAD] スタッフ作成:', data);
            return await ipcRenderer.invoke('staff:create', data);
        },

        update: async (id: number, data: any) => {
            console.log('[PRELOAD] スタッフ更新:', id, data);
            return await ipcRenderer.invoke('staff:update', id, data);
        },

        delete: async (id: number) => {
            console.log('[PRELOAD] スタッフ削除:', id);
            return await ipcRenderer.invoke('staff:delete', id);
        },

        updateOAuthStatus: async (id: number, status: string) => {
            console.log('[PRELOAD] OAuth状態更新:', id, status);
            return await ipcRenderer.invoke('staff:updateOAuthStatus', id, status);
        },

        getStatistics: async () => {
            console.log('[PRELOAD] スタッフ統計取得');
            return await ipcRenderer.invoke('staff:getStatistics');
        },

        checkColorUsage: async (color: string, excludeId?: number) => {
            console.log('[PRELOAD] 色使用チェック:', color, excludeId);
            return await ipcRenderer.invoke('staff:checkColorUsage', color, excludeId);
        },

        checkDependencies: async (id: number) => {
            console.log('[PRELOAD] 依存関係チェック:', id);
            return await ipcRenderer.invoke('staff:checkDependencies', id);
        }
    },

    // === 予定管理API ===
    schedule: {
        getAll: async () => {
            console.log('[PRELOAD] 予定一覧取得');
            return await ipcRenderer.invoke('schedule:getAll');
        },

        getById: async (id: number) => {
            console.log('[PRELOAD] 予定取得:', id);
            return await ipcRenderer.invoke('schedule:getById', id);
        },

        create: async (data: any) => {
            console.log('[PRELOAD] 予定作成:', data);
            return await ipcRenderer.invoke('schedule:create', data);
        },

        update: async (id: number, data: any) => {
            console.log('[PRELOAD] 予定更新:', id, data);
            return await ipcRenderer.invoke('schedule:update', id, data);
        },

        delete: async (id: number) => {
            console.log('[PRELOAD] 予定削除:', id);
            return await ipcRenderer.invoke('schedule:delete', id);
        },

        search: async (params: any) => {
            console.log('[PRELOAD] 予定検索:', params);
            return await ipcRenderer.invoke('schedule:search', params);
        },

        getByDateRange: async (startDate: string, endDate: string) => {
            console.log('[PRELOAD] 期間指定予定取得:', startDate, endDate);
            return await ipcRenderer.invoke('schedule:getByDateRange', startDate, endDate);
        },

        getToday: async () => {
            console.log('[PRELOAD] 今日の予定取得');
            return await ipcRenderer.invoke('schedule:getToday');
        },

        getMonthlyStatistics: async (year: number, month: number) => {
            console.log('[PRELOAD] 月間統計取得:', year, month);
            return await ipcRenderer.invoke('schedule:getMonthlyStatistics', year, month);
        },

        complete: async (id: number, actualEndDatetime?: string) => {
            console.log('[PRELOAD] 予定完了:', id, actualEndDatetime);
            return await ipcRenderer.invoke('schedule:complete', id, actualEndDatetime);
        },

        updateBillingStatus: async (id: number, status: string) => {
            console.log('[PRELOAD] 請求状況更新:', id, status);
            return await ipcRenderer.invoke('schedule:updateBillingStatus', id, status);
        },

        checkTimeConflict: async (staffId: number, startDatetime: string, endDatetime: string, excludeScheduleId?: number) => {
            console.log('[PRELOAD] 時間重複チェック:', staffId, startDatetime, endDatetime);
            return await ipcRenderer.invoke('schedule:checkTimeConflict', staffId, startDatetime, endDatetime, excludeScheduleId);
        },

        getUnsynced: async () => {
            console.log('[PRELOAD] 未同期予定取得');
            return await ipcRenderer.invoke('schedule:getUnsynced');
        },

        updateGoogleEventId: async (scheduleId: number, googleEventId: string) => {
            console.log('[PRELOAD] GoogleイベントID更新:', scheduleId, googleEventId);
            return await ipcRenderer.invoke('schedule:updateGoogleEventId', scheduleId, googleEventId);
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
                'staff:checkDependencies',
                'schedule:getAll',
                'schedule:getById',
                'schedule:create',
                'schedule:update',
                'schedule:delete',
                'schedule:search',
                'schedule:getByDateRange',
                'schedule:getToday',
                'schedule:getMonthlyStatistics',
                'schedule:complete',
                'schedule:updateBillingStatus',
                'schedule:checkTimeConflict',
                'schedule:getUnsynced',
                'schedule:updateGoogleEventId'
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
    contextBridge.exposeInMainWorld('electronAPI', electronAPI);

    console.log('[PRELOAD] ✅ electronAPIを公開しました');
    console.log('[PRELOAD] 公開キー: electronAPI');
    console.log('[PRELOAD] 公開メソッド:', Object.keys(electronAPI));

    // 公開成功の検証
    console.log('[PRELOAD] contextBridge公開成功');

} catch (error) {
    console.error('[PRELOAD] ❌ contextBridge公開エラー:', error);

    // フォールバック1: 異なるアプローチ
    try {
        console.log('[PRELOAD] フォールバック1: 代替方法で公開');
        (global as any).electronAPI = electronAPI;
        console.log('[PRELOAD] ✅ global経由で公開成功');
    } catch (fallbackError) {
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
            const hasAPI = typeof (window as any).electronAPI !== 'undefined';
            console.log(`[PRELOAD] window.electronAPI: ${hasAPI ? '✅ 利用可能' : '❌ 利用不可'}`);

            if (hasAPI) {
                console.log('[PRELOAD] 🎉 electronAPI正常にアクセス可能');
                const api = (window as any).electronAPI;
                console.log('[PRELOAD] API詳細:', {
                    staffMethod: typeof api.staff,
                    getAppVersion: typeof api.getAppVersion,
                    testConnection: typeof api.testConnection
                });
            }

            return hasAPI;
        } else {
            console.log('[PRELOAD] window オブジェクト未利用');
            return false;
        }
    } catch (error) {
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
        } else {
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
        const hasAPI = typeof (window as any).electronAPI !== 'undefined';
        console.log(`[PRELOAD] 確認 ${attempts}/${maxAttempts}: electronAPI ${hasAPI ? '✅' : '❌'}`);

        if (hasAPI) {
            console.log('[PRELOAD] 🎉 electronAPI利用可能確認完了');
            return; // 成功したので終了
        }
    }

    if (attempts < maxAttempts) {
        setTimeout(periodicCheck, 1000);
    } else {
        console.error('[PRELOAD] ❌ electronAPIの利用確認に失敗しました');

        // 最終診断
        console.log('[PRELOAD] 最終診断:');
        console.log('- contextIsolated:', process.contextIsolated);
        console.log('- window定義済み:', typeof window !== 'undefined');
        console.log('- contextBridge利用可能:', typeof contextBridge !== 'undefined');

        if (typeof window !== 'undefined') {
            console.log('- windowのキー:', Object.keys(window).slice(0, 10));
        }
    }
};

// 少し遅延してから確認開始
setTimeout(periodicCheck, 500);