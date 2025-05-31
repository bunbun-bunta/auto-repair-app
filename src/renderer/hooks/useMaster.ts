// src/renderer/hooks/useMaster.ts - 完全版マスタデータ管理フック
import { useState, useCallback, useEffect } from 'react';
import { VehicleType, Customer, BusinessCategory, ApiResponse } from '@shared/types';

export interface UseMasterState {
    vehicleTypes: VehicleType[];
    customers: Customer[];
    businessCategories: BusinessCategory[];
    loading: boolean;
    error: string | null;
}

export interface UseMasterActions {
    loadAllMasterData: () => Promise<void>;

    // 車種マスタ
    createVehicleType: (name: string) => Promise<boolean>;
    deleteVehicleType: (id: number) => Promise<boolean>;
    incrementVehicleTypeUsage: (name: string) => Promise<void>;

    // 顧客マスタ
    createCustomer: (name: string, contactInfo?: string) => Promise<boolean>;
    updateCustomer: (id: number, data: Partial<Customer>) => Promise<boolean>;
    deleteCustomer: (id: number) => Promise<boolean>;
    incrementCustomerUsage: (name: string) => Promise<void>;

    // 業務カテゴリマスタ
    createBusinessCategory: (name: string, icon?: string, estimatedDuration?: number) => Promise<boolean>;
    updateBusinessCategory: (id: number, data: Partial<BusinessCategory>) => Promise<boolean>;
    deleteBusinessCategory: (id: number) => Promise<boolean>;
    incrementBusinessCategoryUsage: (name: string) => Promise<void>;

    // 共通
    clearError: () => void;
    reset: () => void;
}

export function useMaster(): UseMasterState & UseMasterActions {
    const [state, setState] = useState<UseMasterState>({
        vehicleTypes: [],
        customers: [],
        businessCategories: [],
        loading: false,
        error: null,
    });

    // 全マスタデータを読み込み
    const loadAllMasterData = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            if (!window.electronAPI?.master) {
                throw new Error('Electron APIが利用できません');
            }

            // 並行してすべてのマスタデータを取得
            const [vehicleTypesResponse, customersResponse, businessCategoriesResponse] =
                await Promise.all([
                    window.electronAPI.master.getVehicleTypes(),
                    window.electronAPI.master.getCustomers(),
                    window.electronAPI.master.getBusinessCategories()
                ]);

            setState(prev => ({
                ...prev,
                vehicleTypes: vehicleTypesResponse?.success ? (vehicleTypesResponse.data || []) : [],
                customers: customersResponse?.success ? (customersResponse.data || []) : [],
                businessCategories: businessCategoriesResponse?.success ? (businessCategoriesResponse.data || []) : [],
                loading: false
            }));

        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                vehicleTypes: [],
                customers: [],
                businessCategories: [],
                error: error instanceof Error ? error.message : 'マスタデータの読み込みに失敗しました'
            }));
        }
    }, []);

    // === 車種マスタ操作 ===

    const createVehicleType = useCallback(async (name: string): Promise<boolean> => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            if (!window.electronAPI?.master) {
                throw new Error('Electron APIが利用できません');
            }

            const response = await window.electronAPI.master.createVehicleType(name);

            if (response?.success) {
                await loadAllMasterData(); // データを再読み込み
                setState(prev => ({ ...prev, loading: false }));
                return true;
            } else {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: response?.error || '車種の作成に失敗しました'
                }));
                return false;
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : '車種の作成に失敗しました'
            }));
            return false;
        }
    }, [loadAllMasterData]);

    const deleteVehicleType = useCallback(async (id: number): Promise<boolean> => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            if (!window.electronAPI?.master) {
                throw new Error('Electron APIが利用できません');
            }

            const response = await window.electronAPI.master.deleteVehicleType(id);

            if (response?.success !== false) {
                await loadAllMasterData(); // データを再読み込み
                setState(prev => ({ ...prev, loading: false }));
                return true;
            } else {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: response?.error || '車種の削除に失敗しました'
                }));
                return false;
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : '車種の削除に失敗しました'
            }));
            return false;
        }
    }, [loadAllMasterData]);

    const incrementVehicleTypeUsage = useCallback(async (name: string): Promise<void> => {
        try {
            if (window.electronAPI?.master) {
                await window.electronAPI.master.incrementVehicleTypeUsage(name);
            }
        } catch (error) {
            console.error('車種使用回数の更新に失敗:', error);
        }
    }, []);

    // === 顧客マスタ操作 ===

    const createCustomer = useCallback(async (name: string, contactInfo?: string): Promise<boolean> => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            if (!window.electronAPI?.master) {
                throw new Error('Electron APIが利用できません');
            }

            const response = await window.electronAPI.master.createCustomer(name, contactInfo);

            if (response?.success) {
                await loadAllMasterData();
                setState(prev => ({ ...prev, loading: false }));
                return true;
            } else {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: response?.error || '顧客の作成に失敗しました'
                }));
                return false;
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : '顧客の作成に失敗しました'
            }));
            return false;
        }
    }, [loadAllMasterData]);

    const updateCustomer = useCallback(async (id: number, data: Partial<Customer>): Promise<boolean> => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            if (!window.electronAPI?.master) {
                throw new Error('Electron APIが利用できません');
            }

            const response = await window.electronAPI.master.updateCustomer(id, data);

            if (response?.success) {
                await loadAllMasterData();
                setState(prev => ({ ...prev, loading: false }));
                return true;
            } else {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: response?.error || '顧客の更新に失敗しました'
                }));
                return false;
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : '顧客の更新に失敗しました'
            }));
            return false;
        }
    }, [loadAllMasterData]);

    const deleteCustomer = useCallback(async (id: number): Promise<boolean> => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            if (!window.electronAPI?.master) {
                throw new Error('Electron APIが利用できません');
            }

            const response = await window.electronAPI.master.deleteCustomer(id);

            if (response?.success !== false) {
                await loadAllMasterData();
                setState(prev => ({ ...prev, loading: false }));
                return true;
            } else {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: response?.error || '顧客の削除に失敗しました'
                }));
                return false;
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : '顧客の削除に失敗しました'
            }));
            return false;
        }
    }, [loadAllMasterData]);

    const incrementCustomerUsage = useCallback(async (name: string): Promise<void> => {
        try {
            if (window.electronAPI?.master) {
                await window.electronAPI.master.incrementCustomerUsage(name);
            }
        } catch (error) {
            console.error('顧客使用回数の更新に失敗:', error);
        }
    }, []);

    // === 業務カテゴリマスタ操作 ===

    const createBusinessCategory = useCallback(async (
        name: string,
        icon?: string,
        estimatedDuration?: number
    ): Promise<boolean> => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            if (!window.electronAPI?.master) {
                throw new Error('Electron APIが利用できません');
            }

            const response = await window.electronAPI.master.createBusinessCategory(name, icon, estimatedDuration);

            if (response?.success) {
                await loadAllMasterData();
                setState(prev => ({ ...prev, loading: false }));
                return true;
            } else {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: response?.error || '業務カテゴリの作成に失敗しました'
                }));
                return false;
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : '業務カテゴリの作成に失敗しました'
            }));
            return false;
        }
    }, [loadAllMasterData]);

    const updateBusinessCategory = useCallback(async (id: number, data: Partial<BusinessCategory>): Promise<boolean> => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            if (!window.electronAPI?.master) {
                throw new Error('Electron APIが利用できません');
            }

            const response = await window.electronAPI.master.updateBusinessCategory(id, data);

            if (response?.success) {
                await loadAllMasterData();
                setState(prev => ({ ...prev, loading: false }));
                return true;
            } else {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: response?.error || '業務カテゴリの更新に失敗しました'
                }));
                return false;
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : '業務カテゴリの更新に失敗しました'
            }));
            return false;
        }
    }, [loadAllMasterData]);

    const deleteBusinessCategory = useCallback(async (id: number): Promise<boolean> => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            if (!window.electronAPI?.master) {
                throw new Error('Electron APIが利用できません');
            }

            const response = await window.electronAPI.master.deleteBusinessCategory(id);

            if (response?.success !== false) {
                await loadAllMasterData();
                setState(prev => ({ ...prev, loading: false }));
                return true;
            } else {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: response?.error || '業務カテゴリの削除に失敗しました'
                }));
                return false;
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : '業務カテゴリの削除に失敗しました'
            }));
            return false;
        }
    }, [loadAllMasterData]);

    const incrementBusinessCategoryUsage = useCallback(async (name: string): Promise<void> => {
        try {
            if (window.electronAPI?.master) {
                await window.electronAPI.master.incrementBusinessCategoryUsage(name);
            }
        } catch (error) {
            console.error('業務カテゴリ使用回数の更新に失敗:', error);
        }
    }, []);

    // === 共通操作 ===

    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    const reset = useCallback(() => {
        setState({
            vehicleTypes: [],
            customers: [],
            businessCategories: [],
            loading: false,
            error: null,
        });
    }, []);

    // 初回読み込み
    useEffect(() => {
        if (window.electronAPI?.master) {
            loadAllMasterData();
        }
    }, [loadAllMasterData]);

    return {
        ...state,
        loadAllMasterData,
        createVehicleType,
        deleteVehicleType,
        incrementVehicleTypeUsage,
        createCustomer,
        updateCustomer,
        deleteCustomer,
        incrementCustomerUsage,
        createBusinessCategory,
        updateBusinessCategory,
        deleteBusinessCategory,
        incrementBusinessCategoryUsage,
        clearError,
        reset,
    };
}