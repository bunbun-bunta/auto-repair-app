"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleService = void 0;
// src/main/services/schedule-service.ts
const base_service_1 = require("./base-service");
const utils_1 = require("../../shared/utils");
const constants_1 = require("../../shared/constants");
class ScheduleService extends base_service_1.BaseService {
    constructor(scheduleRepository) {
        super(scheduleRepository);
        this.scheduleRepository = scheduleRepository;
    }
    /**
     * 新しい予定を作成
     */
    async create(data) {
        try {
            // バリデーション実行
            await this.validateBeforeCreate(data);
            // 時間重複チェック
            if (data.endDatetime) {
                const conflictCheck = await this.scheduleRepository.checkTimeConflict(data.staffId, data.startDatetime, data.endDatetime);
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
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '予定の作成に失敗しました'
            };
        }
    }
    /**
     * 予定情報を更新
     */
    async update(id, data) {
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
                        const conflictCheck = await this.scheduleRepository.checkTimeConflict(staffId, startTime, endTime, id // 自分自身は除外
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
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '予定の更新に失敗しました'
            };
        }
    }
    /**
     * 検索条件付きで予定一覧を取得
     */
    async searchSchedules(params = {}) {
        return await this.scheduleRepository.searchSchedules(params);
    }
    /**
     * 特定の期間の予定を取得（カレンダー表示用）
     */
    async getSchedulesByDateRange(startDate, endDate) {
        return await this.scheduleRepository.getSchedulesByDateRange(startDate, endDate);
    }
    /**
     * 今日の予定を取得
     */
    async getTodaySchedules() {
        return await this.scheduleRepository.getTodaySchedules();
    }
    /**
     * 月間統計を取得
     */
    async getMonthlyStatistics(year, month) {
        return await this.scheduleRepository.getMonthlyStatistics(year, month);
    }
    /**
     * 予定完了処理
     */
    async completeSchedule(id, actualEndDatetime) {
        try {
            const endTime = actualEndDatetime || new Date().toISOString();
            const result = await this.scheduleRepository.update(id, {
                actualEndDatetime: endTime
            });
            if (result.success) {
                console.log(`Schedule completed: ID ${id}`);
            }
            return result;
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '予定完了処理に失敗しました'
            };
        }
    }
    /**
     * 請求状況を更新
     */
    async updateBillingStatus(id, billingStatus) {
        try {
            const result = await this.scheduleRepository.update(id, { billingStatus });
            if (result.success) {
                console.log(`Billing status updated for schedule ID ${id}: ${billingStatus}`);
            }
            return result;
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '請求状況の更新に失敗しました'
            };
        }
    }
    /**
     * 作成前のバリデーション
     */
    async validateBeforeCreate(data) {
        const errors = [];
        // 必須項目チェック
        const customerNameValidation = utils_1.ValidationUtils.validateRequired(data.customerName);
        if (!customerNameValidation.isValid) {
            errors.push('顧客名は必須です');
        }
        const staffIdValidation = utils_1.ValidationUtils.validateRequired(data.staffId);
        if (!staffIdValidation.isValid) {
            errors.push('担当者は必須です');
        }
        const startDatetimeValidation = utils_1.ValidationUtils.validateRequired(data.startDatetime);
        if (!startDatetimeValidation.isValid) {
            errors.push('開始日時は必須です');
        }
        const businessCategoryValidation = utils_1.ValidationUtils.validateRequired(data.businessCategory);
        if (!businessCategoryValidation.isValid) {
            errors.push('業務カテゴリは必須です');
        }
        // 日時バリデーション
        if (data.startDatetime && !utils_1.DateUtils.isValid(data.startDatetime)) {
            errors.push('開始日時の形式が正しくありません');
        }
        if (data.endDatetime && !utils_1.DateUtils.isValid(data.endDatetime)) {
            errors.push('終了日時の形式が正しくありません');
        }
        // 開始・終了日時の関係チェック
        if (data.startDatetime && data.endDatetime) {
            const dateRangeValidation = utils_1.ValidationUtils.validateDateRange(data.startDatetime, data.endDatetime);
            if (!dateRangeValidation.isValid) {
                errors.push(constants_1.ERROR_MESSAGES.DATE_RANGE_ERROR);
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
    async validateBeforeUpdate(id, data) {
        const errors = [];
        // 予定の存在確認
        const existingSchedule = await this.scheduleRepository.getById(id);
        if (!existingSchedule.success) {
            throw new Error('予定が見つかりません');
        }
        // 部分的なバリデーション（変更される項目のみ）
        if (data.customerName !== undefined) {
            const validation = utils_1.ValidationUtils.validateRequired(data.customerName);
            if (!validation.isValid) {
                errors.push('顧客名は必須です');
            }
        }
        if (data.staffId !== undefined) {
            const validation = utils_1.ValidationUtils.validateRequired(data.staffId);
            if (!validation.isValid) {
                errors.push('担当者は必須です');
            }
        }
        if (data.startDatetime !== undefined) {
            const validation = utils_1.ValidationUtils.validateRequired(data.startDatetime);
            if (!validation.isValid) {
                errors.push('開始日時は必須です');
            }
            else if (!utils_1.DateUtils.isValid(data.startDatetime)) {
                errors.push('開始日時の形式が正しくありません');
            }
        }
        if (data.endDatetime !== undefined && data.endDatetime) {
            if (!utils_1.DateUtils.isValid(data.endDatetime)) {
                errors.push('終了日時の形式が正しくありません');
            }
        }
        if (data.businessCategory !== undefined) {
            const validation = utils_1.ValidationUtils.validateRequired(data.businessCategory);
            if (!validation.isValid) {
                errors.push('業務カテゴリは必須です');
            }
        }
        // 開始・終了日時の関係チェック（両方が提供された場合）
        if (data.startDatetime && data.endDatetime) {
            const dateRangeValidation = utils_1.ValidationUtils.validateDateRange(data.startDatetime, data.endDatetime);
            if (!dateRangeValidation.isValid) {
                errors.push(constants_1.ERROR_MESSAGES.DATE_RANGE_ERROR);
            }
        }
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
    }
    /**
     * Google Calendar連携用：未同期予定を取得
     */
    async getUnsyncedSchedules() {
        return await this.scheduleRepository.getUnsyncedSchedules();
    }
    /**
     * GoogleイベントIDを更新
     */
    async updateGoogleEventId(scheduleId, googleEventId) {
        return await this.scheduleRepository.updateGoogleEventId(scheduleId, googleEventId);
    }
}
exports.ScheduleService = ScheduleService;
//# sourceMappingURL=schedule-service.js.map