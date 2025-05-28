// src/shared/types/index.ts
export * from './staff';
export * from './api';

// src/shared/types/staff.ts
export interface Staff {
    id?: number;
    name: string;
    displayColor: string;
    email?: string;
    oauthStatus: OAuthStatus;
    permissionLevel: PermissionLevel;
    createdAt?: string;
    updatedAt?: string;
}

export interface StaffFormData extends Omit<Staff, 'id' | 'createdAt' | 'updatedAt'> { }

export type OAuthStatus = '未認証' | '認証済み' | '期限切れ' | 'エラー';
export type PermissionLevel = '管理者' | '一般';

// src/shared/types/api.ts
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}