// src/renderer/services/api/base-api.ts
import { ApiResponse } from '../../../shared/types';

export abstract class BaseApi<T extends { id?: number }> {
    protected channelPrefix: string;

    constructor(channelPrefix: string) {
        this.channelPrefix = channelPrefix;
    }

    protected async invoke<R = any>(channel: string, ...args: any[]): Promise<R> {
        if (!window.electronAPI) {
            throw new Error('Electron API not available');
        }

        // 型安全性を確保するため、anyとして扱ってから適切な型にキャスト
        const result = await window.electronAPI.invoke(channel, ...args);
        return result as R;
    }

    async getAll(): Promise<ApiResponse<T[]>> {
        return this.invoke<ApiResponse<T[]>>(`${this.channelPrefix}:getAll`);
    }

    async getById(id: number): Promise<ApiResponse<T>> {
        return this.invoke<ApiResponse<T>>(`${this.channelPrefix}:getById`, id);
    }

    async create(data: Omit<T, 'id'>): Promise<ApiResponse<T>> {
        return this.invoke<ApiResponse<T>>(`${this.channelPrefix}:create`, data);
    }

    async update(id: number, data: Partial<Omit<T, 'id'>>): Promise<ApiResponse<T>> {
        return this.invoke<ApiResponse<T>>(`${this.channelPrefix}:update`, id, data);
    }

    async delete(id: number): Promise<ApiResponse<void>> {
        return this.invoke<ApiResponse<void>>(`${this.channelPrefix}:delete`, id);
    }
}