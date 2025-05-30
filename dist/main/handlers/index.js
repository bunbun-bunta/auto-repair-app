"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlerManager = void 0;
// src/main/handlers/index.ts （完全版 - ScheduleHandler追加）
const services_1 = require("../services");
const staff_handler_1 = require("./staff-handler");
const schedule_handler_1 = require("./schedule-handler");
class HandlerManager {
    constructor() {
        this.staffHandler = null;
        this.scheduleHandler = null;
        this.serviceManager = new services_1.ServiceManager();
    }
    async initialize() {
        // サービス初期化
        await this.serviceManager.initialize();
        // ハンドラー初期化
        const staffService = this.serviceManager.getStaffService();
        this.staffHandler = new staff_handler_1.StaffHandler(staffService);
        const scheduleService = this.serviceManager.getScheduleService();
        this.scheduleHandler = new schedule_handler_1.ScheduleHandler(scheduleService);
        console.log('Handlers initialized successfully');
    }
    async close() {
        await this.serviceManager.close();
        this.staffHandler = null;
        this.scheduleHandler = null;
        console.log('Handlers closed');
    }
}
exports.HandlerManager = HandlerManager;
//# sourceMappingURL=index.js.map