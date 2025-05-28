export declare const DatabaseConfig: {
    readonly CONNECTION: {
        readonly TIMEOUT: 30000;
        readonly BUSY_TIMEOUT: 30000;
        readonly JOURNAL_MODE: "WAL";
        readonly SYNCHRONOUS: "NORMAL";
        readonly CACHE_SIZE: -64000;
    };
    readonly BACKUP: {
        readonly ENABLED: true;
        readonly INTERVAL: number;
        readonly MAX_BACKUPS: 30;
    };
    readonly PERFORMANCE: {
        readonly ENABLE_FOREIGN_KEYS: true;
        readonly ENABLE_TRIGGERS: true;
        readonly AUTO_VACUUM: "INCREMENTAL";
        readonly PAGE_SIZE: 4096;
    };
};
