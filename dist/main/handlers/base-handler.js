"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseHandler = void 0;
// src/main/handlers/base-handler.ts
const electron_1 = require("electron");
class BaseHandler {
    constructor(service, channelPrefix) {
        this.service = service;
        this.channelPrefix = channelPrefix;
        this.registerHandlers();
    }
    registerHandlers() {
        electron_1.ipcMain.handle(`${this.channelPrefix}:getAll`, this.handleGetAll.bind(this));
        electron_1.ipcMain.handle(`${this.channelPrefix}:getById`, this.handleGetById.bind(this));
        electron_1.ipcMain.handle(`${this.channelPrefix}:create`, this.handleCreate.bind(this));
        electron_1.ipcMain.handle(`${this.channelPrefix}:update`, this.handleUpdate.bind(this));
        electron_1.ipcMain.handle(`${this.channelPrefix}:delete`, this.handleDelete.bind(this));
    }
    async handleGetAll(event) {
        try {
            return await this.service.getAll();
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async handleGetById(event, id) {
        try {
            return await this.service.getById(id);
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async handleCreate(event, data) {
        try {
            return await this.service.create(data);
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async handleUpdate(event, id, data) {
        try {
            return await this.service.update(id, data);
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async handleDelete(event, id) {
        try {
            return await this.service.delete(id);
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}
exports.BaseHandler = BaseHandler;
//# sourceMappingURL=base-handler.js.map