"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlerManager = void 0;
// src/main/handlers/index.ts （修正版）
const services_1 = require("../services");
const staff_handler_1 = require("./staff-handler");
class HandlerManager {
    constructor() {
        this.staffHandler = null;
        this.serviceManager = new services_1.ServiceManager();
    }
    async initialize() {
        // サービス初期化
        await this.serviceManager.initialize();
        // ハンドラー初期化
        const staffService = this.serviceManager.getStaffService();
        this.staffHandler = new staff_handler_1.StaffHandler(staffService);
        console.log('Handlers initialized successfully');
    }
    async close() {
        await this.serviceManager.close();
        this.staffHandler = null;
        console.log('Handlers closed');
    }
}
exports.HandlerManager = HandlerManager;
//# sourceMappingURL=index.js.map