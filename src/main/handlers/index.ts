// src/main/handlers/index.ts (完全版 - MasterHandler追加)
import { ServiceManager } from '../services';
import { StaffHandler } from './staff-handler';
import { ScheduleHandler } from './schedule-handler';
import { MasterHandler } from './master-handler';

export class HandlerManager {
    private serviceManager: ServiceManager;
    private staffHandler: StaffHandler | null = null;
    private scheduleHandler: ScheduleHandler | null = null;
    private masterHandler: MasterHandler | null = null;

    constructor() {
        this.serviceManager = new ServiceManager();
    }

    async initialize(): Promise<void> {
        try {
            console.log('[HandlerManager] ハンドラー初期化開始...');

            // サービスマネージャー初期化
            await this.serviceManager.initialize();

            // ハンドラー初期化
            const staffService = this.serviceManager.getStaffService();
            this.staffHandler = new StaffHandler(staffService);

            const scheduleService = this.serviceManager.getScheduleService();
            this.scheduleHandler = new ScheduleHandler(scheduleService);

            const masterService = this.serviceManager.getMasterService();
            this.masterHandler = new MasterHandler(masterService);

            console.log('[HandlerManager] 全ハンドラー初期化完了');
        } catch (error) {
            console.error('[HandlerManager] ハンドラー初期化失敗:', error);
            throw error;
        }
    }

    async close(): Promise<void> {
        try {
            console.log('[HandlerManager] ハンドラー終了処理開始...');

            // サービスマネージャー終了
            await this.serviceManager.close();

            // ハンドラー参照をクリア
            this.staffHandler = null;
            this.scheduleHandler = null;
            this.masterHandler = null;

            console.log('[HandlerManager] 全ハンドラー終了完了');
        } catch (error) {
            console.error('[HandlerManager] ハンドラー終了エラー:', error);
            throw error;
        }
    }

    // デバッグ用：ハンドラー状態確認
    async getHandlerStatus(): Promise<{
        services: any;
        handlers: {
            staff: boolean;
            schedule: boolean;
            master: boolean;
        };
    }> {
        try {
            const servicesStatus = await this.serviceManager.getServicesStatus();

            return {
                services: servicesStatus,
                handlers: {
                    staff: this.staffHandler !== null,
                    schedule: this.scheduleHandler !== null,
                    master: this.masterHandler !== null,
                }
            };
        } catch (error) {
            console.error('[HandlerManager] ステータス確認エラー:', error);
            return {
                services: { error: error instanceof Error ? error.message : 'Unknown error' },
                handlers: {
                    staff: false,
                    schedule: false,
                    master: false,
                }
            };
        }
    }
}