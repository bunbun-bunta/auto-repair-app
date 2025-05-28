// src/renderer/hooks/useStaff.ts
import { useState, useCallback, useEffect } from 'react';
import { StaffApi } from '../services/api/staff-api';
import { Staff, StaffFormData } from '../../shared/types';
import { useApi } from './useApi';

const staffApi = new StaffApi();

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
    // 基本CRUD操作
    loadStaffList: () => Promise<void>;
    loadStaffById: (id: number) => Promise<void>;
    createStaff: (data: StaffFormData) => Promise<boolean>;
    updateStaff: (id: number, data: Partial<StaffFormData>) => Promise<boolean>;
    deleteStaff: (id: number) => Promise<boolean>;

    // OAuth関連
    updateOAuthStatus: (id: number, status: '未認証' | '認証済み' | '期限切れ' | 'エラー') => Promise<boolean>;

    // フィルタリング
    loadAdministrators: () => Promise<void>;
    loadAuthenticatedStaff: () => Promise<void>;

    // ユーティリティ
    checkColorUsage: (color: string, excludeId?: number) => Promise<{ isUsed: boolean } | null>;
    checkDependencies: (id: number) => Promise<{ hasSchedules: boolean; scheduleCount: number } | null>;
    loadStatistics: () => Promise<void>;

    // 状態管理
    setSelectedStaff: (staff: Staff | null) => void;
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

    // API呼び出し用のカスタムフック
    const {
        data: createData,
        loading: createLoading,
        error: createError,
        execute: executeCreate,
        reset: resetCreate
    } = useApi(staffApi.createStaff.bind(staffApi));

    const {
        data: updateData,
        loading: updateLoading,
        error: updateError,
        execute: executeUpdate,
        reset: resetUpdate
    } = useApi(staffApi.updateStaff.bind(staffApi));

    const {
        data: deleteData,
        loading: deleteLoading,
        error: deleteError,
        execute: executeDelete,
        reset: resetDelete
    } = useApi(staffApi.deleteStaff.bind(staffApi));

    // スタッフ一覧を読み込み
    const loadStaffList = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await staffApi.getAll();

            if (response.success && response.data) {
                setState(prev => ({
                    ...prev,
                    staffList: response.data!,
                    loading: false
                }));
            } else {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: response.error || 'スタッフ一覧の取得に失敗しました'
                }));
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : '不明なエラーが発生しました'
            }));
        }
    }, []);

    // 特定のスタッフを読み込み
    const loadStaffById = useCallback(async (id: number) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await staffApi.getById(id);

            if (response.success && response.data) {
                setState(prev => ({
                    ...prev,
                    selectedStaff: response.data!,
                    loading: false
                }));
            } else {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: response.error || 'スタッフの取得に失敗しました'
                }));
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : '不明なエラーが発生しました'
            }));
        }
    }, []);

    // スタッフを作成
    const createStaff = useCallback(async (data: StaffFormData): Promise<boolean> => {
        const result = await executeCreate(data);

        if (result) {
            // 作成成功時にリストを再読み込み
            await loadStaffList();
            return true;
        }

        return false;
    }, [executeCreate, loadStaffList]);

    // スタッフを更新
    const updateStaff = useCallback(async (id: number, data: Partial<StaffFormData>): Promise<boolean> => {
        const result = await executeUpdate(id, data);

        if (result) {
            // 更新成功時にリストを再読み込み
            await loadStaffList();

            // 選択中のスタッフが更新された場合は再読み込み
            if (state.selectedStaff?.id === id) {
                await loadStaffById(id);
            }

            return true;
        }

        return false;
    }, [executeUpdate, loadStaffList, loadStaffById, state.selectedStaff?.id]);

    // スタッフを削除
    const deleteStaff = useCallback(async (id: number): Promise<boolean> => {
        const result = await executeDelete(id);

        if (result) {
            // 削除成功時にリストを再読み込み
            await loadStaffList();

            // 選択中のスタッフが削除された場合はクリア
            if (state.selectedStaff?.id === id) {
                setState(prev => ({ ...prev, selectedStaff: null }));
            }

            return true;
        }

        return false;
    }, [executeDelete, loadStaffList, state.selectedStaff?.id]);

    // OAuth認証状態を更新
    const updateOAuthStatus = useCallback(async (
        id: number,
        status: '未認証' | '認証済み' | '期限切れ' | 'エラー'
    ): Promise<boolean> => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await staffApi.updateOAuthStatus(id, status);

            if (response.success) {
                // 成功時にリストを再読み込み
                await loadStaffList();

                // 選択中のスタッフの場合は再読み込み
                if (state.selectedStaff?.id === id) {
                    await loadStaffById(id);
                }

                setState(prev => ({ ...prev, loading: false }));
                return true;
            } else {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: response.error || 'OAuth認証状態の更新に失敗しました'
                }));
                return false;
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : '不明なエラーが発生しました'
            }));
            return false;
        }
    }, [loadStaffList, loadStaffById, state.selectedStaff?.id]);

    // 管理者一覧を読み込み
    const loadAdministrators = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await staffApi.getAdministrators();

            if (response.success && response.data) {
                setState(prev => ({
                    ...prev,
                    staffList: response.data!,
                    loading: false
                }));
            } else {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: response.error || '管理者一覧の取得に失敗しました'
                }));
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : '不明なエラーが発生しました'
            }));
        }
    }, []);

    // 認証済みスタッフ一覧を読み込み
    const loadAuthenticatedStaff = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await staffApi.getAuthenticated();

            if (response.success && response.data) {
                setState(prev => ({
                    ...prev,
                    staffList: response.data!,
                    loading: false
                }));
            } else {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: response.error || '認証済みスタッフ一覧の取得に失敗しました'
                }));
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : '不明なエラーが発生しました'
            }));
        }
    }, []);

    // 色の使用状況をチェック
    const checkColorUsage = useCallback(async (color: string, excludeId?: number) => {
        try {
            const response = await staffApi.checkColorUsage(color, excludeId);
            return response.success ? response.data! : null;
        } catch (error) {
            console.error('Color usage check error:', error);
            return null;
        }
    }, []);

    // 依存関係をチェック
    const checkDependencies = useCallback(async (id: number) => {
        try {
            const response = await staffApi.checkDependencies(id);
            return response.success ? response.data! : null;
        } catch (error) {
            console.error('Dependencies check error:', error);
            return null;
        }
    }, []);

    // 統計情報を読み込み
    const loadStatistics = useCallback(async () => {
        try {
            const response = await staffApi.getStatistics();

            if (response.success && response.data) {
                setState(prev => ({
                    ...prev,
                    statistics: response.data!
                }));
            }
        } catch (error) {
            console.error('Statistics loading error:', error);
        }
    }, []);

    // 選択中のスタッフを設定
    const setSelectedStaff = useCallback((staff: Staff | null) => {
        setState(prev => ({ ...prev, selectedStaff: staff }));
    }, []);

    // エラーをクリア
    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
        resetCreate();
        resetUpdate();
        resetDelete();
    }, [resetCreate, resetUpdate, resetDelete]);

    // 状態をリセット
    const reset = useCallback(() => {
        setState({
            staffList: [],
            selectedStaff: null,
            loading: false,
            error: null,
            statistics: null,
        });
        resetCreate();
        resetUpdate();
        resetDelete();
    }, [resetCreate, resetUpdate, resetDelete]);

    // 初回読み込み
    useEffect(() => {
        loadStaffList();
        loadStatistics();
    }, []);

    // ローディング状態の統合
    const loading = state.loading || createLoading || updateLoading || deleteLoading;

    // エラー状態の統合
    const error = state.error || createError || updateError || deleteError;

    return {
        // 状態
        ...state,
        loading,
        error,

        // アクション
        loadStaffList,
        loadStaffById,
        createStaff,
        updateStaff,
        deleteStaff,
        updateOAuthStatus,
        loadAdministrators,
        loadAuthenticatedStaff,
        checkColorUsage,
        checkDependencies,
        loadStatistics,
        setSelectedStaff,
        clearError,
        reset,
    };
}