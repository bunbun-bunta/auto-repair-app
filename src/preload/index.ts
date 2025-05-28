// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';

// 型安全なIPC通信のためのAPI定義
const electronAPI = {
    invoke: (channel: string, ...args: any[]): Promise<any> => {
        return ipcRenderer.invoke(channel, ...args);
    },

    on: (channel: string, callback: (...args: any[]) => void) => {
        ipcRenderer.on(channel, (event, ...args) => callback(...args));
    },

    removeListener: (channel: string, callback: (...args: any[]) => void) => {
        ipcRenderer.removeListener(channel, callback);
    },

    // ファイル操作
    showOpenDialog: (options: any) => ipcRenderer.invoke('dialog:showOpenDialog', options),
    showSaveDialog: (options: any) => ipcRenderer.invoke('dialog:showSaveDialog', options),

    // システム情報
    getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
    getAppPath: () => ipcRenderer.invoke('app:getPath'),

    // 通知
    showNotification: (title: string, body: string) =>
        ipcRenderer.invoke('notification:show', title, body),
};

// レンダラープロセスにAPIを公開
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// 型定義をグローバルに追加
declare global {
    interface Window {
        electronAPI: typeof electronAPI;
    }
}