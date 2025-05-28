// src/main/services/index.ts （修正版）
import { DatabaseManager } from '../database';
import { StaffService } from './staff-service';

export class ServiceManager {
    private databaseManager: DatabaseManager;
    private staffService: StaffService | null = null;

    constructor() {
        this.databaseManager = new DatabaseManager();
    }

    async initialize(): Promise<void> {
        // データベース初期化
        await this.databaseManager.initialize();

        // サービス初期化
        const staffRepository = this.databaseManager.getStaffRepository();
        this.staffService = new StaffService(staffRepository);

        console.log('Services initialized successfully');
    }

    getStaffService(): StaffService {
        if (!this.staffService) {
            throw new Error('StaffService not initialized');
        }
        return this.staffService;
    }

    async close(): Promise<void> {
        await this.databaseManager.close();
        this.staffService = null;
        console.log('Services closed');
    }
}