// src/main/handlers/index.ts （修正版）
import { ServiceManager } from '../services';
import { StaffHandler } from './staff-handler';

export class HandlerManager {
    private serviceManager: ServiceManager;
    private staffHandler: StaffHandler | null = null;

    constructor() {
        this.serviceManager = new ServiceManager();
    }

    async initialize(): Promise<void> {
        // サービス初期化
        await this.serviceManager.initialize();

        // ハンドラー初期化
        const staffService = this.serviceManager.getStaffService();
        this.staffHandler = new StaffHandler(staffService);

        console.log('Handlers initialized successfully');
    }

    async close(): Promise<void> {
        await this.serviceManager.close();
        this.staffHandler = null;
        console.log('Handlers closed');
    }
}