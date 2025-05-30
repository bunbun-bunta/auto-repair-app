// src/main/services/schedule-service.ts
import { BaseService } from './base-service';
import { ScheduleRepository } from '../database/repositories/schedule-repository';
import { Schedule, ScheduleFormData, ScheduleSearchParams, ApiResponse } from '../../shared/types';
import { ValidationUtils, DateUtils } from '../../shared/utils';
import { ERROR_MESSAGES } from '../../shared/constants';

export class ScheduleService extends BaseService<Schedule> {
    private scheduleRepository: ScheduleRepository;

    constructor(scheduleRepository: ScheduleRepository) {
        super(scheduleRepository);
        this.scheduleRepository = scheduleRepository;
    }

    /**
     * 新しい予定を作成
     */
    async create(data: ScheduleFormData): Promise<ApiResponse<Schedule>> {
        try {
            // バリデーション実行
            await this.validateBeforeCreate(data);

            // 時間重複チェック
            if (data.endDatetime) {
                const conflictCheck = await this.scheduleRepository.checkTimeConflict(
                    data.staffId,
                    data.startDatetime,
                    data.endDatetime
                );

                if (conflictCheck.success && conflictCheck.data?.hasConflict) {
                    return {
                        success: false,
                        error: '指定された時間帯に既に予定があります。時間を調整してください。'
                    };
                }
            }

            // データベースに保存
            const result = await this.scheduleRepository.create(data);

            if (result.success) {
                console.log(`Schedule created: ${data.customerName} (ID: ${result.data?.id})`);
            }

            return result;
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '予定の作成に失敗しました'
            };
        }
    }

    /**
     * 予定情報を更新
     */
    async update(id: number, data: Partial<ScheduleFormData>): Promise<ApiResponse<Schedule>> {
        try {
            // 更新前のバリデーション
            await this.validateBeforeUpdate(id, data);

            // 時間変更がある場合は重複チェック
            if (data.startDatetime || data.endDatetime) {
                const existingSchedule = await this.scheduleRepository.getById(id);
                if (existingSchedule.success && existingSchedule.data) {
                    const startTime = data.startDatetime || existingSchedule.data.startDatetime;
                    const endTime = data.endDatetime || existingSchedule.data.endDatetime;
                    const staffId = data.staffId || existingSchedule.data.staffId;

                    if (endTime) {
                        const conflictCheck = await this.scheduleRepository.checkTimeConflict(
                            staffId,
                            startTime,
                            endTime,
                            id // 自分自身は除外
                        );

                        if (conflictCheck.success && conflictCheck.data?.hasConflict) {
                            return {
                                success: false,
                                error: '指定された時間帯に既に予定があります。時間を調整してください。'
                            };
                        }
                    }
                }
            }

            const result = await this.scheduleRepository.update(id, data);

            if (result.success) {
                console.log(`Schedule updated: ID ${id}`);
            }

            return result;
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '予定の更新に失敗しました'
            };
        }
    }

    /**
     * 検索条件付きで予定一覧を取得
     */
    async searchSchedules(params: ScheduleSearchParams = {}): Promise<ApiResponse<Schedule[]>> {
        return await this.scheduleRepository.searchSchedules(params);
    }

    /**
     * 特定の期間の予定を取得（カレンダー表示用）
     */
    async getSchedulesByDateRange(startDate: string, endDate: string): Promise<ApiResponse<Schedule[]>> {
        return await this.scheduleRepository.getSchedulesByDateRange(startDate, endDate);
    }

    /**
     * 今日の予定を取得
     */
    async getTodaySchedules(): Promise<ApiResponse<Schedule[]>> {
        return await this.scheduleRepository.getTodaySchedules();
    }

    /**
     * 月間統計を取得
     */
    async getMonthlyStatistics(year: number, month: number): Promise<ApiResponse<{
        totalSchedules: number;
        completedSchedules: number;
        billingStatistics: Record<string, number>;
        categoryStatistics: Record<string, number>;
    }>> {
        return await this.scheduleRepository.getMonthlyStatistics(year, month);
    }

    /**
     * 予定完了処理
     */
    async completeSchedule(id: number, actualEndDatetime?: string): Promise<ApiResponse<Schedule>> {
        try {
            const endTime = actualEndDatetime || new Date().toISOString();

            const result = await this.scheduleRepository.update(id, {
                actualEndDatetime: endTime
            });

            if (result.success) {
                console.log(`Schedule completed: ID ${id}`);
            }

            return result;
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '予定完了処理に失敗しました'
            };
        }
    }

    /**
     * 請求状況を更新
     */
    async updateBillingStatus(
        id: number,
        billingStatus: '未請求' | '請求済み' | '入金済み' | 'キャンセル'
    ): Promise<ApiResponse<Schedule>> {
        try {
            const result = await this.scheduleRepository.update(id, { billingStatus });

            if (result.success) {
                console.log(`Billing status updated for schedule ID ${id}: ${billingStatus}`);
            }

            return result;
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '請求状況の更新に失敗しました'
            };
        }
    }

    /**
     * 作成前のバリデーション
     */
    protected async validateBeforeCreate(data: ScheduleFormData): Promise<void> {
        const errors: string[] = [];

        // 必須項目チェック
        const customerNameValidation = ValidationUtils.validateRequired(data.customerName);
        if (!customerNameValidation.isValid) {
            errors.push('顧客名は必須です');
        }

        const staffIdValidation = ValidationUtils.validateRequired(data.staffId);
        if (!staffIdValidation.isValid) {
            errors.push('担当者は必須です');
        }

        const startDatetimeValidation = ValidationUtils.validateRequired(data.startDatetime);
        if (!startDatetimeValidation.isValid) {
            errors.push('開始日時は必須です');
        }

        const businessCategoryValidation = ValidationUtils.validateRequired(data.businessCategory);
        if (!businessCategoryValidation.isValid) {
            errors.push('業務カテゴリは必須です');
        }

        // 日時バリデーション
        if (data.startDatetime && !DateUtils.isValid(data.startDatetime)) {
            errors.push('開始日時の形式が正しくありません');
        }

        if (data.endDatetime && !DateUtils.isValid(data.endDatetime)) {
            errors.push('終了日時の形式が正しくありません');
        }

        // 開始・終了日時の関係チェック
        if (data.startDatetime && data.endDatetime) {
            const dateRangeValidation = ValidationUtils.validateDateRange(
                data.startDatetime,
                data.endDatetime
            );
            if (!dateRangeValidation.isValid) {
                errors.push(ERROR_MESSAGES.DATE_RANGE_ERROR);
            }
        }

        // 過去の日時チェック（警告レベル）
        if (data.startDatetime) {
            const startDate = new Date(data.startDatetime);
            const now = new Date();
            if (startDate < now) {
                console.warn('Warning: Schedule start time is in the past');
                // エラーにはしないが、警告として記録
            }
        }

        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
    }

    /**
     * 更新前のバリデーション
     */
    protected async validateBeforeUpdate(id: number, data: Partial<ScheduleFormData>): Promise<void> {
        const errors: string[] = [];

        // 予定の存在確認
        const existingSchedule = await this.scheduleRepository.getById(id);
        if (!existingSchedule.success) {
            throw new Error('予定が見つかりません');
        }

        // 部分的なバリデーション（変更される項目のみ）
        if (data.customerName !== undefined) {
            const validation = ValidationUtils.validateRequired(data.customerName);
            if (!validation.isValid) {
                errors.push('顧客名は必須です');
            }
        }

        if (data.staffId !== undefined) {
            const validation = ValidationUtils.validateRequired(data.staffId);
            if (!validation.isValid) {
                errors.push('担当者は必須です');
            }
        }

        if (data.startDatetime !== undefined) {
            const validation = ValidationUtils.validateRequired(data.startDatetime);
            if (!validation.isValid) {
                errors.push('開始日時は必須です');
            } else if (!DateUtils.isValid(data.startDatetime)) {
                errors.push('開始日時の形式が正しくありません');
            }
        }

        if (data.endDatetime !== undefined && data.endDatetime) {
            if (!DateUtils.isValid(data.endDatetime)) {
                errors.push('終了日時の形式が正しくありません');
            }
        }

        if (data.businessCategory !== undefined) {
            const validation = ValidationUtils.validateRequired(data.businessCategory);
            if (!validation.isValid) {
                errors.push('業務カテゴリは必須です');
            }
        }

        // 開始・終了日時の関係チェック（両方が提供された場合）
        if (data.startDatetime && data.endDatetime) {
            const dateRangeValidation = ValidationUtils.validateDateRange(
                data.startDatetime,
                data.endDatetime
            );
            if (!dateRangeValidation.isValid) {
                errors.push(ERROR_MESSAGES.DATE_RANGE_ERROR);
            }
        }

        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
    }

    /**
     * Google Calendar連携用：未同期予定を取得
     */
    async getUnsyncedSchedules(): Promise<ApiResponse<Schedule[]>> {
        return await this.scheduleRepository.getUnsyncedSchedules();
    }

    /**
     * GoogleイベントIDを更新
     */
    async updateGoogleEventId(scheduleId: number, googleEventId: string): Promise<ApiResponse<void>> {
        return await this.scheduleRepository.updateGoogleEventId(scheduleId, googleEventId);
    }
}