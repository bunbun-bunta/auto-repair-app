// src/renderer/services/api/staff-api.ts
import { BaseApi } from './base-api';
import { Staff, StaffFormData, ApiResponse } from '../../../shared/types';

export class StaffApi extends BaseApi<Staff> {
    constructor() {
        super('staff');
    }

    /**
     * OAuth認証状態を更新
     */
    async updateOAuthStatus(
        id: number,
        status: '未認証' | '認証済み' | '期限切れ' | 'エラー'
    ): Promise<ApiResponse<Staff>> {
        return this.invoke('staff:updateOAuthStatus', id, status);
    }

    /**
     * 管理者一覧を取得
     */
    async getAdministrators(): Promise<ApiResponse<Staff[]>> {
        return this.invoke('staff:getAdministrators');
    }

    /**
     * 認証済みスタッフ一覧を取得
     */
    async getAuthenticated(): Promise<ApiResponse<Staff[]>> {
        return this.invoke('staff:getAuthenticated');
    }

    /**
     * スタッフ統計情報を取得
     */
    async getStatistics(): Promise<ApiResponse<{
        totalCount: number;
        adminCount: number;
        authenticatedCount: number;
        pendingAuthCount: number;
    }>> {
        return this.invoke('staff:getStatistics');
    }

    /**
     * 色の使用状況をチェック
     */
    async checkColorUsage(color: string, excludeId?: number): Promise<ApiResponse<{ isUsed: boolean }>> {
        return this.invoke('staff:checkColorUsage', color, excludeId);
    }

    /**
     * スタッフの依存関係をチェック
     */
    async checkDependencies(id: number): Promise<ApiResponse<{ hasSchedules: boolean; scheduleCount: number }>> {
        return this.invoke('staff:checkDependencies', id);
    }

    /**
     * スタッフ作成（バリデーション付き）
     */
    async createStaff(data: StaffFormData): Promise<ApiResponse<Staff>> {
        // フロントエンド側での事前バリデーション
        if (!data.name?.trim()) {
            return {
                success: false,
                error: 'スタッフ名は必須です'
            };
        }

        if (data.email && !this.isValidEmail(data.email)) {
            return {
                success: false,
                error: 'メールアドレスの形式が正しくありません'
            };
        }

        return this.create(data);
    }

    /**
     * スタッフ更新（バリデーション付き）
     */
    async updateStaff(id: number, data: Partial<StaffFormData>): Promise<ApiResponse<Staff>> {
        // フロントエンド側での事前バリデーション
        if (data.name !== undefined && !data.name?.trim()) {
            return {
                success: false,
                error: 'スタッフ名は必須です'
            };
        }

        if (data.email !== undefined && data.email && !this.isValidEmail(data.email)) {
            return {
                success: false,
                error: 'メールアドレスの形式が正しくありません'
            };
        }

        return this.update(id, data);
    }

    /**
     * 安全なスタッフ削除（依存関係チェック付き）
     */
    async deleteStaff(id: number): Promise<ApiResponse<void>> {
        try {
            // まず依存関係をチェック
            const dependencyCheck = await this.checkDependencies(id);

            if (!dependencyCheck.success) {
                return dependencyCheck as ApiResponse<void>;
            }

            if (dependencyCheck.data?.hasSchedules) {
                return {
                    success: false,
                    error: `このスタッフには${dependencyCheck.data.scheduleCount}件の予定が関連付けられているため削除できません。`
                };
            }

            // 依存関係がない場合のみ削除実行
            return this.delete(id);
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'スタッフ削除処理でエラーが発生しました'
            };
        }
    }

    /**
     * メールアドレスの簡易バリデーション
     */
    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * 16進数カラーコードの簡易バリデーション
     */
    private isValidHexColor(color: string): boolean {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
    }

    /**
     * スタッフ一覧を権限レベル別に取得
     */
    async getStaffByPermission(permissionLevel: '管理者' | '一般'): Promise<ApiResponse<Staff[]>> {
        try {
            const allStaffResponse = await this.getAll();

            if (!allStaffResponse.success || !allStaffResponse.data) {
                return allStaffResponse;
            }

            const filteredStaff = allStaffResponse.data.filter(
                staff => staff.permissionLevel === permissionLevel
            );

            return {
                success: true,
                data: filteredStaff
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'スタッフ一覧の取得でエラーが発生しました'
            };
        }
    }

    /**
     * OAuth認証状態別にスタッフを取得
     */
    async getStaffByOAuthStatus(
        status: '未認証' | '認証済み' | '期限切れ' | 'エラー'
    ): Promise<ApiResponse<Staff[]>> {
        try {
            const allStaffResponse = await this.getAll();

            if (!allStaffResponse.success || !allStaffResponse.data) {
                return allStaffResponse;
            }

            const filteredStaff = allStaffResponse.data.filter(
                staff => staff.oauthStatus === status
            );

            return {
                success: true,
                data: filteredStaff
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'スタッフ一覧の取得でエラーが発生しました'
            };
        }
    }
}