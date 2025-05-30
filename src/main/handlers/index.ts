// src/main/handlers/index.ts （完全版 - ScheduleHandler追加）
import { ServiceManager } from '../services';
import { StaffHandler } from './staff-handler';
import { ScheduleHandler } from './schedule-handler';

export class HandlerManager {
    private serviceManager: ServiceManager;
    private staffHandler: StaffHandler | null = null;
    private scheduleHandler: ScheduleHandler | null = null;

    constructor() {
        this.serviceManager = new ServiceManager();
    }

    async initialize(): Promise<void> {
        // サービス初期化
        await this.serviceManager.initialize();

        // ハンドラー初期化
        const staffService = this.serviceManager.getStaffService();
        this.staffHandler = new StaffHandler(staffService);

        const scheduleService = this.serviceManager.getScheduleService();
        this.scheduleHandler = new ScheduleHandler(scheduleService);

        console.log('Handlers initialized successfully');
    }

    async close(): Promise<void> {
        await this.serviceManager.close();
        this.staffHandler = null;
        this.scheduleHandler = null;
        console.log('Handlers closed');
    }
}