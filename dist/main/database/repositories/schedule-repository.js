"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleRepository = void 0;
const base_repository_1 = require("./base-repository");
const constants_1 = require("../../../shared/constants");
class ScheduleRepository extends base_repository_1.BaseRepository {
    constructor(db) {
        super(db, constants_1.TABLE_NAMES.SCHEDULES);
    }
    /**
     * 検索条件付きで予定一覧を取得
     */
    async searchSchedules(params = {}) {
        try {
            let query = `
                SELECT s.*, st.name as staff_name, st.display_color as staff_color
                FROM ${this.tableName} s
                LEFT JOIN staff st ON s.staff_id = st.id
                WHERE 1=1
            `;
            const queryParams = [];
            // キーワード検索
            if (params.keyword) {
                query += ` AND (s.customer_name LIKE ? OR s.vehicle_type LIKE ? OR s.business_detail LIKE ?)`;
                const keyword = `%${params.keyword}%`;
                queryParams.push(keyword, keyword, keyword);
            }
            // スタッフで絞り込み
            if (params.staffIds && params.staffIds.length > 0) {
                const placeholders = params.staffIds.map(() => '?').join(',');
                query += ` AND s.staff_id IN (${placeholders})`;
                queryParams.push(...params.staffIds);
            }
            // 業務カテゴリで絞り込み
            if (params.businessCategories && params.businessCategories.length > 0) {
                const placeholders = params.businessCategories.map(() => '?').join(',');
                query += ` AND s.business_category IN (${placeholders})`;
                queryParams.push(...params.businessCategories);
            }
            // 請求状況で絞り込み
            if (params.billingStatuses && params.billingStatuses.length > 0) {
                const placeholders = params.billingStatuses.map(() => '?').join(',');
                query += ` AND s.billing_status IN (${placeholders})`;
                queryParams.push(...params.billingStatuses);
            }
            // 期間で絞り込み
            if (params.startDate) {
                query += ` AND DATE(s.start_datetime) >= DATE(?)`;
                queryParams.push(params.startDate);
            }
            if (params.endDate) {
                query += ` AND DATE(s.start_datetime) <= DATE(?)`;
                queryParams.push(params.endDate);
            }
            // 並び順
            const sortBy = params.sortBy || 'start_datetime';
            const sortOrder = params.sortOrder || 'asc';
            query += ` ORDER BY s.${sortBy} ${sortOrder.toUpperCase()}`;
            // ページネーション
            if (params.limit) {
                query += ` LIMIT ?`;
                queryParams.push(params.limit);
                if (params.page && params.page > 1) {
                    const offset = (params.page - 1) * params.limit;
                    query += ` OFFSET ?`;
                    queryParams.push(offset);
                }
            }
            const schedules = await this.executeQuery(query, queryParams);
            return { success: true, data: schedules };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * 特定の期間の予定を取得（カレンダー表示用）
     */
    async getSchedulesByDateRange(startDate, endDate) {
        try {
            const query = `
                SELECT s.*, st.name as staff_name, st.display_color as staff_color
                FROM ${this.tableName} s
                LEFT JOIN staff st ON s.staff_id = st.id
                WHERE DATE(s.start_datetime) >= DATE(?) 
                AND DATE(s.start_datetime) <= DATE(?)
                ORDER BY s.start_datetime ASC
            `;
            const schedules = await this.executeQuery(query, [startDate, endDate]);
            return { success: true, data: schedules };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * スタッフの予定数をカウント
     */
    async getScheduleCountByStaff(staffId) {
        try {
            const result = await this.executeQuerySingle(`SELECT COUNT(*) as count FROM ${this.tableName} WHERE staff_id = ?`, [staffId]);
            return result?.count || 0;
        }
        catch (error) {
            console.error('Schedule count error:', error);
            return 0;
        }
    }
    /**
     * 予定の時間重複チェック
     */
    async checkTimeConflict(staffId, startDatetime, endDatetime, excludeScheduleId) {
        try {
            let query = `
                SELECT s.*, st.name as staff_name
                FROM ${this.tableName} s
                LEFT JOIN staff st ON s.staff_id = st.id
                WHERE s.staff_id = ?
                AND (
                    (s.start_datetime <= ? AND s.end_datetime > ?) OR
                    (s.start_datetime < ? AND s.end_datetime >= ?) OR
                    (s.start_datetime >= ? AND s.end_datetime <= ?)
                )
            `;
            const params = [staffId, startDatetime, startDatetime, endDatetime, endDatetime, startDatetime, endDatetime];
            if (excludeScheduleId) {
                query += ` AND s.id != ?`;
                params.push(excludeScheduleId);
            }
            const conflictingSchedules = await this.executeQuery(query, params);
            return {
                success: true,
                data: {
                    hasConflict: conflictingSchedules.length > 0,
                    conflictingSchedules
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * 月間の予定統計を取得
     */
    async getMonthlyStatistics(year, month) {
        try {
            const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
            const nextMonth = month === 12 ? 1 : month + 1;
            const nextYear = month === 12 ? year + 1 : year;
            const endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;
            // 総予定数
            const totalResult = await this.executeQuerySingle(`SELECT COUNT(*) as count FROM ${this.tableName} 
                 WHERE start_datetime >= ? AND start_datetime < ?`, [startDate, endDate]);
            // 完了予定数（実際の終了日時が設定されているもの）
            const completedResult = await this.executeQuerySingle(`SELECT COUNT(*) as count FROM ${this.tableName} 
                 WHERE start_datetime >= ? AND start_datetime < ? 
                 AND actual_end_datetime IS NOT NULL`, [startDate, endDate]);
            // 請求状況別統計
            const billingResults = await this.executeQuery(`SELECT billing_status, COUNT(*) as count FROM ${this.tableName} 
                 WHERE start_datetime >= ? AND start_datetime < ? 
                 GROUP BY billing_status`, [startDate, endDate]);
            // 業務カテゴリ別統計
            const categoryResults = await this.executeQuery(`SELECT business_category, COUNT(*) as count FROM ${this.tableName} 
                 WHERE start_datetime >= ? AND start_datetime < ? 
                 GROUP BY business_category`, [startDate, endDate]);
            const billingStatistics = {};
            billingResults.forEach(result => {
                billingStatistics[result.billing_status] = result.count;
            });
            const categoryStatistics = {};
            categoryResults.forEach(result => {
                categoryStatistics[result.business_category] = result.count;
            });
            return {
                success: true,
                data: {
                    totalSchedules: totalResult?.count || 0,
                    completedSchedules: completedResult?.count || 0,
                    billingStatistics,
                    categoryStatistics
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * 今日の予定を取得
     */
    async getTodaySchedules() {
        try {
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD形式
            const query = `
                SELECT s.*, st.name as staff_name, st.display_color as staff_color
                FROM ${this.tableName} s
                LEFT JOIN staff st ON s.staff_id = st.id
                WHERE DATE(s.start_datetime) = DATE(?)
                ORDER BY s.start_datetime ASC
            `;
            const schedules = await this.executeQuery(query, [today]);
            return { success: true, data: schedules };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Googleカレンダー連携用：同期フラグ付き予定を取得
     */
    async getUnsyncedSchedules() {
        try {
            const query = `
                SELECT s.*, st.name as staff_name, st.email as staff_email
                FROM ${this.tableName} s
                LEFT JOIN staff st ON s.staff_id = st.id
                WHERE s.google_event_id IS NULL 
                AND st.oauth_status = '認証済み'
                ORDER BY s.created_at ASC
            `;
            const schedules = await this.executeQuery(query, []);
            return { success: true, data: schedules };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * GoogleイベントIDで予定を更新
     */
    async updateGoogleEventId(scheduleId, googleEventId) {
        try {
            await this.executeUpdate(`UPDATE ${this.tableName} SET google_event_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [googleEventId, scheduleId]);
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}
exports.ScheduleRepository = ScheduleRepository;
//# sourceMappingURL=schedule-repository.js.map