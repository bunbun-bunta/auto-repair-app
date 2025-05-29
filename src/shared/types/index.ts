// src/shared/types/index.ts
export * from './staff';
export * from './schedule';
export * from './master';
export * from './calendar';
export * from './api';

// 基本的なAPI応答型
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