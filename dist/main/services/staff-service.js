"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffService = void 0;
// src/main/services/staff-service.ts
const base_service_1 = require("./base-service");
const utils_1 = require("../../shared/utils");
const constants_1 = require("../../shared/constants");
class StaffService extends base_service_1.BaseService {
    constructor(staffRepository) {
        super(staffRepository);
        this.staffRepository = staffRepository;
    }
    /**
     * 新しいスタッフを作成
     */
    async create(data) {
        try {
            // バリデーション実行
            await this.validateBeforeCreate(data);
            // 表示色が未設定の場合、自動割り当て
            if (!data.displayColor) {
                data.displayColor = await this.getAvailableColor();
            }
            // データベースに保存
            const result = await this.staffRepository.create(data);
            if (result.success) {
                console.log(`Staff created: ${data.name} (ID: ${result.data?.id})`);
            }
            return result;
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'スタッフの作成に失敗しました'
            };
        }
    }
    /**
     * スタッフ情報を更新
     */
    async update(id, data) {
        try {
            // 更新前のバリデーション
            await this.validateBeforeUpdate(id, data);
            const result = await this.staffRepository.update(id, data);
            if (result.success) {
                console.log(`Staff updated: ID ${id}`);
            }
            return result;
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'スタッフの更新に失敗しました'
            };
        }
    }
    /**
     * スタッフを削除（依存関係チェックあり）
     */
    async delete(id) {
        try {
            // 依存関係をチェック
            const dependencies = await this.staffRepository.checkDependencies(id);
            if (dependencies.hasSchedules) {
                return {
                    success: false,
                    error: `このスタッフには${dependencies.scheduleCount}件の予定が関連付けられているため削除できません。`
                };
            }
            const result = await this.staffRepository.delete(id);
            if (result.success) {
                console.log(`Staff deleted: ID ${id}`);
            }
            return result;
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'スタッフの削除に失敗しました'
            };
        }
    }
    /**
     * OAuth認証状態を更新
     */
    async updateOAuthStatus(id, status) {
        try {
            const result = await this.staffRepository.updateOAuthStatus(id, status);
            if (result.success) {
                console.log(`OAuth status updated for staff ID ${id}: ${status}`);
            }
            return result;
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'OAuth認証状態の更新に失敗しました'
            };
        }
    }
    /**
     * 管理者一覧を取得
     */
    async getAdministrators() {
        return await this.staffRepository.getAdministrators();
    }
    /**
     * 認証済みスタッフ一覧を取得
     */
    async getAuthenticatedStaff() {
        return await this.staffRepository.getAuthenticatedStaff();
    }
    /**
     * 作成前のバリデーション
     */
    async validateBeforeCreate(data) {
        const errors = [];
        // 必須項目チェック
        const nameValidation = utils_1.ValidationUtils.validateRequired(data.name);
        if (!nameValidation.isValid) {
            errors.push('スタッフ名は必須です');
        }
        // メールアドレスのバリデーション
        if (data.email) {
            const emailValidation = utils_1.ValidationUtils.validateEmail(data.email);
            if (!emailValidation.isValid) {
                errors.push(constants_1.ERROR_MESSAGES.INVALID_EMAIL);
            }
            // メールアドレスの重複チェック
            const existingStaff = await this.staffRepository.findByEmail(data.email);
            if (existingStaff.success) {
                errors.push('このメールアドレスは既に使用されています');
            }
        }
        // 表示色のバリデーション
        if (data.displayColor) {
            if (!utils_1.ColorUtils.isValidHexColor(data.displayColor)) {
                errors.push('表示色の形式が正しくありません');
            }
            else {
                // 色の重複チェック
                const isColorUsed = await this.staffRepository.isColorUsed(data.displayColor);
                if (isColorUsed) {
                    errors.push('この色は既に他のスタッフが使用しています');
                }
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
        // スタッフの存在確認
        const existingStaff = await this.staffRepository.getById(id);
        if (!existingStaff.success) {
            throw new Error('スタッフが見つかりません');
        }
        // 名前のバリデーション
        if (data.name !== undefined) {
            const nameValidation = utils_1.ValidationUtils.validateRequired(data.name);
            if (!nameValidation.isValid) {
                errors.push('スタッフ名は必須です');
            }
        }
        // メールアドレスのバリデーション
        if (data.email !== undefined) {
            if (data.email) {
                const emailValidation = utils_1.ValidationUtils.validateEmail(data.email);
                if (!emailValidation.isValid) {
                    errors.push(constants_1.ERROR_MESSAGES.INVALID_EMAIL);
                }
                // 他のスタッフとの重複チェック（自分以外）
                const existingByEmail = await this.staffRepository.findByEmail(data.email);
                if (existingByEmail.success && existingByEmail.data?.id !== id) {
                    errors.push('このメールアドレスは既に使用されています');
                }
            }
        }
        // 表示色のバリデーション
        if (data.displayColor !== undefined) {
            if (!utils_1.ColorUtils.isValidHexColor(data.displayColor)) {
                errors.push('表示色の形式が正しくありません');
            }
            else {
                // 色の重複チェック（自分以外）
                const isColorUsed = await this.staffRepository.isColorUsed(data.displayColor, id);
                if (isColorUsed) {
                    errors.push('この色は既に他のスタッフが使用しています');
                }
            }
        }
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
    }
    /**
     * 使用可能な色を取得
     */
    async getAvailableColor() {
        // 既存のスタッフが使用している色を取得
        const allStaffResponse = await this.staffRepository.getAll();
        const usedColors = allStaffResponse.success
            ? allStaffResponse.data?.map(staff => staff.displayColor).filter(Boolean) || []
            : [];
        // 使用可能な色を探す
        for (const color of constants_1.EVENT_COLORS) {
            if (!usedColors.includes(color)) {
                return color;
            }
        }
        // 全ての色が使用済みの場合は、最初の色を返す
        return constants_1.EVENT_COLORS[0];
    }
    /**
     * スタッフの統計情報を取得
     */
    async getStaffStatistics() {
        try {
            const allStaffResponse = await this.staffRepository.getAll();
            if (!allStaffResponse.success || !allStaffResponse.data) {
                return {
                    success: false,
                    error: 'スタッフ情報の取得に失敗しました'
                };
            }
            const staffList = allStaffResponse.data;
            const statistics = {
                totalCount: staffList.length,
                adminCount: staffList.filter(staff => staff.permissionLevel === '管理者').length,
                authenticatedCount: staffList.filter(staff => staff.oauthStatus === '認証済み').length,
                pendingAuthCount: staffList.filter(staff => staff.oauthStatus === '未認証').length,
            };
            return {
                success: true,
                data: statistics
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '統計情報の取得に失敗しました'
            };
        }
    }
}
exports.StaffService = StaffService;
//# sourceMappingURL=staff-service.js.map