"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConfig = void 0;
// src/shared/config/index.ts
__exportStar(require("./database"), exports);
// src/shared/config/database.ts
const path_1 = __importDefault(require("path"));
exports.DatabaseConfig = {
    // データベースファイルのパス（仮の設定）
    DATABASE_PATH: process.env.DATABASE_PATH || path_1.default.join(process.cwd(), 'data', 'database.sqlite'),
    // 接続設定
    CONNECTION: {
        TIMEOUT: 30000,
        BUSY_TIMEOUT: 30000,
        JOURNAL_MODE: 'WAL',
        SYNCHRONOUS: 'NORMAL',
        CACHE_SIZE: -64000, // 64MB
    },
};
//# sourceMappingURL=index.js.map