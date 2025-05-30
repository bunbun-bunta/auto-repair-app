// src/main/services/index.ts (更新版 - ScheduleService追加)
import { DatabaseManager } from '../database';
import { StaffService } from './staff-service';
import { ScheduleService } from './schedule-service';

export class ServiceManager {
    private databaseManager: DatabaseManager;
    private staffService: StaffService | null = null;
    private scheduleService: ScheduleService | null = null;

    constructor() {
        this.databaseManager = new DatabaseManager();
    }

    async initialize(): Promise<void> {
        // データベース初期化
        await this.databaseManager.initialize();

        // サービス初期化
        const staffRepository = this.databaseManager.getStaffRepository();
        this.staffService = new StaffService(staffRepository);

        const scheduleRepository = this.databaseManager.getScheduleRepository();
        this.scheduleService = new ScheduleService(scheduleRepository);

        console.log('Services initialized successfully');
    }

    getStaffService(): StaffService {
        if (!this.staffService) {
            throw new Error('StaffService not initialized');
        }
        return this.staffService;
    }

    getScheduleService(): ScheduleService {
        if (!this.scheduleService) {
            throw new Error('ScheduleService not initialized');
        }
        return this.scheduleService;
    }

    async close(): Promise<void> {
        await this.databaseManager.close();
        this.staffService = null;
        this.scheduleService = null;
        console.log('Services closed');
    }
}