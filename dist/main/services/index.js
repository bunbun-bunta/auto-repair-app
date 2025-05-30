"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceManager = void 0;
// src/main/services/index.ts （修正版）
const database_1 = require("../database");
const staff_service_1 = require("./staff-service");
class ServiceManager {
    constructor() {
        this.staffService = null;
        this.databaseManager = new database_1.DatabaseManager();
    }
    async initialize() {
        // データベース初期化
        await this.databaseManager.initialize();
        // サービス初期化
        const staffRepository = this.databaseManager.getStaffRepository();
        this.staffService = new staff_service_1.StaffService(staffRepository);
        console.log('Services initialized successfully');
    }
    getStaffService() {
        if (!this.staffService) {
            throw new Error('StaffService not initialized');
        }
        return this.staffService;
    }
    async close() {
        await this.databaseManager.close();
        this.staffService = null;
        console.log('Services closed');
    }
}
exports.ServiceManager = ServiceManager;
//# sourceMappingURL=index.js.map