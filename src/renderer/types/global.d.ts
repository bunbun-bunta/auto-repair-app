// src/renderer/types/global.d.ts (修正版 - contextIsolation完全対応)
import { ApiResponse } from '@shared/types';

// Electronのプリロードスクリプトで公開されるAPI型定義
interface ElectronAPI {
    // 基本的なIPC通信
    invoke: (channel: string, ...args: any[]) => Promise<any>;

    // イベントリスナー
    on: (channel: string, callback: (...args: any[]) => void) => () => void;
    removeListener: (channel: string, callback: (...args: any[]) => void) => void;

    // システム情報
    getAppVersion: () => Promise<ApiResponse<{
        version: string;
        name: string;
    }>>;

    getAppPath: () => Promise<ApiResponse<{
        userData: string;
        documents: string;
        temp: string;
    }>>;

    // 通知
    showNotification: (title: string, body: string) => Promise<ApiResponse<{
        shown: boolean;
        message: string;
    }>>;

    // デバッグ・テスト用
    testConnection: () => Promise<ApiResponse<{
        status: string;
        timestamp: string;
        message: string;
    }>>;

    // スタッフ管理API
    staff: {
        getAll: () => Promise<ApiResponse<any[]>>;
        getById: (id: number) => Promise<ApiResponse<any>>;
        create: (data: any) => Promise<ApiResponse<any>>;
        update: (id: number, data: any) => Promise<ApiResponse<any>>;
        delete: (id: number) => Promise<ApiResponse<void>>;
        updateOAuthStatus: (id: number, status: string) => Promise<ApiResponse<any>>;
        getStatistics: () => Promise<ApiResponse<any>>;
        checkColorUsage: (color: string, excludeId?: number) => Promise<ApiResponse<{ isUsed: boolean }>>;
        checkDependencies: (id: number) => Promise<ApiResponse<{ hasSchedules: boolean; scheduleCount: number }>>;
    };


    // 予定管理API
    schedule: {
        getAll: () => Promise<ApiResponse<any[]>>;
        getById: (id: number) => Promise<ApiResponse<any>>;
        create: (data: any) => Promise<ApiResponse<any>>;
        update: (id: number, data: any) => Promise<ApiResponse<any>>;
        delete: (id: number) => Promise<ApiResponse<void>>;
        search: (params: any) => Promise<ApiResponse<any[]>>;
        getByDateRange: (startDate: string, endDate: string) => Promise<ApiResponse<any[]>>;
        getToday: () => Promise<ApiResponse<any[]>>;
        getMonthlyStatistics: (year: number, month: number) => Promise<ApiResponse<any>>;
        complete: (id: number, actualEndDatetime?: string) => Promise<ApiResponse<any>>;
        updateBillingStatus: (id: number, status: string) => Promise<ApiResponse<any>>;
        checkTimeConflict: (staffId: number, startDatetime: string, endDatetime: string, excludeScheduleId?: number) => Promise<ApiResponse<{ hasConflict: boolean; conflictingSchedules: any[] }>>;
        getUnsynced: () => Promise<ApiResponse<any[]>>;
        updateGoogleEventId: (scheduleId: number, googleEventId: string) => Promise<ApiResponse<void>>;
    };

    // マスタデータ管理API
    master: {
        // 車種マスタ
        getVehicleTypes: () => Promise<ApiResponse<any[]>>;
        createVehicleType: (name: string) => Promise<ApiResponse<any>>;
        deleteVehicleType: (id: number) => Promise<ApiResponse<void>>;
        incrementVehicleTypeUsage: (name: string) => Promise<ApiResponse<void>>;

        // 顧客マスタ
        getCustomers: () => Promise<ApiResponse<any[]>>;
        createCustomer: (name: string, contactInfo?: string) => Promise<ApiResponse<any>>;
        updateCustomer: (id: number, data: any) => Promise<ApiResponse<any>>;
        deleteCustomer: (id: number) => Promise<ApiResponse<void>>;
        incrementCustomerUsage: (name: string) => Promise<ApiResponse<void>>;

        // 業務カテゴリマスタ
        getBusinessCategories: () => Promise<ApiResponse<any[]>>;
        createBusinessCategory: (name: string, icon?: string, estimatedDuration?: number) => Promise<ApiResponse<any>>;
        updateBusinessCategory: (id: number, data: any) => Promise<ApiResponse<any>>;
        deleteBusinessCategory: (id: number) => Promise<ApiResponse<void>>;
        incrementBusinessCategoryUsage: (name: string) => Promise<ApiResponse<void>>;

        // 統合機能
        getAllMasterData: () => Promise<ApiResponse<{
            vehicleTypes: any[];
            customers: any[];
            businessCategories: any[];
        }>>;
        updateUsageFromSchedule: (vehicleType?: string, customerName?: string, businessCategory?: string) => Promise<ApiResponse<void>>;
    };

    // デバッグ機能
    _debug: {
        listChannels: () => string[];
        getStatus: () => any;
        test: () => string;
    };
}

// グローバルなWindow型を拡張
declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }

    // Node.jsのglobalも定義（念のため）
    var electronAPI: ElectronAPI;
}

// 空のexportでモジュール化
export { };

// 追加: Electronの型定義をaugment
declare module '*.tsx' {
    import { ComponentType } from 'react';
    const component: ComponentType<any>;
    export default component;
}

declare module '*.ts' {
    const content: any;
    export default content;
}
