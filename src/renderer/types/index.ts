// src/renderer/types/index.ts
// 共有型定義をre-export 
export * from '@shared/types';

// レンダラー固有の型定義
export interface UIState {
    loading: boolean;
    error: string | null;
}

export interface FormState<T> extends UIState {
    data: T;
    isDirty: boolean;
    isValid: boolean;
}

// ナビゲーション関連
export type NavigationTab = 'dashboard' | 'staff' | 'schedule' | 'calendar' | 'settings';

export interface NavigationItem {
    id: NavigationTab;
    label: string;
    icon: string;
    description: string;
    available: boolean;
}