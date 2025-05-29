// src/renderer/types/basic.ts
// 基本的な型定義（まずはこれだけで動作確認）

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Staff {
  id?: number;
  name: string;
  displayColor: string;
  email?: string;
  oauthStatus: OAuthStatus;
  permissionLevel: PermissionLevel;
  createdAt?: string;
  updatedAt?: string;
}

export type OAuthStatus = '未認証' | '認証済み' | '期限切れ' | 'エラー';
export type PermissionLevel = '管理者' | '一般';

// IPC通信用の型定義
declare global {
  interface Window {
    electronAPI: {
      invoke: (channel: string, ...args: any[]) => Promise<ApiResponse<any>>;
      on: (channel: string, callback: (...args: any[]) => void) => () => void;
      removeListener: (channel: string, callback: (...args: any[]) => void) => void;
      getAppVersion: () => Promise<ApiResponse<any>>;
      getAppPath: () => Promise<ApiResponse<any>>;
      testConnection: () => Promise<ApiResponse<any>>;
      showNotification?: (title: string, body: string) => Promise<ApiResponse<any>>;
      _debug?: {
        listChannels: () => void;
      };
    };
  }
}