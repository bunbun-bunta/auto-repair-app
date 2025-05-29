"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
class BaseService {
    constructor(repository) {
        this.repository = repository;
    }
    async getAll() {
        return await this.repository.getAll();
    }
    async getById(id) {
        return await this.repository.getById(id);
    }
    async create(data) {
        return await this.repository.create(data);
    }
    async update(id, data) {
        return await this.repository.update(id, data);
    }
    async delete(id) {
        return await this.repository.delete(id);
    }
    async validateBeforeCreate(data) {
        // 子クラスでオーバーライドして独自のバリデーションを実装
    }
    async validateBeforeUpdate(id, data) {
        // 子クラスでオーバーライドして独自のバリデーションを実装
    }
}
exports.BaseService = BaseService;
//# sourceMappingURL=base-service.js.map