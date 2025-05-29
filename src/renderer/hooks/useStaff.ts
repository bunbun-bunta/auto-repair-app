// src/renderer/hooks/useStaff.ts - 簡易版
import { useState, useCallback } from 'react';
import { Staff, StaffFormData, ApiResponse } from '../../shared/types';

export interface UseStaffState {
    staffList: Staff[];
    selectedStaff: Staff | null;
    loading: boolean;
    error: string | null;
    statistics: {
        totalCount: number;
        adminCount: number;
        authenticatedCount: number;
        pendingAuthCount: number;
    } | null;
}

export interface UseStaffActions {
    loadStaffList: () => Promise<void>;
    createStaff: (data: StaffFormData) => Promise<boolean>;
    updateStaff: (id: number, data: Partial<StaffFormData>) => Promise<boolean>;
    deleteStaff: (id: number) => Promise<boolean>;
    updateOAuthStatus: (id: number, status: '未認証' | '認証済み' | '期限切れ' | 'エラー') => Promise<boolean>;
    checkColorUsage: (color: string, excludeId?: number) => Promise<{ isUsed: boolean } | null>;
    checkDependencies: (id: number) => Promise<{ hasSchedules: boolean; scheduleCount: number } | null>;
    clearError: () => void;
    reset: () => void;
}

export function useStaff(): UseStaffState & UseStaffActions {
    const [state, setState] = useState<UseStaffState>({
        staffList: [],
        selectedStaff: null,
        loading: false,
        error: null,
        statistics: null,
    });

    // 簡易版の実装 - 実際のAPI呼び出しの代わりにダミーデータを返す
    const loadStaffList = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        try {
            // TODO: 実際のAPI呼び出しに置き換え
            setTimeout(() => {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    staffList: [
                        {
                            id: 1,
                            name: '田中太郎',
                            displayColor: '#FF6B6B',
                            email: 'tanaka@example.com',
                            oauthStatus: '認証済み',
                            permissionLevel: '管理者'
                        },
                        {
                            id: 2,
                            name: '佐藤花子',
                            displayColor: '#4ECDC4',
                            email: 'sato@example.com',
                            oauthStatus: '未認証',
                            permissionLevel: '一般'
                        }
                    ]
                }));
            }, 1000);
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: 'スタッフ一覧の取得に失敗しました'
            }));
        }
    }, []);

    const createStaff = useCallback(async (data: StaffFormData): Promise<boolean> => {
        console.log('スタッフ作成:', data);
        // TODO: 実際の作成処理
        return true;
    }, []);

    const updateStaff = useCallback(async (id: number, data: Partial<StaffFormData>): Promise<boolean> => {
        console.log('スタッフ更新:', id, data);
        // TODO: 実際の更新処理
        return true;
    }, []);

    const deleteStaff = useCallback(async (id: number): Promise<boolean> => {
        console.log('スタッフ削除:', id);
        // TODO: 実際の削除処理
        return true;
    }, []);

    const updateOAuthStatus = useCallback(async (
        id: number,
        status: '未認証' | '認証済み' | '期限切れ' | 'エラー'
    ): Promise<boolean> => {
        console.log('OAuth状態更新:', id, status);
        // TODO: 実際の更新処理
        return true;
    }, []);

    const checkColorUsage = useCallback(async (color: string, excludeId?: number) => {
        console.log('色使用チェック:', color, excludeId);
        // TODO: 実際のチェック処理
        return { isUsed: false };
    }, []);

    const checkDependencies = useCallback(async (id: number) => {
        console.log('依存関係チェック:', id);
        // TODO: 実際のチェック処理
        return { hasSchedules: false, scheduleCount: 0 };
    }, []);

    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    const reset = useCallback(() => {
        setState({
            staffList: [],
            selectedStaff: null,
            loading: false,
            error: null,
            statistics: null,
        });
    }, []);

    return {
        ...state,
        loadStaffList,
        createStaff,
        updateStaff,
        deleteStaff,
        updateOAuthStatus,
        checkColorUsage,
        checkDependencies,
        clearError,
        reset,
    };
}