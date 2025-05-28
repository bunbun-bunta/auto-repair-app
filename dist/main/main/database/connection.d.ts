import sqlite3 from 'sqlite3';
export declare class DatabaseConnection {
    private db;
    private dbPath;
    constructor();
    connect(): Promise<sqlite3.Database>;
    private configurePragmas;
    close(): Promise<void>;
    getDatabase(): sqlite3.Database | null;
    getDatabasePath(): string;
}
export declare const dbConnection: DatabaseConnection;
