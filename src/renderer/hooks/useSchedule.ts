// src/renderer/hooks/useSchedule.ts - 予定管理カスタムフック
import { useState, useCallback, useEffect } from 'react';
import { Schedule, ScheduleFormData, ScheduleSearchParams, ApiResponse } from '@shared/types';

export interface UseScheduleState {
    scheduleList: Schedule[];
    selectedSchedule: Schedule | null;
    loading: boolean;
    error: string | null;
    monthlyStatistics: {
        totalSchedules: number;
        completedSchedules: number;
        billingStatistics: Record<string, number>;
        categoryStatistics: Record<string, number>;
    } | null;
    todaySchedules: Schedule[];
}

export interface UseScheduleActions {
    loadScheduleList: () => Promise<void>;
    searchSchedules: (params: ScheduleSearchParams) => Promise<void>;
    getSchedulesByDateRange: (startDate: string, endDate: string) => Promise<void>;
    getTodaySchedules: () => Promise<void>;
    getMonthlyStatistics: (year: number, month: number) => Promise<void>;
    createSchedule: (data: ScheduleFormData) => Promise<boolean>;
    updateSchedule: (id: number, data: Partial<ScheduleFormData>) => Promise<boolean>;
    deleteSchedule: (id: number) => Promise<boolean>;
    completeSchedule: (id: number, actualEndDatetime?: string) => Promise<boolean>;
    updateBillingStatus: (id: number, status: '未請求' | '請求済み' | '入金済み' | 'キャンセル') => Promise<boolean>;
    checkTimeConflict: (staffId: number, startDatetime: string, endDatetime: string, excludeScheduleId?: number) => Promise<{ hasConflict: boolean; conflictingSchedules: Schedule[] } | null>;
    clearError: () => void;
    reset: () => void;
    setSelectedSchedule: (schedule: Schedule | null) => void;
}

export function useSchedule(): UseScheduleState & UseScheduleActions {
    const [state, setState] = useState<UseScheduleState>({
        scheduleList: [],
        selectedSchedule: null,
        loading: false,
        error: null,
        monthlyStatistics: null,
        todaySchedules: [],
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
                const errorMsg = response?.error || errorMessage || '予定管理APIでエラーが発生しました';
                setState(prev => ({ ...prev, error: errorMsg }));
                return null;
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : (errorMessage || 'Unknown error');
            setState(prev => ({ ...prev, error: errorMsg }));
            return null;
        }
    }, []);

    // 予定一覧を読み込み
    const loadScheduleList = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            if (!window.electronAPI?.schedule) {
                throw new Error('Electron APIが利用できません');
            }

            const response = await window.electronAPI.schedule.getAll();
            const scheduleData: Schedule[] = response?.success ? (response.data as Schedule[] || []) : [];

            setState(prev => ({
                ...prev,
                scheduleList: scheduleData,
                loading: false
            }));

        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                scheduleList: [],
                error: error instanceof Error ? error.message : '予定一覧の読み込みに失敗しました'
            }));
        }
    }, []);

    // 検索条件付きで予定一覧を取得
    const searchSchedules = useCallback(async (params: ScheduleSearchParams) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            if (!window.electronAPI?.schedule) {
                throw new Error('Electron APIが利用できません');
            }

            const response = await window.electronAPI.schedule.search(params);
            const scheduleData: Schedule[] = response?.success ? (response.data as Schedule[] || []) : [];

            setState(prev => ({
                ...prev,
                scheduleList: scheduleData,
                loading: false
            }));

        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                scheduleList: [],
                error: error instanceof Error ? error.message : '予定検索に失敗しました'
            }));
        }
    }, []);

    // 期間指定で予定を取得
    const getSchedulesByDateRange = useCallback(async (startDate: string, endDate: string) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            if (!window.electronAPI?.schedule) {
                throw new Error('Electron APIが利用できません');
            }

            const response = await window.electronAPI.schedule.getByDateRange(startDate, endDate);
            const scheduleData: Schedule[] = response?.success ? (response.data as Schedule[] || []) : [];

            setState(prev => ({
                ...prev,
                scheduleList: scheduleData,
                loading: false
            }));

        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                scheduleList: [],
                error: error instanceof Error ? error.message : '期間指定予定取得に失敗しました'
            }));
        }
    }, []);

    // 今日の予定を取得
    const getTodaySchedules = useCallback(async () => {
        try {
            if (!window.electronAPI?.schedule) {
                throw new Error('Electron APIが利用できません');
            }

            const response = await window.electronAPI.schedule.getToday();
            const todayData: Schedule[] = response?.success ? (response.data as Schedule[] || []) : [];

            setState(prev => ({
                ...prev,
                todaySchedules: todayData
            }));

        } catch (error) {
            console.error('今日の予定取得エラー:', error);
        }
    }, []);

    // 月間統計を取得
    const getMonthlyStatistics = useCallback(async (year: number, month: number) => {
        try {
            if (!window.electronAPI?.schedule) {
                throw new Error('Electron APIが利用できません');
            }

            const response = await window.electronAPI.schedule.getMonthlyStatistics(year, month);

            if (response?.success && response.data) {
                setState(prev => ({
                    ...prev,
                    monthlyStatistics: response.data
                }));
            }

        } catch (error) {
            console.error('月間統計取得エラー:', error);
        }
    }, []);

    // 予定を作成
    const createSchedule = useCallback(async (data: ScheduleFormData): Promise<boolean> => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            if (!window.electronAPI?.schedule) {
                throw new Error('Electron APIが利用できません');
            }

            const response = await window.electronAPI.schedule.create(data);

            if (response?.success) {
                // 成功した場合、一覧を再読み込み
                await loadScheduleList();
                setState(prev => ({ ...prev, loading: false }));
                return true;
            } else {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: response?.error || '予定の作成に失敗しました'
                }));
                return false;
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : '予定の作成に失敗しました'
            }));
            return false;
        }
    }, [loadScheduleList]);

    // 予定を更新
    const updateSchedule = useCallback(async (id: number, data: Partial<ScheduleFormData>): Promise<boolean> => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            if (!window.electronAPI?.schedule) {
                throw new Error('Electron APIが利用できません');
            }

            const response = await window.electronAPI.schedule.update(id, data);

            if (response?.success) {
                // 成功した場合、一覧を再読み込み
                await loadScheduleList();
                setState(prev => ({ ...prev, loading: false }));
                return true;
            } else {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: response?.error || '予定の更新に失敗しました'
                }));
                return false;
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : '予定の更新に失敗しました'
            }));
            return false;
        }
    }, [loadScheduleList]);

    // 予定を削除
    const deleteSchedule = useCallback(async (id: number): Promise<boolean> => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            if (!window.electronAPI?.schedule) {
                throw new Error('Electron APIが利用できません');
            }

            const response = await window.electronAPI.schedule.delete(id);

            if (response?.success !== false) { // void型の場合もあるのでfalseでない場合を成功とする
                // 成功した場合、一覧を再読み込み
                await loadScheduleList();
                setState(prev => ({ ...prev, loading: false }));
                return true;
            } else {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: response?.error || '予定の削除に失敗しました'
                }));
                return false;
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : '予定の削除に失敗しました'
            }));
            return false;
        }
    }, [loadScheduleList]);

    // 予定完了処理
    const completeSchedule = useCallback(async (id: number, actualEndDatetime?: string): Promise<boolean> => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            if (!window.electronAPI?.schedule) {
                throw new Error('Electron APIが利用できません');
            }

            const response = await window.electronAPI.schedule.complete(id, actualEndDatetime);

            if (response?.success) {
                // 成功した場合、一覧を再読み込み
                await loadScheduleList();
                setState(prev => ({ ...prev, loading: false }));
                return true;
            } else {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: response?.error || '予定完了処理に失敗しました'
                }));
                return false;
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : '予定完了処理に失敗しました'
            }));
            return false;
        }
    }, [loadScheduleList]);

    // 請求状況を更新
    const updateBillingStatus = useCallback(async (
        id: number,
        status: '未請求' | '請求済み' | '入金済み' | 'キャンセル'
    ): Promise<boolean> => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            if (!window.electronAPI?.schedule) {
                throw new Error('Electron APIが利用できません');
            }

            const response = await window.electronAPI.schedule.updateBillingStatus(id, status);

            if (response?.success) {
                // 成功した場合、一覧を再読み込み
                await loadScheduleList();
                setState(prev => ({ ...prev, loading: false }));
                return true;
            } else {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: response?.error || '請求状況の更新に失敗しました'
                }));
                return false;
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : '請求状況の更新に失敗しました'
            }));
            return false;
        }
    }, [loadScheduleList]);

    // 時間重複チェック
    const checkTimeConflict = useCallback(async (
        staffId: number,
        startDatetime: string,
        endDatetime: string,
        excludeScheduleId?: number
    ): Promise<{ hasConflict: boolean; conflictingSchedules: Schedule[] } | null> => {
        try {
            if (!window.electronAPI?.schedule) {
                return null;
            }

            const response = await window.electronAPI.schedule.checkTimeConflict(
                staffId,
                startDatetime,
                endDatetime,
                excludeScheduleId
            );

            if (response?.success && response.data) {
                return response.data;
            } else {
                console.error('時間重複チェックに失敗:', response?.error);
                return null;
            }
        } catch (error) {
            console.error('時間重複チェックエラー:', error);
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
            scheduleList: [],
            selectedSchedule: null,
            loading: false,
            error: null,
            monthlyStatistics: null,
            todaySchedules: [],
        });
    }, []);

    // 選択された予定を設定
    const setSelectedSchedule = useCallback((schedule: Schedule | null) => {
        setState(prev => ({ ...prev, selectedSchedule: schedule }));
    }, []);

    // 初回読み込み
    useEffect(() => {
        // electronAPIが利用可能になったら自動的にデータを読み込み
        if (window.electronAPI?.schedule) {
            loadScheduleList();
            getTodaySchedules();
        }
    }, [loadScheduleList, getTodaySchedules]);

    return {
        ...state,
        loadScheduleList,
        searchSchedules,
        getSchedulesByDateRange,
        getTodaySchedules,
        getMonthlyStatistics,
        createSchedule,
        updateSchedule,
        deleteSchedule,
        completeSchedule,
        updateBillingStatus,
        checkTimeConflict,
        clearError,
        reset,
        setSelectedSchedule,
    };
}