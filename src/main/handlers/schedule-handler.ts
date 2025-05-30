// src/main/handlers/schedule-handler.ts
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { BaseHandler } from './base-handler';
import { ScheduleService } from '../services/schedule-service';
import { Schedule, ScheduleFormData, ScheduleSearchParams, ApiResponse } from '../../shared/types';

export class ScheduleHandler extends BaseHandler<Schedule> {
    private scheduleService: ScheduleService;

    constructor(scheduleService: ScheduleService) {
        super(scheduleService, 'schedule');
        this.scheduleService = scheduleService;
        this.registerAdditionalHandlers();
    }

    /**
     * 予定管理固有のハンドラーを追加登録
     */
    private registerAdditionalHandlers(): void {
        // 検索機能
        ipcMain.handle('schedule:search', this.handleSearch.bind(this));

        // 期間指定取得（カレンダー用）
        ipcMain.handle('schedule:getByDateRange', this.handleGetByDateRange.bind(this));

        // 今日の予定取得
        ipcMain.handle('schedule:getToday', this.handleGetToday.bind(this));

        // 月間統計取得
        ipcMain.handle('schedule:getMonthlyStatistics', this.handleGetMonthlyStatistics.bind(this));

        // 予定完了処理
        ipcMain.handle('schedule:complete', this.handleComplete.bind(this));

        // 請求状況更新
        ipcMain.handle('schedule:updateBillingStatus', this.handleUpdateBillingStatus.bind(this));

        // 時間重複チェック
        ipcMain.handle('schedule:checkTimeConflict', this.handleCheckTimeConflict.bind(this));

        // Google Calendar連携用
        ipcMain.handle('schedule:getUnsynced', this.handleGetUnsynced.bind(this));
        ipcMain.handle('schedule:updateGoogleEventId', this.handleUpdateGoogleEventId.bind(this));
    }

    /**
     * 検索条件付きで予定一覧を取得
     */
    private async handleSearch(
        event: IpcMainInvokeEvent,
        params: ScheduleSearchParams
    ): Promise<ApiResponse<Schedule[]>> {
        try {
            console.log('Searching schedules with params:', params);
            return await this.scheduleService.searchSchedules(params);
        } catch (error) {
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
    private async handleGetByDateRange(
        event: IpcMainInvokeEvent,
        startDate: string,
        endDate: string
    ): Promise<ApiResponse<Schedule[]>> {
        try {
            console.log(`Getting schedules from ${startDate} to ${endDate}`);
            return await this.scheduleService.getSchedulesByDateRange(startDate, endDate);
        } catch (error) {
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
    private async handleGetToday(event: IpcMainInvokeEvent): Promise<ApiResponse<Schedule[]>> {
        try {
            console.log('Getting today\'s schedules');
            return await this.scheduleService.getTodaySchedules();
        } catch (error) {
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
    private async handleGetMonthlyStatistics(
        event: IpcMainInvokeEvent,
        year: number,
        month: number
    ): Promise<ApiResponse<{
        totalSchedules: number;
        completedSchedules: number;
        billingStatistics: Record<string, number>;
        categoryStatistics: Record<string, number>;
    }>> {
        try {
            console.log(`Getting monthly statistics for ${year}-${month}`);
            return await this.scheduleService.getMonthlyStatistics(year, month);
        } catch (error) {
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
    private async handleComplete(
        event: IpcMainInvokeEvent,
        id: number,
        actualEndDatetime?: string
    ): Promise<ApiResponse<Schedule>> {
        try {
            console.log(`Completing schedule ID: ${id}`);
            return await this.scheduleService.completeSchedule(id, actualEndDatetime);
        } catch (error) {
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
    private async handleUpdateBillingStatus(
        event: IpcMainInvokeEvent,
        id: number,
        billingStatus: '未請求' | '請求済み' | '入金済み' | 'キャンセル'
    ): Promise<ApiResponse<Schedule>> {
        try {
            console.log(`Updating billing status for schedule ID ${id}: ${billingStatus}`);
            return await this.scheduleService.updateBillingStatus(id, billingStatus);
        } catch (error) {
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
    private async handleCheckTimeConflict(
        event: IpcMainInvokeEvent,
        staffId: number,
        startDatetime: string,
        endDatetime: string,
        excludeScheduleId?: number
    ): Promise<ApiResponse<{ hasConflict: boolean; conflictingSchedules: Schedule[] }>> {
        try {
            console.log(`Checking time conflict for staff ${staffId}: ${startDatetime} - ${endDatetime}`);

            // ScheduleRepositoryから直接呼び出し（ScheduleServiceに追加するか検討）
            const result = await (this.scheduleService as any).scheduleRepository.checkTimeConflict(
                staffId,
                startDatetime,
                endDatetime,
                excludeScheduleId
            );

            return result;
        } catch (error) {
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
    private async handleGetUnsynced(event: IpcMainInvokeEvent): Promise<ApiResponse<Schedule[]>> {
        try {
            console.log('Getting unsynced schedules for Google Calendar');
            return await this.scheduleService.getUnsyncedSchedules();
        } catch (error) {
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
    private async handleUpdateGoogleEventId(
        event: IpcMainInvokeEvent,
        scheduleId: number,
        googleEventId: string
    ): Promise<ApiResponse<void>> {
        try {
            console.log(`Updating Google Event ID for schedule ${scheduleId}: ${googleEventId}`);
            return await this.scheduleService.updateGoogleEventId(scheduleId, googleEventId);
        } catch (error) {
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
    protected async handleCreate(
        event: IpcMainInvokeEvent,
        data: ScheduleFormData
    ): Promise<ApiResponse<Schedule>> {
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
            } else {
                console.error('Schedule creation failed:', result.error);
            }

            return result;
        } catch (error) {
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
    protected async handleUpdate(
        event: IpcMainInvokeEvent,
        id: number,
        data: Partial<ScheduleFormData>
    ): Promise<ApiResponse<Schedule>> {
        try {
            console.log('Updating schedule:', { id, changes: Object.keys(data) });

            const result = await this.scheduleService.update(id, data);

            if (result.success) {
                console.log(`Schedule updated successfully: ID ${id}`);
            } else {
                console.error('Schedule update failed:', result.error);
            }

            return result;
        } catch (error) {
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
    protected async handleDelete(
        event: IpcMainInvokeEvent,
        id: number
    ): Promise<ApiResponse<void>> {
        try {
            console.log('Deleting schedule:', { id });

            const result = await this.scheduleService.delete(id);

            if (result.success) {
                console.log(`Schedule deleted successfully: ID ${id}`);
            } else {
                console.error('Schedule deletion failed:', result.error);
            }

            return result;
        } catch (error) {
            console.error('Schedule deletion error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '予定の削除でエラーが発生しました'
            };
        }
    }
}