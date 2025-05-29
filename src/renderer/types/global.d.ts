// src/renderer/types/global.d.ts

import { ApiResponse } from '../../shared/types';

// Electronのプリロードスクリプトで公開されるAPI型定義
declare global {
    interface Window {
        electronAPI: {
            // 基本的なIPC通信
            invoke: <K extends keyof IpcChannels>(
                channel: K,
                ...args: Parameters<IpcChannels[K]>
            ) => Promise<ReturnType<IpcChannels[K]>>;

            // イベントリスナー
            on: (channel: string, callback: (...args: any[]) => void) => () => void;
            removeListener: (channel: string, callback: (...args: any[]) => void) => void;

            // ファイル操作
            showOpenDialog: (options: any) => Promise<any>;
            showSaveDialog: (options: any) => Promise<any>;

            // システム情報
            getAppVersion: () => Promise<ApiResponse<{
                version: string;
                name: string;
            }>>;

            getAppPath: () => Promise<ApiResponse<{
                userData: string;
                documents: string;
                temp: string;
            }>>;

            // 通知
            showNotification: (title: string, body: string) => Promise<ApiResponse<{
                shown: boolean;
                message: string;
            }>>;

            // デバッグ・テスト用
            testConnection: () => Promise<ApiResponse<{
                status: string;
                timestamp: string;
                message: string;
            }>>;
        };
    }

    // Node.js環境変数
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production' | 'test';
            ELECTRON_IS_DEV?: string;
        }
    }
}

// 将来的に使用するIPC型定義の拡張ポイント
export interface IpcChannels {
    // システム系
    'system:test:connection': () => Promise<ApiResponse<any>>;
    'system:app:getVersion': () => Promise<ApiResponse<any>>;
    'system:app:getPath': () => Promise<ApiResponse<any>>;
    'system:notification:show': (title: string, body: string) => Promise<ApiResponse<any>>;

    // テスト用チャンネル
    'test:connection': () => Promise<ApiResponse<any>>;
    'app:getVersion': () => Promise<ApiResponse<any>>;
    'app:getPath': () => Promise<ApiResponse<any>>;
    'notification:show': (title: string, body: string) => Promise<ApiResponse<any>>;

    // 将来的に追加される予定の型定義
    // 'staff:getAll': () => Promise<ApiResponse<Staff[]>>;
    // 'staff:create': (data: StaffFormData) => Promise<ApiResponse<Staff>>;
    // 'schedule:getAll': (params: ScheduleSearchParams) => Promise<PaginatedResponse<Schedule>>;
    // など...
}

declare global {
  interface Window {
    electronAPI: {
      invoke: (channel: string, ...args: any[]) => Promise<any>;
    };
  }
}