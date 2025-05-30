"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceManager = void 0;
// src/main/services/index.ts (更新版 - ScheduleService追加)
const database_1 = require("../database");
const staff_service_1 = require("./staff-service");
const schedule_service_1 = require("./schedule-service");
class ServiceManager {
    constructor() {
        this.staffService = null;
        this.scheduleService = null;
        this.databaseManager = new database_1.DatabaseManager();
    }
    async initialize() {
        // データベース初期化
        await this.databaseManager.initialize();
        // サービス初期化
        const staffRepository = this.databaseManager.getStaffRepository();
        this.staffService = new staff_service_1.StaffService(staffRepository);
        const scheduleRepository = this.databaseManager.getScheduleRepository();
        this.scheduleService = new schedule_service_1.ScheduleService(scheduleRepository);
        console.log('Services initialized successfully');
    }
    getStaffService() {
        if (!this.staffService) {
            throw new Error('StaffService not initialized');
        }
        return this.staffService;
    }
    getScheduleService() {
        if (!this.scheduleService) {
            throw new Error('ScheduleService not initialized');
        }
        return this.scheduleService;
    }
    async close() {
        await this.databaseManager.close();
        this.staffService = null;
        this.scheduleService = null;
        console.log('Services closed');
    }
}
exports.ServiceManager = ServiceManager;
//# sourceMappingURL=index.js.map