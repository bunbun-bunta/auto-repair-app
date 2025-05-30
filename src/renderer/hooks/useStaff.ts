// src/renderer/hooks/useStaff.ts - 型安全修正版
import { useState, useCallback, useEffect } from 'react';
import { Staff, StaffFormData, ApiResponse } from '@shared/types';

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

    // 型安全なAPIレスポンス処理
    const handleApiResponse = useCallback(async <T>(
        apiCall: () => Promise<ApiResponse<T>>,
        successCallback?: (data: T) => void,
        errorMessage?: string
    ): Promise<T | null> => {
        try {
            const response = await apiCall();

            if (response && response.success && response.data !== undefined) {
                if (successCallback) {
                    successCallback(response.data);
                }
                return response.data;
            } else {
                const errorMsg = response?.error || errorMessage || 'APIエラーが発生しました';
                setState(prev => ({ ...prev, error: errorMsg }));
                return null;
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : (errorMessage || 'Unknown error');
            setState(prev => ({ ...prev, error: errorMsg }));
            return null;
        }
    }, []);

    // スタッフ一覧を読み込み
    const loadStaffList = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            // electronAPIが利用可能か確認
            if (!window.electronAPI?.staff) {
                throw new Error('Electron APIが利用できません');
            }

            // スタッフ一覧を取得（型安全に処理）
            const staffResponse = await window.electronAPI.staff.getAll();
            const staffData: Staff[] = staffResponse?.success ? (staffResponse.data as Staff[] || []) : [];

            // 統計情報を取得（型安全に処理）
            const statsResponse = await window.electronAPI.staff.getStatistics();
            const statsData = statsResponse?.success ? statsResponse.data : null;

            setState(prev => ({
                ...prev,
                staffList: staffData,
                statistics: statsData,
                loading: false
            }));

        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                staffList: [], // 型安全：配列で初期化
                statistics: null,
                error: error instanceof Error ? error.message : 'スタッフ一覧の読み込みに失敗しました'
            }));
        }
    }, []);

    // スタッフを作成
    const createStaff = useCallback(async (data: StaffFormData): Promise<boolean> => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            if (!window.electronAPI?.staff) {
                throw new Error('Electron APIが利用できません');
            }

            const response = await window.electronAPI.staff.create(data);

            if (response?.success) {
                // 成功した場合、一覧を再読み込み
                await loadStaffList();
                setState(prev => ({ ...prev, loading: false }));
                return true;
            } else {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: response?.error || 'スタッフの作成に失敗しました'
                }));
                return false;
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'スタッフの作成に失敗しました'
            }));
            return false;
        }
    }, [loadStaffList]);

    // スタッフを更新
    const updateStaff = useCallback(async (id: number, data: Partial<StaffFormData>): Promise<boolean> => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            if (!window.electronAPI?.staff) {
                throw new Error('Electron APIが利用できません');
            }

            const response = await window.electronAPI.staff.update(id, data);

            if (response?.success) {
                // 成功した場合、一覧を再読み込み
                await loadStaffList();
                setState(prev => ({ ...prev, loading: false }));
                return true;
            } else {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: response?.error || 'スタッフの更新に失敗しました'
                }));
                return false;
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'スタッフの更新に失敗しました'
            }));
            return false;
        }
    }, [loadStaffList]);

    // スタッフを削除
    const deleteStaff = useCallback(async (id: number): Promise<boolean> => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            if (!window.electronAPI?.staff) {
                throw new Error('Electron APIが利用できません');
            }

            const response = await window.electronAPI.staff.delete(id);

            if (response?.success !== false) { // void型の場合もあるのでfalseでない場合を成功とする
                // 成功した場合、一覧を再読み込み
                await loadStaffList();
                setState(prev => ({ ...prev, loading: false }));
                return true;
            } else {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: response?.error || 'スタッフの削除に失敗しました'
                }));
                return false;
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'スタッフの削除に失敗しました'
            }));
            return false;
        }
    }, [loadStaffList]);

    // OAuth認証状態を更新
    const updateOAuthStatus = useCallback(async (
        id: number,
        status: '未認証' | '認証済み' | '期限切れ' | 'エラー'
    ): Promise<boolean> => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            if (!window.electronAPI?.staff) {
                throw new Error('Electron APIが利用できません');
            }

            const response = await window.electronAPI.staff.updateOAuthStatus(id, status);

            if (response?.success) {
                // 成功した場合、一覧を再読み込み
                await loadStaffList();
                setState(prev => ({ ...prev, loading: false }));
                return true;
            } else {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: response?.error || 'OAuth認証状態の更新に失敗しました'
                }));
                return false;
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'OAuth認証状態の更新に失敗しました'
            }));
            return false;
        }
    }, [loadStaffList]);

    // 色の使用状況をチェック（型安全）
    const checkColorUsage = useCallback(async (color: string, excludeId?: number): Promise<{ isUsed: boolean } | null> => {
        try {
            if (!window.electronAPI?.staff) {
                return null;
            }

            const response = await window.electronAPI.staff.checkColorUsage(color, excludeId);

            if (response?.success && response.data) {
                return response.data;
            } else {
                console.error('色の使用状況チェックに失敗:', response?.error);
                return null;
            }
        } catch (error) {
            console.error('色の使用状況チェックエラー:', error);
            return null;
        }
    }, []);

    // 依存関係をチェック（型安全）
    const checkDependencies = useCallback(async (id: number): Promise<{ hasSchedules: boolean; scheduleCount: number } | null> => {
        try {
            if (!window.electronAPI?.staff) {
                return null;
            }

            const response = await window.electronAPI.staff.checkDependencies(id);

            if (response?.success && response.data) {
                return response.data;
            } else {
                console.error('依存関係チェックに失敗:', response?.error);
                return null;
            }
        } catch (error) {
            console.error('依存関係チェックエラー:', error);
            return null;
        }
    }, []);

    // エラーをクリア
    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    // 状態をリセット
    const reset = useCallback(() => {
        setState({
            staffList: [],
            selectedStaff: null,
            loading: false,
            error: null,
            statistics: null,
        });
    }, []);

    // 初回読み込み
    useEffect(() => {
        // electronAPIが利用可能になったら自動的にデータを読み込み
        if (window.electronAPI?.staff) {
            loadStaffList();
        }
    }, [loadStaffList]);

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