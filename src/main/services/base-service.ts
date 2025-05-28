// src/main/services/base-service.ts
import { BaseRepository } from '../database/repositories/base-repository';

export abstract class BaseService<T extends { id?: number }> {
    protected repository: BaseRepository<T>;

    constructor(repository: BaseRepository<T>) {
        this.repository = repository;
    }

    async getAll() {
        return await this.repository.getAll();
    }

    async getById(id: number) {
        return await this.repository.getById(id);
    }

    async create(data: Omit<T, 'id'>) {
        return await this.repository.create(data);
    }

    async update(id: number, data: Partial<Omit<T, 'id'>>) {
        return await this.repository.update(id, data);
    }

    async delete(id: number) {
        return await this.repository.delete(id);
    }

    protected async validateBeforeCreate(data: Omit<T, 'id'>): Promise<void> {
        // 子クラスでオーバーライドして独自のバリデーションを実装
    }

    protected async validateBeforeUpdate(id: number, data: Partial<Omit<T, 'id'>>): Promise<void> {
        // 子クラスでオーバーライドして独自のバリデーションを実装
    }
}