// src/main/services/index.ts (更新版 - MasterService追加)
import { DatabaseManager } from '../database';
import { StaffService } from './staff-service';
import { ScheduleService } from './schedule-service';
import { MasterService } from './master-service';

export class ServiceManager {
    private databaseManager: DatabaseManager;
    private staffService: StaffService | null = null;
    private scheduleService: ScheduleService | null = null;
    private masterService: MasterService | null = null;

    constructor() {
        this.databaseManager = new DatabaseManager();
    }

    async initialize(): Promise<void> {
        try {
            console.log('[ServiceManager] サービス初期化開始...');

            // データベース初期化
            await this.databaseManager.initialize();

            // サービス初期化
            const staffRepository = this.databaseManager.getStaffRepository();
            this.staffService = new StaffService(staffRepository);

            const scheduleRepository = this.databaseManager.getScheduleRepository();
            this.scheduleService = new ScheduleService(scheduleRepository);

            const masterRepository = this.databaseManager.getMasterRepository();
            this.masterService = new MasterService(masterRepository);

            console.log('[ServiceManager] 全サービス初期化完了');
        } catch (error) {
            console.error('[ServiceManager] サービス初期化失敗:', error);
            throw error;
        }
    }

    getStaffService(): StaffService {
        if (!this.staffService) {
            throw new Error('StaffService が初期化されていません');
        }
        return this.staffService;
    }

    getScheduleService(): ScheduleService {
        if (!this.scheduleService) {
            throw new Error('ScheduleService が初期化されていません');
        }
        return this.scheduleService;
    }

    getMasterService(): MasterService {
        if (!this.masterService) {
            throw new Error('MasterService が初期化されていません');
        }
        return this.masterService;
    }

    async close(): Promise<void> {
        try {
            console.log('[ServiceManager] サービス終了処理開始...');

            await this.databaseManager.close();

            this.staffService = null;
            this.scheduleService = null;
            this.masterService = null;

            console.log('[ServiceManager] 全サービス終了完了');
        } catch (error) {
            console.error('[ServiceManager] サービス終了エラー:', error);
            throw error;
        }
    }

    // デバッグ用：全サービスの状態確認
    async getServicesStatus(): Promise<{
        database: any;
        services: {
            staff: boolean;
            schedule: boolean;
            master: boolean;
        };
    }> {
        try {
            const databaseStatus = await this.databaseManager.getStatus();

            return {
                database: databaseStatus,
                services: {
                    staff: this.staffService !== null,
                    schedule: this.scheduleService !== null,
                    master: this.masterService !== null,
                }
            };
        } catch (error) {
            console.error('[ServiceManager] 状態確認エラー:', error);
            return {
                database: { connected: false, error: error instanceof Error ? error.message : 'Unknown error' },
                services: {
                    staff: false,
                    schedule: false,
                    master: false,
                }
            };
        }
    }
}