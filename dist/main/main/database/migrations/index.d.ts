import { Database } from 'sqlite3';
export interface Migration {
    id: number;
    name: string;
    up: (db: Database) => Promise<void>;
    down: (db: Database) => Promise<void>;
}
export declare const migrations: Migration[];
export declare class MigrationManager {
    private db;
    constructor(db: Database);
    runMigrations(): Promise<void>;
    private createMigrationTable;
    private getExecutedMigrations;
    private recordMigration;
}
