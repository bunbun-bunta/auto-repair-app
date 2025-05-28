"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemHandler = exports.BaseHandler = void 0;
// src/main/handlers/base-handler.ts
const electron_1 = require("electron");
class BaseHandler {
    constructor(channelPrefix) {
        this.channelPrefix = channelPrefix;
    }
    /**
     * エラーハンドリング共通処理
     */
    handleError(error, context) {
        console.error(`[${context}] エラーが発生しました:`, error);
        const errorMessage = error instanceof Error
            ? error.message
            : 'Unknown error occurred';
        return {
            success: false,
            error: errorMessage,
            message: `${context}でエラーが発生しました`
        };
    }
    /**
     * 成功レスポンス生成
     */
    createSuccessResponse(data, message) {
        return {
            success: true,
            data,
            message
        };
    }
    /**
     * 汚染されたレスポンス生成
     */
    createErrorResponse(error, message) {
        return {
            success: false,
            error,
            message
        };
    }
    /**
     * IPCハンドラー登録のヘルパー
     */
    registerHandler(channelSuffix, handler) {
        const fullChannel = `${this.channelPrefix}:${channelSuffix}`;
        console.log(`IPCハンドラー登録: ${fullChannel}`);
        electron_1.ipcMain.handle(fullChannel, async (event, ...args) => {
            try {
                console.log(`[${fullChannel}] 呼び出し開始`, args);
                const result = await handler(event, ...args);
                console.log(`[${fullChannel}] 呼び出し成功`);
                return result;
            }
            catch (error) {
                console.error(`[${fullChannel}] 呼び出し失敗:`, error);
                return this.handleError(error, fullChannel);
            }
        });
    }
    /**
     * ハンドラー登録解除
     */
    unregisterHandler(channelSuffix) {
        const fullChannel = `${this.channelPrefix}:${channelSuffix}`;
        electron_1.ipcMain.removeHandler(fullChannel);
        console.log(`IPCハンドラー登録解除: ${fullChannel}`);
    }
    /**
     * 全ハンドラー登録解除
     */
    cleanup() {
        // 子クラスでオーバーライドして個別のクリーンアップを実装
        console.log(`[${this.channelPrefix}] ハンドラークリーンアップ`);
    }
}
exports.BaseHandler = BaseHandler;
// システム基本ハンドラー（テスト用）
class SystemHandler extends BaseHandler {
    constructor() {
        super('system');
        this.registerHandlers();
    }
    registerHandlers() {
        // テスト用接続確認
        this.registerHandler('test:connection', async () => {
            return this.createSuccessResponse({
                status: 'connected',
                timestamp: new Date().toISOString(),
                message: 'IPC通信が正常に動作しています'
            });
        });
        // アプリケーション情報
        this.registerHandler('app:getVersion', async () => {
            const { app } = require('electron');
            return this.createSuccessResponse({
                version: app.getVersion(),
                name: app.getName()
            });
        });
        this.registerHandler('app:getPath', async () => {
            const { app } = require('electron');
            return this.createSuccessResponse({
                userData: app.getPath('userData'),
                documents: app.getPath('documents'),
                temp: app.getPath('temp')
            });
        });
        // 通知表示
        this.registerHandler('notification:show', async (event, title, body) => {
            const { Notification } = require('electron');
            if (Notification.isSupported()) {
                const notification = new Notification({
                    title,
                    body
                });
                notification.show();
                return this.createSuccessResponse({
                    shown: true,
                    message: '通知を表示しました'
                });
            }
            else {
                return this.createErrorResponse('Notifications not supported', '通知がサポートされていません');
            }
        });
    }
    cleanup() {
        super.cleanup();
        this.unregisterHandler('test:connection');
        this.unregisterHandler('app:getVersion');
        this.unregisterHandler('app:getPath');
        this.unregisterHandler('notification:show');
    }
}
exports.SystemHandler = SystemHandler;
//# sourceMappingURL=base-handler.js.map