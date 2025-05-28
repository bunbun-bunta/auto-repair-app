// src/main/handlers/base-handler.ts
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { ApiResponse } from '../../shared/types';
import { BaseService } from '../services/base-service';

export abstract class BaseHandler<T extends { id?: number }> {
    protected service: BaseService<T>;
    protected channelPrefix: string;

    constructor(service: BaseService<T>, channelPrefix: string) {
        this.service = service;
        this.channelPrefix = channelPrefix;
        this.registerHandlers();
    }

    protected registerHandlers(): void {
        ipcMain.handle(`${this.channelPrefix}:getAll`, this.handleGetAll.bind(this));
        ipcMain.handle(`${this.channelPrefix}:getById`, this.handleGetById.bind(this));
        ipcMain.handle(`${this.channelPrefix}:create`, this.handleCreate.bind(this));
        ipcMain.handle(`${this.channelPrefix}:update`, this.handleUpdate.bind(this));
        ipcMain.handle(`${this.channelPrefix}:delete`, this.handleDelete.bind(this));
    }

    protected async handleGetAll(event: IpcMainInvokeEvent): Promise<ApiResponse<T[]>> {
        try {
            return await this.service.getAll();
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    protected async handleGetById(event: IpcMainInvokeEvent, id: number): Promise<ApiResponse<T>> {
        try {
            return await this.service.getById(id);
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    protected async handleCreate(
        event: IpcMainInvokeEvent,
        data: Omit<T, 'id'>
    ): Promise<ApiResponse<T>> {
        try {
            return await this.service.create(data);
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    protected async handleUpdate(
        event: IpcMainInvokeEvent,
        id: number,
        data: Partial<Omit<T, 'id'>>
    ): Promise<ApiResponse<T>> {
        try {
            return await this.service.update(id, data);
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    protected async handleDelete(event: IpcMainInvokeEvent, id: number): Promise<ApiResponse<void>> {
        try {
            return await this.service.delete(id);
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}