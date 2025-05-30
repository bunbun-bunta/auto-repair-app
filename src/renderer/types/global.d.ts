// src/renderer/types/global.d.ts (修正版)
import { ApiResponse } from '@shared/types';

// Electronのプリロードスクリプトで公開されるAPI型定義
declare global {
    interface Window {
        electronAPI: {
            // 基本的なIPC通信
            invoke: (channel: string, ...args: any[]) => Promise<any>;

            // イベントリスナー
            on: (channel: string, callback: (...args: any[]) => void) => () => void;
            removeListener: (channel: string, callback: (...args: any[]) => void) => void;

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
            showNotification?: (title: string, body: string) => Promise<ApiResponse<{
                shown: boolean;
                message: string;
            }>>;

            // デバッグ・テスト用
            testConnection: () => Promise<ApiResponse<{
                status: string;
                timestamp: string;
                message: string;
            }>>;

            // スタッフ管理API（プリロードスクリプトと一致）
            staff: {
                getAll: () => Promise<ApiResponse<any[]>>;
                getById: (id: number) => Promise<ApiResponse<any>>;
                create: (data: any) => Promise<ApiResponse<any>>;
                update: (id: number, data: any) => Promise<ApiResponse<any>>;
                delete: (id: number) => Promise<ApiResponse<void>>;
                updateOAuthStatus: (id: number, status: string) => Promise<ApiResponse<any>>;
                getStatistics: () => Promise<ApiResponse<any>>;
                checkColorUsage: (color: string, excludeId?: number) => Promise<ApiResponse<{ isUsed: boolean }>>;
                checkDependencies: (id: number) => Promise<ApiResponse<{ hasSchedules: boolean; scheduleCount: number }>>;
            };

            // デバッグ機能
            _debug?: {
                listChannels: () => void;
                getStatus: () => any;
            };
        };
    }
}

// 空のexportでモジュール化
export { };