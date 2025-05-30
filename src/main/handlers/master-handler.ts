// src/main/handlers/master-handler.ts
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { MasterService } from '../services/master-service';
import { VehicleType, Customer, BusinessCategory, ApiResponse } from '../../shared/types';

export class MasterHandler {
    private masterService: MasterService;

    constructor(masterService: MasterService) {
        this.masterService = masterService;
        this.registerHandlers();
    }

    private registerHandlers(): void {
        console.log('[MasterHandler] IPCハンドラー登録開始...');

        // ===== 車種マスタ =====
        ipcMain.handle('master:getVehicleTypes', this.handleGetVehicleTypes.bind(this));
        ipcMain.handle('master:createVehicleType', this.handleCreateVehicleType.bind(this));
        ipcMain.handle('master:deleteVehicleType', this.handleDeleteVehicleType.bind(this));
        ipcMain.handle('master:incrementVehicleTypeUsage', this.handleIncrementVehicleTypeUsage.bind(this));

        // ===== 顧客マスタ =====
        ipcMain.handle('master:getCustomers', this.handleGetCustomers.bind(this));
        ipcMain.handle('master:createCustomer', this.handleCreateCustomer.bind(this));
        ipcMain.handle('master:updateCustomer', this.handleUpdateCustomer.bind(this));
        ipcMain.handle('master:deleteCustomer', this.handleDeleteCustomer.bind(this));
        ipcMain.handle('master:incrementCustomerUsage', this.handleIncrementCustomerUsage.bind(this));

        // ===== 業務カテゴリマスタ =====
        ipcMain.handle('master:getBusinessCategories', this.handleGetBusinessCategories.bind(this));
        ipcMain.handle('master:createBusinessCategory', this.handleCreateBusinessCategory.bind(this));
        ipcMain.handle('master:updateBusinessCategory', this.handleUpdateBusinessCategory.bind(this));
        ipcMain.handle('master:deleteBusinessCategory', this.handleDeleteBusinessCategory.bind(this));
        ipcMain.handle('master:incrementBusinessCategoryUsage', this.handleIncrementBusinessCategoryUsage.bind(this));

        // ===== 統合機能 =====
        ipcMain.handle('master:getAllMasterData', this.handleGetAllMasterData.bind(this));
        ipcMain.handle('master:updateUsageFromSchedule', this.handleUpdateUsageFromSchedule.bind(this));

        console.log('[MasterHandler] IPCハンドラー登録完了');
    }

    // ===== 車種マスタハンドラー =====

    private async handleGetVehicleTypes(event: IpcMainInvokeEvent): Promise<ApiResponse<VehicleType[]>> {
        try {
            console.log('[MasterHandler] 車種一覧取得要求');
            return await this.masterService.getVehicleTypes();
        } catch (error) {
            console.error('[MasterHandler] 車種一覧取得エラー:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '業務カテゴリの削除でエラーが発生しました'
            };
        }
    }

    private async handleIncrementBusinessCategoryUsage(
        event: IpcMainInvokeEvent,
        name: string
    ): Promise<ApiResponse<void>> {
        try {
            return await this.masterService.incrementBusinessCategoryUsage(name);
        } catch (error) {
            console.error('[MasterHandler] 業務カテゴリ使用回数更新エラー:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '業務カテゴリ使用回数の更新でエラーが発生しました'
            };
        }
    }

    // ===== 統合機能ハンドラー =====

    private async handleGetAllMasterData(event: IpcMainInvokeEvent): Promise<ApiResponse<{
        vehicleTypes: VehicleType[];
        customers: Customer[];
        businessCategories: BusinessCategory[];
    }>> {
        try {
            console.log('[MasterHandler] 全マスタデータ取得要求');
            return await this.masterService.getAllMasterData();
        } catch (error) {
            console.error('[MasterHandler] 全マスタデータ取得エラー:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '全マスタデータの取得でエラーが発生しました'
            };
        }
    }

    private async handleUpdateUsageFromSchedule(
        event: IpcMainInvokeEvent,
        vehicleType?: string,
        customerName?: string,
        businessCategory?: string
    ): Promise<ApiResponse<void>> {
        try {
            console.log('[MasterHandler] 予定作成時の使用回数更新:', { vehicleType, customerName, businessCategory });
            
            await this.masterService.updateUsageCountsFromSchedule(vehicleType, customerName, businessCategory);
            
            return { success: true };
        } catch (error) {
            console.error('[MasterHandler] 使用回数更新エラー:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '使用回数の更新でエラーが発生しました'
            };
        }
    }
} '車種一覧の取得でエラーが発生しました'
            };
        }
    }

    private async handleCreateVehicleType(
        event: IpcMainInvokeEvent,
        name: string
    ): Promise<ApiResponse<VehicleType>> {
        try {
            console.log('[MasterHandler] 車種作成要求:', name);
            const result = await this.masterService.createVehicleType(name);

            if (result.success) {
                console.log(`[MasterHandler] 車種作成成功: ${name}`);
            } else {
                console.error('[MasterHandler] 車種作成失敗:', result.error);
            }

            return result;
        } catch (error) {
            console.error('[MasterHandler] 車種作成エラー:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '車種の作成でエラーが発生しました'
            };
        }
    }

    private async handleDeleteVehicleType(
        event: IpcMainInvokeEvent,
        id: number
    ): Promise<ApiResponse<void>> {
        try {
            console.log('[MasterHandler] 車種削除要求:', id);
            const result = await this.masterService.deleteVehicleType(id);

            if (result.success) {
                console.log(`[MasterHandler] 車種削除成功: ID ${id}`);
            } else {
                console.error('[MasterHandler] 車種削除失敗:', result.error);
            }

            return result;
        } catch (error) {
            console.error('[MasterHandler] 車種削除エラー:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '車種の削除でエラーが発生しました'
            };
        }
    }

    private async handleIncrementVehicleTypeUsage(
        event: IpcMainInvokeEvent,
        name: string
    ): Promise<ApiResponse<void>> {
        try {
            return await this.masterService.incrementVehicleTypeUsage(name);
        } catch (error) {
            console.error('[MasterHandler] 車種使用回数更新エラー:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '車種使用回数の更新でエラーが発生しました'
            };
        }
    }

    // ===== 顧客マスタハンドラー =====

    private async handleGetCustomers(event: IpcMainInvokeEvent): Promise<ApiResponse<Customer[]>> {
        try {
            console.log('[MasterHandler] 顧客一覧取得要求');
            return await this.masterService.getCustomers();
        } catch (error) {
            console.error('[MasterHandler] 顧客一覧取得エラー:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '顧客一覧の取得でエラーが発生しました'
            };
        }
    }

    private async handleCreateCustomer(
        event: IpcMainInvokeEvent,
        name: string,
        contactInfo?: string
    ): Promise<ApiResponse<Customer>> {
        try {
            console.log('[MasterHandler] 顧客作成要求:', name);
            const result = await this.masterService.createCustomer(name, contactInfo);

            if (result.success) {
                console.log(`[MasterHandler] 顧客作成成功: ${name}`);
            } else {
                console.error('[MasterHandler] 顧客作成失敗:', result.error);
            }

            return result;
        } catch (error) {
            console.error('[MasterHandler] 顧客作成エラー:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '顧客の作成でエラーが発生しました'
            };
        }
    }

    private async handleUpdateCustomer(
        event: IpcMainInvokeEvent,
        id: number,
        data: Partial<Customer>
    ): Promise<ApiResponse<Customer>> {
        try {
            console.log('[MasterHandler] 顧客更新要求:', id, Object.keys(data));
            const result = await this.masterService.updateCustomer(id, data);

            if (result.success) {
                console.log(`[MasterHandler] 顧客更新成功: ID ${id}`);
            } else {
                console.error('[MasterHandler] 顧客更新失敗:', result.error);
            }

            return result;
        } catch (error) {
            console.error('[MasterHandler] 顧客更新エラー:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '顧客の更新でエラーが発生しました'
            };
        }
    }

    private async handleDeleteCustomer(
        event: IpcMainInvokeEvent,
        id: number
    ): Promise<ApiResponse<void>> {
        try {
            console.log('[MasterHandler] 顧客削除要求:', id);
            const result = await this.masterService.deleteCustomer(id);

            if (result.success) {
                console.log(`[MasterHandler] 顧客削除成功: ID ${id}`);
            } else {
                console.error('[MasterHandler] 顧客削除失敗:', result.error);
            }

            return result;
        } catch (error) {
            console.error('[MasterHandler] 顧客削除エラー:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '顧客の削除でエラーが発生しました'
            };
        }
    }

    private async handleIncrementCustomerUsage(
        event: IpcMainInvokeEvent,
        name: string
    ): Promise<ApiResponse<void>> {
        try {
            return await this.masterService.incrementCustomerUsage(name);
        } catch (error) {
            console.error('[MasterHandler] 顧客使用回数更新エラー:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '顧客使用回数の更新でエラーが発生しました'
            };
        }
    }

    // ===== 業務カテゴリマスタハンドラー =====

    private async handleGetBusinessCategories(event: IpcMainInvokeEvent): Promise<ApiResponse<BusinessCategory[]>> {
        try {
            console.log('[MasterHandler] 業務カテゴリ一覧取得要求');
            return await this.masterService.getBusinessCategories();
        } catch (error) {
            console.error('[MasterHandler] 業務カテゴリ一覧取得エラー:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '業務カテゴリ一覧の取得でエラーが発生しました'
            };
        }
    }

    private async handleCreateBusinessCategory(
        event: IpcMainInvokeEvent,
        name: string,
        icon?: string,
        estimatedDuration?: number
    ): Promise<ApiResponse<BusinessCategory>> {
        try {
            console.log('[MasterHandler] 業務カテゴリ作成要求:', name);
            const result = await this.masterService.createBusinessCategory(name, icon, estimatedDuration);

            if (result.success) {
                console.log(`[MasterHandler] 業務カテゴリ作成成功: ${name}`);
            } else {
                console.error('[MasterHandler] 業務カテゴリ作成失敗:', result.error);
            }

            return result;
        } catch (error) {
            console.error('[MasterHandler] 業務カテゴリ作成エラー:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '業務カテゴリの作成でエラーが発生しました'
            };
        }
    }

    private async handleUpdateBusinessCategory(
        event: IpcMainInvokeEvent,
        id: number,
        data: Partial<BusinessCategory>
    ): Promise<ApiResponse<BusinessCategory>> {
        try {
            console.log('[MasterHandler] 業務カテゴリ更新要求:', id, Object.keys(data));
            const result = await this.masterService.updateBusinessCategory(id, data);

            if (result.success) {
                console.log(`[MasterHandler] 業務カテゴリ更新成功: ID ${id}`);
            } else {
                console.error('[MasterHandler] 業務カテゴリ更新失敗:', result.error);
            }

            return result;
        } catch (error) {
            console.error('[MasterHandler] 業務カテゴリ更新エラー:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '業務カテゴリの更新でエラーが発生しました'
            };
        }
    }

    private async handleDeleteBusinessCategory(
        event: IpcMainInvokeEvent,
        id: number
    ): Promise<ApiResponse<void>> {
        try {
            console.log('[MasterHandler] 業務カテゴリ削除要求:', id);
            const result = await this.masterService.deleteBusinessCategory(id);

            if (result.success) {
                console.log(`[MasterHandler] 業務カテゴリ削除成功: ID ${id}`);
            } else {
                console.error('[MasterHandler] 業務カテゴリ削除失敗:', result.error);
            }

            return result;
        } catch (error) {
            console.error('[MasterHandler] 業務カテゴリ削除エラー:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message :