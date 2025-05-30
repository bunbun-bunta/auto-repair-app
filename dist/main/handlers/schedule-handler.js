"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleHandler = void 0;
// src/main/handlers/schedule-handler.ts
const electron_1 = require("electron");
const base_handler_1 = require("./base-handler");
class ScheduleHandler extends base_handler_1.BaseHandler {
    constructor(scheduleService) {
        super(scheduleService, 'schedule');
        this.scheduleService = scheduleService;
        this.registerAdditionalHandlers();
    }
    /**
     * 予定管理固有のハンドラーを追加登録
     */
    registerAdditionalHandlers() {
        // 検索機能
        electron_1.ipcMain.handle('schedule:search', this.handleSearch.bind(this));
        // 期間指定取得（カレンダー用）
        electron_1.ipcMain.handle('schedule:getByDateRange', this.handleGetByDateRange.bind(this));
        // 今日の予定取得
        electron_1.ipcMain.handle('schedule:getToday', this.handleGetToday.bind(this));
        // 月間統計取得
        electron_1.ipcMain.handle('schedule:getMonthlyStatistics', this.handleGetMonthlyStatistics.bind(this));
        // 予定完了処理
        electron_1.ipcMain.handle('schedule:complete', this.handleComplete.bind(this));
        // 請求状況更新
        electron_1.ipcMain.handle('schedule:updateBillingStatus', this.handleUpdateBillingStatus.bind(this));
        // 時間重複チェック
        electron_1.ipcMain.handle('schedule:checkTimeConflict', this.handleCheckTimeConflict.bind(this));
        // Google Calendar連携用
        electron_1.ipcMain.handle('schedule:getUnsynced', this.handleGetUnsynced.bind(this));
        electron_1.ipcMain.handle('schedule:updateGoogleEventId', this.handleUpdateGoogleEventId.bind(this));
    }
    /**
     * 検索条件付きで予定一覧を取得
     */
    async handleSearch(event, params) {
        try {
            console.log('Searching schedules with params:', params);
            return await this.scheduleService.searchSchedules(params);
        }
        catch (error) {
            console.error('Schedule search error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '予定検索でエラーが発生しました'
            };
        }
    }
    /**
     * 特定の期間の予定を取得（カレンダー表示用）
     */
    async handleGetByDateRange(event, startDate, endDate) {
        try {
            console.log(`Getting schedules from ${startDate} to ${endDate}`);
            return await this.scheduleService.getSchedulesByDateRange(startDate, endDate);
        }
        catch (error) {
            console.error('Get schedules by date range error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '期間指定予定取得でエラーが発生しました'
            };
        }
    }
    /**
     * 今日の予定を取得
     */
    async handleGetToday(event) {
        try {
            console.log('Getting today\'s schedules');
            return await this.scheduleService.getTodaySchedules();
        }
        catch (error) {
            console.error('Get today schedules error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '今日の予定取得でエラーが発生しました'
            };
        }
    }
    /**
     * 月間統計を取得
     */
    async handleGetMonthlyStatistics(event, year, month) {
        try {
            console.log(`Getting monthly statistics for ${year}-${month}`);
            return await this.scheduleService.getMonthlyStatistics(year, month);
        }
        catch (error) {
            console.error('Get monthly statistics error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '月間統計取得でエラーが発生しました'
            };
        }
    }
    /**
     * 予定完了処理
     */
    async handleComplete(event, id, actualEndDatetime) {
        try {
            console.log(`Completing schedule ID: ${id}`);
            return await this.scheduleService.completeSchedule(id, actualEndDatetime);
        }
        catch (error) {
            console.error('Complete schedule error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '予定完了処理でエラーが発生しました'
            };
        }
    }
    /**
     * 請求状況を更新
     */
    async handleUpdateBillingStatus(event, id, billingStatus) {
        try {
            console.log(`Updating billing status for schedule ID ${id}: ${billingStatus}`);
            return await this.scheduleService.updateBillingStatus(id, billingStatus);
        }
        catch (error) {
            console.error('Update billing status error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '請求状況更新でエラーが発生しました'
            };
        }
    }
    /**
     * 時間重複チェック
     */
    async handleCheckTimeConflict(event, staffId, startDatetime, endDatetime, excludeScheduleId) {
        try {
            console.log(`Checking time conflict for staff ${staffId}: ${startDatetime} - ${endDatetime}`);
            // ScheduleRepositoryから直接呼び出し（ScheduleServiceに追加するか検討）
            const result = await this.scheduleService.scheduleRepository.checkTimeConflict(staffId, startDatetime, endDatetime, excludeScheduleId);
            return result;
        }
        catch (error) {
            console.error('Check time conflict error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '時間重複チェックでエラーが発生しました'
            };
        }
    }
    /**
     * Google Calendar連携用：未同期予定を取得
     */
    async handleGetUnsynced(event) {
        try {
            console.log('Getting unsynced schedules for Google Calendar');
            return await this.scheduleService.getUnsyncedSchedules();
        }
        catch (error) {
            console.error('Get unsynced schedules error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '未同期予定取得でエラーが発生しました'
            };
        }
    }
    /**
     * GoogleイベントIDを更新
     */
    async handleUpdateGoogleEventId(event, scheduleId, googleEventId) {
        try {
            console.log(`Updating Google Event ID for schedule ${scheduleId}: ${googleEventId}`);
            return await this.scheduleService.updateGoogleEventId(scheduleId, googleEventId);
        }
        catch (error) {
            console.error('Update Google Event ID error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'GoogleイベントID更新でエラーが発生しました'
            };
        }
    }
    /**
     * 予定作成のオーバーライド（ログ出力強化）
     */
    async handleCreate(event, data) {
        try {
            console.log('Creating new schedule:', {
                customerName: data.customerName,
                staffId: data.staffId,
                startDatetime: data.startDatetime,
                businessCategory: data.businessCategory
            });
            const result = await this.scheduleService.create(data);
            if (result.success) {
                console.log(`Schedule created successfully: ${data.customerName} (ID: ${result.data?.id})`);
            }
            else {
                console.error('Schedule creation failed:', result.error);
            }
            return result;
        }
        catch (error) {
            console.error('Schedule creation error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '予定の作成でエラーが発生しました'
            };
        }
    }
    /**
     * 予定更新のオーバーライド（ログ出力強化）
     */
    async handleUpdate(event, id, data) {
        try {
            console.log('Updating schedule:', { id, changes: Object.keys(data) });
            const result = await this.scheduleService.update(id, data);
            if (result.success) {
                console.log(`Schedule updated successfully: ID ${id}`);
            }
            else {
                console.error('Schedule update failed:', result.error);
            }
            return result;
        }
        catch (error) {
            console.error('Schedule update error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '予定の更新でエラーが発生しました'
            };
        }
    }
    /**
     * 予定削除のオーバーライド（ログ出力強化）
     */
    async handleDelete(event, id) {
        try {
            console.log('Deleting schedule:', { id });
            const result = await this.scheduleService.delete(id);
            if (result.success) {
                console.log(`Schedule deleted successfully: ID ${id}`);
            }
            else {
                console.error('Schedule deletion failed:', result.error);
            }
            return result;
        }
        catch (error) {
            console.error('Schedule deletion error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '予定の削除でエラーが発生しました'
            };
        }
    }
}
exports.ScheduleHandler = ScheduleHandler;
//# sourceMappingURL=schedule-handler.js.map