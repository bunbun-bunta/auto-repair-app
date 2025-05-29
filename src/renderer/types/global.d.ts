// src/renderer/types/global.d.ts
import { ApiResponse } from '../../shared/types';

// Electronのプリロードスクリプトで公開されるAPI型定義
declare global {
    interface Window {
        electronAPI: {
            // 基本的なIPC通信
            invoke: (channel: string, ...args: any[]) => Promise<any>;

            // イベントリスナー
            on: (channel: string, callback: (...args: any[]) => void) => () => void;
            removeListener: (channel: string, callback: (...args: any[]) => void) => void;

            // ファイル操作
            showOpenDialog?: (options: any) => Promise<any>;
            showSaveDialog?: (options: any) => Promise<any>;

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

            // デバッグ機能
            _debug?: {
                listChannels: () => void;
            };
        };
    }
}

// 空のexportでモジュール化
export { };