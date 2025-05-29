"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffRepository = void 0;
const base_repository_1 = require("./base-repository");
const constants_1 = require("../../../shared/constants");
class StaffRepository extends base_repository_1.BaseRepository {
    constructor(db) {
        super(db, constants_1.TABLE_NAMES.STAFF);
    }
    /**
     * メールアドレスでスタッフを検索
     * （重複チェック用）
     */
    async findByEmail(email) {
        try {
            const staff = await this.executeQuerySingle(`SELECT * FROM ${this.tableName} WHERE email = ?`, [email]);
            if (!staff) {
                return { success: false, error: 'Staff not found' };
            }
            return { success: true, data: staff };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * 管理者権限を持つスタッフ一覧を取得
     */
    async getAdministrators() {
        try {
            const admins = await this.executeQuery(`SELECT * FROM ${this.tableName} WHERE permission_level = ? ORDER BY name`, ['管理者']);
            return { success: true, data: admins };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * OAuth認証済みのスタッフ一覧を取得
     */
    async getAuthenticatedStaff() {
        try {
            const authenticatedStaff = await this.executeQuery(`SELECT * FROM ${this.tableName} WHERE oauth_status = ? ORDER BY name`, ['認証済み']);
            return { success: true, data: authenticatedStaff };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * スタッフのOAuth状態を更新
     */
    async updateOAuthStatus(id, status) {
        try {
            await this.executeUpdate(`UPDATE ${this.tableName} SET oauth_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [status, id]);
            return await this.getById(id);
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * 表示色の重複チェック
     */
    async isColorUsed(color, excludeId) {
        try {
            let query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE display_color = ?`;
            const params = [color];
            if (excludeId) {
                query += ' AND id != ?';
                params.push(excludeId.toString());
            }
            const result = await this.executeQuerySingle(query, params);
            return (result?.count || 0) > 0;
        }
        catch (error) {
            console.error('Color check error:', error);
            return false;
        }
    }
    /**
     * 削除前のデータ整合性チェック
     * （このスタッフに関連する予定があるかチェック）
     */
    async checkDependencies(id) {
        try {
            const result = await this.executeQuerySingle('SELECT COUNT(*) as count FROM schedules WHERE staff_id = ?', [id]);
            const count = result?.count || 0;
            return {
                hasSchedules: count > 0,
                scheduleCount: count
            };
        }
        catch (error) {
            console.error('Dependency check error:', error);
            return { hasSchedules: false, scheduleCount: 0 };
        }
    }
    /**
     * アクティブなスタッフのみ取得
     * （将来的に論理削除機能を追加する場合に備えて）
     */
    async getActiveStaff() {
        try {
            // 現在は全スタッフがアクティブとして扱う
            return await this.getAll();
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}
exports.StaffRepository = StaffRepository;
//# sourceMappingURL=staff-repository.js.map