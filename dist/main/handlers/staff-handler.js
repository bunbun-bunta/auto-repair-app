"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffHandler = void 0;
// src/main/handlers/staff-handler.ts
const electron_1 = require("electron");
const base_handler_1 = require("./base-handler");
class StaffHandler extends base_handler_1.BaseHandler {
    constructor(staffService) {
        super(staffService, 'staff');
        this.staffService = staffService;
        this.registerAdditionalHandlers();
    }
    /**
     * スタッフ固有のハンドラーを追加登録
     */
    registerAdditionalHandlers() {
        // OAuth認証状態更新
        electron_1.ipcMain.handle('staff:updateOAuthStatus', this.handleUpdateOAuthStatus.bind(this));
        // 管理者一覧取得
        electron_1.ipcMain.handle('staff:getAdministrators', this.handleGetAdministrators.bind(this));
        // 認証済みスタッフ一覧取得
        electron_1.ipcMain.handle('staff:getAuthenticated', this.handleGetAuthenticated.bind(this));
        // スタッフ統計情報取得
        electron_1.ipcMain.handle('staff:getStatistics', this.handleGetStatistics.bind(this));
        // 色の使用状況チェック
        electron_1.ipcMain.handle('staff:checkColorUsage', this.handleCheckColorUsage.bind(this));
        // スタッフの依存関係チェック
        electron_1.ipcMain.handle('staff:checkDependencies', this.handleCheckDependencies.bind(this));
    }
    /**
     * OAuth認証状態を更新
     */
    async handleUpdateOAuthStatus(event, id, status) {
        try {
            console.log(`Updating OAuth status for staff ID ${id}: ${status}`);
            return await this.staffService.updateOAuthStatus(id, status);
        }
        catch (error) {
            console.error('OAuth status update error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'OAuth認証状態の更新でエラーが発生しました'
            };
        }
    }
    /**
     * 管理者一覧を取得
     */
    async handleGetAdministrators(event) {
        try {
            console.log('Fetching administrators list');
            return await this.staffService.getAdministrators();
        }
        catch (error) {
            console.error('Get administrators error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '管理者一覧の取得でエラーが発生しました'
            };
        }
    }
    /**
     * 認証済みスタッフ一覧を取得
     */
    async handleGetAuthenticated(event) {
        try {
            console.log('Fetching authenticated staff list');
            return await this.staffService.getAuthenticatedStaff();
        }
        catch (error) {
            console.error('Get authenticated staff error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '認証済みスタッフ一覧の取得でエラーが発生しました'
            };
        }
    }
    /**
     * スタッフ統計情報を取得
     */
    async handleGetStatistics(event) {
        try {
            console.log('Fetching staff statistics');
            return await this.staffService.getStaffStatistics();
        }
        catch (error) {
            console.error('Get staff statistics error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'スタッフ統計情報の取得でエラーが発生しました'
            };
        }
    }
    /**
     * 色の使用状況をチェック
     */
    async handleCheckColorUsage(event, color, excludeId) {
        try {
            console.log(`Checking color usage: ${color}${excludeId ? ` (exclude ID: ${excludeId})` : ''}`);
            const isUsed = await this.staffService.staffRepository.isColorUsed(color, excludeId);
            return {
                success: true,
                data: { isUsed }
            };
        }
        catch (error) {
            console.error('Color usage check error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '色の使用状況チェックでエラーが発生しました'
            };
        }
    }
    /**
     * スタッフの依存関係をチェック
     */
    async handleCheckDependencies(event, id) {
        try {
            console.log(`Checking dependencies for staff ID: ${id}`);
            const dependencies = await this.staffService.staffRepository.checkDependencies(id);
            return {
                success: true,
                data: dependencies
            };
        }
        catch (error) {
            console.error('Dependency check error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '依存関係チェックでエラーが発生しました'
            };
        }
    }
    /**
     * スタッフ作成のオーバーライド（ログ出力強化）
     */
    async handleCreate(event, data) {
        try {
            console.log('Creating new staff:', {
                name: data.name,
                email: data.email,
                permissionLevel: data.permissionLevel
            });
            const result = await this.staffService.create(data);
            if (result.success) {
                console.log(`Staff created successfully: ${data.name} (ID: ${result.data?.id})`);
            }
            else {
                console.error('Staff creation failed:', result.error);
            }
            return result;
        }
        catch (error) {
            console.error('Staff creation error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'スタッフの作成でエラーが発生しました'
            };
        }
    }
    /**
     * スタッフ更新のオーバーライド（ログ出力強化）
     */
    async handleUpdate(event, id, data) {
        try {
            console.log('Updating staff:', { id, changes: Object.keys(data) });
            const result = await this.staffService.update(id, data);
            if (result.success) {
                console.log(`Staff updated successfully: ID ${id}`);
            }
            else {
                console.error('Staff update failed:', result.error);
            }
            return result;
        }
        catch (error) {
            console.error('Staff update error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'スタッフの更新でエラーが発生しました'
            };
        }
    }
    /**
     * スタッフ削除のオーバーライド（ログ出力強化）
     */
    async handleDelete(event, id) {
        try {
            console.log('Deleting staff:', { id });
            const result = await this.staffService.delete(id);
            if (result.success) {
                console.log(`Staff deleted successfully: ID ${id}`);
            }
            else {
                console.error('Staff deletion failed:', result.error);
            }
            return result;
        }
        catch (error) {
            console.error('Staff deletion error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'スタッフの削除でエラーが発生しました'
            };
        }
    }
}
exports.StaffHandler = StaffHandler;
//# sourceMappingURL=staff-handler.js.map