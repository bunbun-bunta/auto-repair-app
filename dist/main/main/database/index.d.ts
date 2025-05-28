export declare function initializeDatabase(): Promise<void>;
export declare function closeDatabase(): Promise<void>;
export declare function getDatabase(): import("sqlite3").Database | null;
export declare function getDatabasePath(): string;
