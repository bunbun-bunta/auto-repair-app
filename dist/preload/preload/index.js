"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/preload/index.ts
const electron_1 = require("electron");
console.log('プリロードスクリプトが読み込まれました');
// 型安全なIPC通信のためのAPI定義
const electronAPI = {
    // 基本的なIPC通信
    invoke: (channel, ...args) => {
        console.log(`IPC呼び出し: ${String(channel)}`, args);
        return electron_1.ipcRenderer.invoke(channel, ...args);
    },
    // イベントリスナー
    on: (channel, callback) => {
        console.log(`イベントリスナー登録: ${channel}`);
        const subscription = (event, ...args) => callback(...args);
        electron_1.ipcRenderer.on(channel, subscription);
        // クリーンアップ用の関数を返す
        return () => {
            electron_1.ipcRenderer.removeListener(channel, subscription);
        };
    },
    // イベントリスナー削除
    removeListener: (channel, callback) => {
        electron_1.ipcRenderer.removeListener(channel, callback);
    },
    // ファイル操作（将来的に使用）
    showOpenDialog: (options) => electron_1.ipcRenderer.invoke('dialog:showOpenDialog', options),
    showSaveDialog: (options) => electron_1.ipcRenderer.invoke('dialog:showSaveDialog', options),
    // システム情報
    getAppVersion: () => electron_1.ipcRenderer.invoke('app:getVersion'),
    getAppPath: () => electron_1.ipcRenderer.invoke('app:getPath'),
    // 通知
    showNotification: (title, body) => electron_1.ipcRenderer.invoke('notification:show', title, body),
    // デバッグ用：接続テスト
    testConnection: () => electron_1.ipcRenderer.invoke('test:connection'),
};
// レンダラープロセスにAPIを公開
electron_1.contextBridge.exposeInMainWorld('electronAPI', electronAPI);
console.log('electronAPIがウィンドウに公開されました');
//# sourceMappingURL=index.js.map